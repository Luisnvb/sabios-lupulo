import "./load-env";
import { db } from "./client";
import { question, answerOption } from "./schema";
import type { QuestionCategory, QuestionDifficulty } from "@/lib/reference/categories";
import type {
  StandardQuestionSeed,
  FlagQuestionSeed,
  AnimalQuestionSeed,
} from "./data/types";

import { geographyQuestions } from "./data/geography";
import { artLiteratureQuestions } from "./data/art-literature";
import { historyQuestions } from "./data/history";
import { entertainmentQuestions } from "./data/entertainment";
import { scienceNatureQuestions } from "./data/science-nature";
import { sportsQuestions } from "./data/sports";
import { flagQuestions } from "./data/flags";
import { animalQuestions } from "./data/animals";

/**
 * Puebla la tabla `question` con el banco completo de Sabios del Lúpulo
 * (~100 preguntas por categoría). Ejecutar con `npm run db:seed` tras
 * aplicar las migraciones.
 *
 * Para "flags" y "animals" la imagen NO viene en los datos fuente (para
 * evitar URLs inventadas/rotas): se construye o se resuelve aquí mismo,
 * bandera vía flagcdn.com (determinista a partir del ISO2) y animal vía la
 * miniatura de Wikipedia en español (consulta en vivo a su API pública).
 */

type PreparedOption = { text: string; isCorrect: boolean };
type PreparedQuestion = {
  category: QuestionCategory;
  text: string;
  difficulty: QuestionDifficulty;
  imageUrl: string | null;
  options: PreparedOption[];
};

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
  }
  return arr;
}

function prepareStandard(
  category: QuestionCategory,
  items: StandardQuestionSeed[]
): PreparedQuestion[] {
  return items.map((item) => {
    const options: PreparedOption[] = item.options.map((text, i) => ({
      text,
      isCorrect: i === item.correctIndex,
    }));
    return {
      category,
      text: item.text,
      difficulty: item.difficulty ?? "medium",
      imageUrl: null,
      options: shuffle(options),
    };
  });
}

const WIKI_HEADERS = {
  "User-Agent": "sabios-lupulo-seed/1.0 (https://github.com/; contacto: luisnvb@gmail.com)",
};

async function fetchWikipediaThumbnail(title: string): Promise<string | null> {
  const url =
    "https://es.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=640&redirects=1&titles=" +
    encodeURIComponent(title);
  try {
    const res = await fetch(url, { headers: WIKI_HEADERS });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
    };
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      const item = items[current] as T;
      results[current] = await fn(item, current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
  return results;
}

async function prepareFlags(items: FlagQuestionSeed[]): Promise<PreparedQuestion[]> {
  return items.map((item) => {
    const options: PreparedOption[] = [
      { text: item.country, isCorrect: true },
      ...item.distractors.map((text) => ({ text, isCorrect: false })),
    ];
    return {
      category: "flags" as const,
      text: "¿A qué país pertenece esta bandera?",
      difficulty: item.difficulty ?? "medium",
      imageUrl: `https://flagcdn.com/w640/${item.iso2.toLowerCase()}.png`,
      options: shuffle(options),
    };
  });
}

async function prepareAnimals(items: AnimalQuestionSeed[]): Promise<PreparedQuestion[]> {
  console.log(`Resolviendo ${items.length} imágenes de animales en Wikipedia...`);
  let failures = 0;

  const prepared = await mapWithConcurrency(items, 6, async (item) => {
    const imageUrl = await fetchWikipediaThumbnail(item.wikipediaTitle);
    if (!imageUrl) {
      failures++;
      console.warn(`  ⚠ Sin imagen para "${item.animal}" (${item.wikipediaTitle})`);
    }
    const options: PreparedOption[] = [
      { text: item.animal, isCorrect: true },
      ...item.distractors.map((text) => ({ text, isCorrect: false })),
    ];
    const prep: PreparedQuestion = {
      category: "animals",
      text: "¿Qué animal aparece en la imagen?",
      difficulty: item.difficulty ?? "medium",
      imageUrl,
      options: shuffle(options),
    };
    return prep;
  });

  console.log(
    `Imágenes de animales resueltas: ${items.length - failures}/${items.length}` +
      (failures > 0 ? ` (${failures} sin imagen, se insertan igualmente)` : "")
  );
  return prepared;
}

async function insertAll(prepared: PreparedQuestion[]) {
  for (const item of prepared) {
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(question)
        .values({
          category: item.category,
          text: item.text,
          difficulty: item.difficulty,
          imageUrl: item.imageUrl,
        })
        .returning();

      if (!inserted) throw new Error(`No se pudo insertar pregunta: ${item.text}`);

      await tx.insert(answerOption).values(
        item.options.map((opt, i) => ({
          questionId: inserted.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          sortOrder: i,
        }))
      );
    });
  }
}

async function seed() {
  console.log("Preparando banco de preguntas de Sabios del Lúpulo...");

  const prepared: PreparedQuestion[] = [
    ...prepareStandard("geography", geographyQuestions),
    ...prepareStandard("art_literature", artLiteratureQuestions),
    ...prepareStandard("history", historyQuestions),
    ...prepareStandard("entertainment", entertainmentQuestions),
    ...prepareStandard("science_nature", scienceNatureQuestions),
    ...prepareStandard("sports", sportsQuestions),
    ...(await prepareFlags(flagQuestions)),
    ...(await prepareAnimals(animalQuestions)),
  ];

  console.log(`Insertando ${prepared.length} preguntas...`);
  await insertAll(prepared);

  console.log("Seed completado.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error ejecutando el seed:", err);
    process.exit(1);
  });
