import Image from "next/image";
import Link from "next/link";
import {
  QUESTION_CATEGORY_VALUES,
  QUESTION_CATEGORY_LABELS,
  QUESTION_CATEGORY_EMOJI,
} from "@/lib/reference/categories";

export default function HomePage() {
  return (
    <main className="space-y-10">
      <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
          <Image
            src="/team-illustration.png"
            alt="Ilustración del equipo Sábios del Lúpulo celebrando en Checkpoint Arcade"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="space-y-3 p-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Sábios del Lúpulo Simulator
          </h1>
          <p className="mx-auto max-w-xl text-stone-600">
            Revive el trivial por equipos de los jueves en Checkpoint Arcade
            (Sevilla): 8 categorías, cientos de preguntas y la misma
            mezcla de cultura general, banderas y animalitos que juega el
            equipo cada semana.
          </p>
          <Link
            href="/play"
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            🎮 Empezar partida
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Categorías</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUESTION_CATEGORY_VALUES.map((category) => (
            <div
              key={category}
              className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white p-4 shadow-sm"
            >
              <span className="text-2xl">{QUESTION_CATEGORY_EMOJI[category]}</span>
              <span className="font-medium text-stone-800">
                {QUESTION_CATEGORY_LABELS[category]}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
