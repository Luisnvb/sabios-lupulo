"use client";

import { useState } from "react";

/**
 * Diálogo inline que pide la clave compartida (EDIT_PASSWORD) antes de
 * crear/editar una pregunta. No usa `window.prompt`. Sin <form> propio: vive
 * anidado dentro del formulario que protege (question-form.tsx) y HTML no
 * permite <form> dentro de <form>; Enter en el campo envía igual.
 */

type KeyPromptDialogProps = {
  message?: string;
  error?: string | null;
  isPending?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (key: string) => void;
  onCancel: () => void;
};

export function KeyPromptDialog({
  message = "Introduce la clave para guardar los cambios.",
  error = null,
  isPending = false,
  confirmLabel = "Guardar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: KeyPromptDialogProps) {
  const [key, setKey] = useState("");

  function submit() {
    onConfirm(key);
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="mt-2 max-w-sm space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm shadow-sm"
    >
      <div className="space-y-2">
        <p className="text-stone-800">{message}</p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          autoFocus
          placeholder="Clave"
          className="block w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        {error && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Guardando..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
