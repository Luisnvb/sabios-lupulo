"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteQuestionAction } from "@/app/questions/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

/**
 * Botón + confirmación reutilizado desde el listado y la vista de edición.
 * Sin optimismo de UI: la fila/página no cambia hasta que la Server Action
 * confirma el éxito.
 */

type DeleteQuestionButtonProps = {
  questionId: number;
  questionText: string;
  /** Ruta a la que navegar tras un borrado exitoso (p. ej. desde edición). */
  redirectTo?: string;
};

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function DeleteQuestionButton({
  questionId,
  questionText,
  redirectTo,
}: DeleteQuestionButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    setShowConfirm(false);
    setError(null);
    startTransition(async () => {
      const result = await deleteQuestionAction(questionId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="whitespace-nowrap rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Eliminando..." : "Eliminar"}
      </button>
      {showConfirm && (
        // Posicionado en absoluto para que no empuje el ancho de la tabla.
        <div className="absolute right-0 top-full z-20 mt-2 w-72">
          <ConfirmDialog
            message={`¿Eliminar la pregunta "${truncate(questionText)}"? Esta acción no se puede deshacer.`}
            confirmLabel="Sí, eliminar"
            cancelLabel="Cancelar"
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
