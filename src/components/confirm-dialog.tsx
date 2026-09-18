"use client";

/** Confirmación inline reutilizable (no usa `window.confirm`). */

type ConfirmDialogProps = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="mt-2 max-w-sm space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm shadow-sm"
    >
      <p className="text-stone-800">{message}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
