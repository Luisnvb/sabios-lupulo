import { and, asc, desc, eq, ilike, sql, SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { question, answerOption } from "@/db/schema";
import type { QuestionCategory, QuestionDifficulty } from "@/lib/reference/categories";
import type { QuestionInput } from "@/lib/validation/question";

/**
 * Único módulo con acceso directo a Drizzle/Postgres (Server Components,
 * Server Actions y route handlers deben pasar por aquí, nunca importar
 * `db` directamente), igual que en trivia-friends.
 */

export type QuestionWithOptions = {
  id: number;
  category: QuestionCategory;
  text: string;
  difficulty: QuestionDifficulty;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
    sortOrder: number;
  }[];
};

export type GetRandomQuestionsParams = {
  count: number;
  categories?: QuestionCategory[];
  difficulty?: QuestionDifficulty;
};

export async function getRandomQuestions(
  params: GetRandomQuestionsParams
): Promise<QuestionWithOptions[]> {
  const filters: SQL[] = [];
  if (params.categories && params.categories.length > 0) {
    filters.push(sql`${question.category} IN ${params.categories}`);
  }
  if (params.difficulty !== undefined) {
    filters.push(eq(question.difficulty, params.difficulty));
  }

  const rows = await db.query.question.findMany({
    where: filters.length > 0 ? and(...filters) : undefined,
    orderBy: sql`random()`,
    limit: params.count,
    with: {
      answerOptions: {
        orderBy: (opt, { asc: ascFn }) => [ascFn(opt.sortOrder)],
      },
    },
  });

  return rows.map(toQuestionWithOptions);
}

export type CategoryCount = { category: QuestionCategory; count: number };

export async function countQuestionsByCategory(): Promise<CategoryCount[]> {
  const rows = await db
    .select({
      category: question.category,
      count: sql<number>`count(*)::int`,
    })
    .from(question)
    .groupBy(question.category);

  return rows;
}

export type SortColumn = "text" | "category" | "difficulty" | "createdAt";
export type SortDirection = "asc" | "desc";

export type ListQuestionsParams = {
  query?: string;
  category?: QuestionCategory;
  difficulty?: QuestionDifficulty;
  sortBy?: SortColumn;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
};

export type ListQuestionsResult = {
  items: QuestionWithOptions[];
  page: number;
  pageSize: number;
  total: number;
};

const DEFAULT_PAGE_SIZE = 20;

function sortColumnToExpr(sortBy: SortColumn) {
  switch (sortBy) {
    case "text":
      return question.text;
    case "category":
      return question.category;
    case "difficulty":
      return question.difficulty;
    case "createdAt":
      return question.createdAt;
  }
}

/** Listado con búsqueda, filtros, orden y paginación (misma forma que trivia-friends). */
export async function listQuestions(
  params: ListQuestionsParams = {}
): Promise<ListQuestionsResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sortBy = params.sortBy ?? "createdAt";
  const sortDir = params.sortDir ?? "desc";

  const filters: SQL[] = [];
  if (params.query) {
    filters.push(ilike(question.text, `%${params.query}%`));
  }
  if (params.category !== undefined) {
    filters.push(eq(question.category, params.category));
  }
  if (params.difficulty !== undefined) {
    filters.push(eq(question.difficulty, params.difficulty));
  }
  const where = filters.length > 0 ? and(...filters) : undefined;

  const orderExpr = sortColumnToExpr(sortBy);
  const orderBy = sortDir === "asc" ? asc(orderExpr) : desc(orderExpr);

  const rows = await db.query.question.findMany({
    where,
    orderBy,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    with: {
      answerOptions: {
        orderBy: (opt, { asc: ascFn }) => [ascFn(opt.sortOrder)],
      },
    },
  });

  const totalRows = await db.select({ id: question.id }).from(question).where(where);

  return {
    items: rows.map(toQuestionWithOptions),
    page,
    pageSize,
    total: totalRows.length,
  };
}

export async function getQuestionById(id: number): Promise<QuestionWithOptions | null> {
  const row = await db.query.question.findFirst({
    where: eq(question.id, id),
    with: {
      answerOptions: {
        orderBy: (opt, { asc: ascFn }) => [ascFn(opt.sortOrder)],
      },
    },
  });
  return row ? toQuestionWithOptions(row) : null;
}

/** Crea pregunta + 4 opciones en una transacción. */
export async function createQuestion(input: QuestionInput): Promise<QuestionWithOptions> {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(question)
      .values({
        category: input.category,
        text: input.text,
        difficulty: input.difficulty,
        imageUrl: input.imageUrl,
      })
      .returning();

    if (!created) {
      throw new Error("No se pudo crear la pregunta.");
    }

    const insertedOptions = await tx
      .insert(answerOption)
      .values(
        input.options.map((opt, index) => ({
          questionId: created.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          sortOrder: index,
        }))
      )
      .returning();

    return toQuestionWithOptions({ ...created, answerOptions: insertedOptions });
  });
}

/** Actualiza pregunta y reemplaza sus opciones (estrategia delete + insert). */
export async function updateQuestion(
  id: number,
  input: QuestionInput
): Promise<QuestionWithOptions> {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(question)
      .set({
        category: input.category,
        text: input.text,
        difficulty: input.difficulty,
        imageUrl: input.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(question.id, id))
      .returning();

    if (!updated) {
      throw new Error(`No existe la pregunta con id ${id}.`);
    }

    await tx.delete(answerOption).where(eq(answerOption.questionId, id));

    const insertedOptions = await tx
      .insert(answerOption)
      .values(
        input.options.map((opt, index) => ({
          questionId: id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          sortOrder: index,
        }))
      )
      .returning();

    return toQuestionWithOptions({ ...updated, answerOptions: insertedOptions });
  });
}

/** Las AnswerOption asociadas se eliminan vía ON DELETE CASCADE del esquema. */
export async function deleteQuestion(id: number): Promise<void> {
  await db.delete(question).where(eq(question.id, id));
}

function toQuestionWithOptions(row: {
  id: number;
  category: string;
  text: string;
  difficulty: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  answerOptions: {
    id: number;
    text: string;
    isCorrect: boolean;
    sortOrder: number;
  }[];
}): QuestionWithOptions {
  return {
    id: row.id,
    category: row.category as QuestionCategory,
    text: row.text,
    difficulty: row.difficulty as QuestionDifficulty,
    imageUrl: row.imageUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    options: row.answerOptions,
  };
}

export { question, answerOption };
