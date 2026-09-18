"use client";

import { useState } from "react";

/** Mostrar/ocultar respuesta correcta: estado puramente de interfaz. */

type Option = {
  id: number;
  text: string;
  isCorrect: boolean;
};

export function AnswerReveal({ options }: { options: Option[] }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="whitespace-nowrap rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
      >
        {visible ? "Ocultar respuesta" : "Mostrar respuesta"}
      </button>
      {visible && (
        <ul className="mt-2 space-y-1 text-sm">
          {options
            .filter((opt) => opt.isCorrect)
            .map((opt) => (
              <li key={opt.id} className="font-semibold text-emerald-700">
                {opt.text} ✓
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
