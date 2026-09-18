import Link from "next/link";
import {
  QUESTION_CATEGORY_VALUES,
  QUESTION_CATEGORY_LABELS,
  QUESTION_CATEGORY_EMOJI,
} from "@/lib/reference/categories";

const QUESTION_COUNTS = [10, 15, 20, 30];

const SELECT_CLASS =
  "block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

export default function PlaySetupPage() {
  return (
    <main className="mx-auto max-w-lg space-y-6">
      <p>
        <Link href="/" className="text-sm font-medium text-amber-700 hover:underline">
          « Volver
        </Link>
      </p>

      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          🎮 Jugar una partida
        </h1>
        <p className="text-stone-600">
          Como cada jueves: elige cuántas preguntas y, si quieres, acota por
          categoría (deja todas marcadas para una ronda completa).
        </p>
      </div>

      <form
        method="get"
        action="/play/session"
        className="space-y-5 rounded-xl border border-amber-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="count" className="mb-1 block text-sm font-medium text-stone-700">
            Número de preguntas
          </label>
          <select name="count" id="count" defaultValue={15} className={SELECT_CLASS}>
            {QUESTION_COUNTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-stone-700">
            Categorías
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {QUESTION_CATEGORY_VALUES.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-700 hover:border-amber-300"
              >
                <input
                  type="checkbox"
                  name="category"
                  value={category}
                  defaultChecked
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <span>
                  {QUESTION_CATEGORY_EMOJI[category]} {QUESTION_CATEGORY_LABELS[category]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full rounded-md bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
        >
          Empezar partida
        </button>
      </form>
    </main>
  );
}
