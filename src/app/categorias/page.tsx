import Link from "next/link";
import {
  QUESTION_CATEGORY_VALUES,
  QUESTION_CATEGORY_LABELS,
  QUESTION_CATEGORY_EMOJI,
  QUESTION_CATEGORY_DESCRIPTIONS,
} from "@/lib/reference/categories";
import { countQuestionsByCategory } from "@/lib/dal/questions";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const counts = await countQuestionsByCategory();
  const countByCategory = new Map(counts.map((c) => [c.category, c.count]));

  return (
    <main className="space-y-6">
      <p>
        <Link href="/" className="text-sm font-medium text-amber-700 hover:underline">
          « Volver
        </Link>
      </p>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Categorías
        </h1>
        <p className="text-stone-600">
          Las 8 rondas de siempre en Checkpoint Arcade.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUESTION_CATEGORY_VALUES.map((category) => (
          <Link
            key={category}
            href={`/questions?category=${category}`}
            className="group flex flex-col gap-2 rounded-xl border border-amber-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{QUESTION_CATEGORY_EMOJI[category]}</span>
              <span className="font-semibold text-stone-900 group-hover:text-amber-700">
                {QUESTION_CATEGORY_LABELS[category]}
              </span>
            </div>
            <p className="text-sm text-stone-600">
              {QUESTION_CATEGORY_DESCRIPTIONS[category]}
            </p>
            <p className="text-xs font-medium text-amber-700">
              {countByCategory.get(category) ?? 0} preguntas
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
