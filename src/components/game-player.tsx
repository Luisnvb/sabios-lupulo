"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  QUESTION_CATEGORY_LABELS,
  QUESTION_CATEGORY_EMOJI,
  type QuestionCategory,
} from "@/lib/reference/categories";

/**
 * Recorre las preguntas de la partida una a una, con feedback inmediato y
 * marcador final. Igual que trivia-friends, las opciones (con isCorrect) ya
 * vienen del servidor: es una app para jugar entre amigos, no una
 * plataforma de examen anti-trampas.
 */

type GameOption = {
  id: number;
  text: string;
  isCorrect: boolean;
};

type GameQuestion = {
  id: number;
  category: QuestionCategory;
  text: string;
  imageUrl: string | null;
  options: GameOption[];
};

const PRIMARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-md bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700";
const SECONDARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50";

export function GamePlayer({
  questions,
  replayHref,
}: {
  questions: GameQuestion[];
  replayHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const total = questions.length;
  const current = questions[index];
  const isLast = index === total - 1;
  const hasAnswered = selectedOptionId !== null;

  function handleSelect(option: GameOption) {
    if (hasAnswered) return;
    setSelectedOptionId(option.id);
    if (option.isCorrect) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    setSelectedOptionId(null);
    setIndex((i) => i + 1);
  }

  if (index >= total || !current) {
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="space-y-6 rounded-xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <div>
          <p className="text-5xl">🏆</p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">Partida terminada</h1>
        </div>
        <div>
          <p className="text-4xl font-extrabold text-amber-600">
            {score} / {total}
          </p>
          <p className="text-sm text-stone-500">{percent}% de aciertos</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={replayHref} className={PRIMARY_BUTTON_CLASS}>
            Jugar otra vez
          </Link>
          <Link href="/play" className={SECONDARY_BUTTON_CLASS}>
            Cambiar configuración
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-stone-600">
          <span>
            Pregunta {index + 1} de {total}
          </span>
          <span>
            Puntuación: <span className="font-semibold text-amber-700">{score}</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            {QUESTION_CATEGORY_EMOJI[current.category]} {QUESTION_CATEGORY_LABELS[current.category]}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-stone-900">{current.text}</h2>

        {current.imageUrl && (
          <div className="relative mt-4 h-48 w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100 sm:h-64">
            <Image
              src={current.imageUrl}
              alt={
                current.category === "flags"
                  ? "Bandera a identificar"
                  : "Animal a identificar"
              }
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {current.options.map((option) => {
            const isSelected = option.id === selectedOptionId;
            const showAsCorrect = hasAnswered && option.isCorrect;
            const showAsWrong = hasAnswered && isSelected && !option.isCorrect;

            let stateClass =
              "border-stone-300 bg-white text-stone-800 hover:border-amber-400 hover:bg-amber-50";
            if (showAsCorrect) {
              stateClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
            } else if (showAsWrong) {
              stateClass = "border-red-500 bg-red-50 text-red-800";
            } else if (hasAnswered) {
              stateClass = "border-stone-200 bg-white text-stone-400";
            }

            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={hasAnswered}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-sm font-medium shadow-sm transition disabled:cursor-not-allowed ${stateClass}`}
                >
                  <span>{option.text}</span>
                  {showAsCorrect && <span>✓</span>}
                  {showAsWrong && <span>✗</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {hasAnswered && (
        <button type="button" onClick={handleNext} className={`${PRIMARY_BUTTON_CLASS} w-full`}>
          {isLast ? "Ver resultado final" : "Siguiente pregunta"}
        </button>
      )}
    </div>
  );
}
