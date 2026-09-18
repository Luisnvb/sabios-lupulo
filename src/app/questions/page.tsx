import Link from "next/link";
import { listQuestions } from "@/lib/dal/questions";
import type { SortColumn, SortDirection } from "@/lib/dal/questions";
import { AnswerReveal } from "@/components/answer-reveal";
import { DeleteQuestionButton } from "@/components/delete-question-button";
import {
  QUESTION_CATEGORY_VALUES,
  QUESTION_CATEGORY_LABELS,
  QUESTION_DIFFICULTY_VALUES,
  QUESTION_DIFFICULTY_LABELS,
  type QuestionCategory,
  type QuestionDifficulty,
} from "@/lib/reference/categories";

const PAGE_SIZE = 20;

const SORTABLE_COLUMNS: { key: SortColumn; label: string }[] = [
  { key: "text", label: "Pregunta" },
  { key: "category", label: "Categoría" },
  { key: "difficulty", label: "Dificultad" },
  { key: "createdAt", label: "Creada" },
];

const INPUT_CLASS =
  "block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

export const dynamic = "force-dynamic";

type RawSearchParams = { [key: string]: string | string[] | undefined };

function toSingle(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function isQuestionCategory(value: string | undefined): value is QuestionCategory {
  return !!value && (QUESTION_CATEGORY_VALUES as readonly string[]).includes(value);
}

function isQuestionDifficulty(value: string | undefined): value is QuestionDifficulty {
  return !!value && (QUESTION_DIFFICULTY_VALUES as readonly string[]).includes(value);
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const query = toSingle(rawParams.query)?.trim() || undefined;
  const categoryParam = toSingle(rawParams.category);
  const category = isQuestionCategory(categoryParam) ? categoryParam : undefined;
  const difficultyParam = toSingle(rawParams.difficulty);
  const difficulty = isQuestionDifficulty(difficultyParam) ? difficultyParam : undefined;
  const sortByParam = toSingle(rawParams.sortBy);
  const sortDirParam = toSingle(rawParams.sortDir);
  const sortBy: SortColumn = SORTABLE_COLUMNS.some((c) => c.key === sortByParam)
    ? (sortByParam as SortColumn)
    : "createdAt";
  const sortDir: SortDirection = sortDirParam === "asc" ? "asc" : "desc";
  const page = toPositiveInt(toSingle(rawParams.page)) ?? 1;

  const result = await listQuestions({
    query,
    category,
    difficulty,
    sortBy,
    sortDir,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  function hrefFor(overrides: Record<string, string | undefined>): string {
    const merged: Record<string, string | undefined> = {
      query,
      category,
      difficulty,
      sortBy,
      sortDir,
      page: page !== 1 ? String(page) : undefined,
      ...overrides,
    };
    const usp = new URLSearchParams();
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "") usp.set(key, value);
    }
    const qs = usp.toString();
    return qs ? `/questions?${qs}` : "/questions";
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Preguntas</h1>
        <div className="flex gap-3 text-sm font-medium">
          <Link
            href="/questions/new"
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            + Nueva pregunta
          </Link>
          <Link
            href="/categorias"
            className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            Ver categorías
          </Link>
        </div>
      </div>

      <form
        method="get"
        action="/questions"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
      >
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-stone-600">Buscar</label>
          <input
            type="text"
            name="query"
            placeholder="Buscar en el texto de la pregunta..."
            defaultValue={query ?? ""}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Categoría</label>
          <select name="category" defaultValue={category ?? ""} className={INPUT_CLASS}>
            <option value="">Todas las categorías</option>
            {QUESTION_CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>
                {QUESTION_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">Dificultad</label>
          <select name="difficulty" defaultValue={difficulty ?? ""} className={INPUT_CLASS}>
            <option value="">Todas</option>
            {QUESTION_DIFFICULTY_VALUES.map((d) => (
              <option key={d} value={d}>
                {QUESTION_DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
        </div>
        <input type="hidden" name="sortBy" value={sortBy} />
        <input type="hidden" name="sortDir" value={sortDir} />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-stone-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-900"
        >
          Filtrar
        </button>
      </form>

      {result.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-stone-500">
          No hay preguntas que coincidan con los filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-stone-100 text-xs font-semibold uppercase tracking-wide text-stone-500">
              <tr>
                {SORTABLE_COLUMNS.map((col) => {
                  const isActive = sortBy === col.key;
                  const nextDir = isActive && sortDir === "asc" ? "desc" : "asc";
                  return (
                    <th key={col.key} className="px-4 py-3">
                      <Link
                        href={hrefFor({ sortBy: col.key, sortDir: nextDir, page: undefined })}
                        className="inline-flex items-center gap-1 hover:text-amber-700"
                      >
                        {col.label}
                        {isActive ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                      </Link>
                    </th>
                  );
                })}
                <th className="px-4 py-3">Imagen</th>
                <th className="px-4 py-3">Respuesta</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {result.items.map((q) => (
                <tr key={q.id} className="hover:bg-amber-50/40">
                  <td className="max-w-sm px-4 py-3 align-top text-stone-800">{q.text}</td>
                  <td className="px-4 py-3 align-top text-stone-600">
                    {QUESTION_CATEGORY_LABELS[q.category]}
                  </td>
                  <td className="px-4 py-3 align-top text-stone-600">
                    {QUESTION_DIFFICULTY_LABELS[q.difficulty]}
                  </td>
                  <td className="px-4 py-3 align-top text-stone-600">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 align-top text-stone-600">
                    {q.imageUrl ? "🖼️" : "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <AnswerReveal options={q.options} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/questions/${q.id}/edit`}
                        className="font-medium text-amber-700 hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteQuestionButton questionId={q.id} questionText={q.text} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav className="flex items-center justify-between text-sm text-stone-600">
        <div>
          {page > 1 ? (
            <Link
              href={hrefFor({ page: String(page - 1) })}
              className="font-medium text-amber-700 hover:underline"
            >
              « Anterior
            </Link>
          ) : (
            <span />
          )}
        </div>
        <span>
          Página {page} de {totalPages} ({result.total} preguntas)
        </span>
        <div>
          {page < totalPages ? (
            <Link
              href={hrefFor({ page: String(page + 1) })}
              className="font-medium text-amber-700 hover:underline"
            >
              Siguiente »
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </main>
  );
}
