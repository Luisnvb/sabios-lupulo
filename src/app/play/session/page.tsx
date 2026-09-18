import Link from "next/link";
import { getRandomQuestions } from "@/lib/dal/questions";
import { GamePlayer } from "@/components/game-player";
import {
  QUESTION_CATEGORY_VALUES,
  type QuestionCategory,
} from "@/lib/reference/categories";

const MIN_COUNT = 1;
const MAX_COUNT = 60;
const DEFAULT_COUNT = 15;

type RawSearchParams = { [key: string]: string | string[] | undefined };

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function isQuestionCategory(value: string): value is QuestionCategory {
  return (QUESTION_CATEGORY_VALUES as readonly string[]).includes(value);
}

export default async function PlaySessionPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;

  const countParam = Number(
    Array.isArray(rawParams.count) ? rawParams.count[0] : rawParams.count
  );
  const count =
    Number.isInteger(countParam) && countParam >= MIN_COUNT && countParam <= MAX_COUNT
      ? countParam
      : DEFAULT_COUNT;

  const categories = toArray(rawParams.category).filter(isQuestionCategory);

  const questions = await getRandomQuestions({
    count,
    categories: categories.length > 0 ? categories : undefined,
  });

  const usp = new URLSearchParams();
  usp.set("count", String(count));
  for (const category of categories) usp.append("category", category);
  const replayHref = `/play/session?${usp.toString()}`;

  if (questions.length === 0) {
    return (
      <main className="mx-auto max-w-lg space-y-4">
        <p>
          <Link href="/play" className="text-sm font-medium text-amber-700 hover:underline">
            « Volver a configurar
          </Link>
        </p>
        <div className="space-y-2 rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center">
          <h1 className="text-xl font-bold text-stone-900">No hay preguntas</h1>
          <p className="text-stone-600">
            No hay preguntas que coincidan con esas categorías todavía.
            Prueba con otra selección.
          </p>
        </div>
      </main>
    );
  }

  const sessionKey = questions.map((q) => q.id).join("-");

  return (
    <main className="mx-auto max-w-lg">
      <GamePlayer key={sessionKey} questions={questions} replayHref={replayHref} />
    </main>
  );
}
