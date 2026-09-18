"use client";

import { useState, useTransition } from "react";
import {
  createQuestionAction,
  updateQuestionAction,
  type ActionErrors,
} from "@/app/questions/actions";
import type { QuestionInput } from "@/lib/validation/question";
import {
  QUESTION_CATEGORY_VALUES,
  QUESTION_CATEGORY_LABELS,
  QUESTION_DIFFICULTY_VALUES,
  QUESTION_DIFFICULTY_LABELS,
  type QuestionCategory,
  type QuestionDifficulty,
} from "@/lib/reference/categories";
import { KeyPromptDialog } from "@/components/key-prompt-dialog";

/**
 * Mismo formulario para creación y edición. A diferencia de trivia-friends
 * no hay modo single/multiple_choice ni season/episode: aquí toda pregunta
 * es de categoría fija con exactamente 4 opciones y 1 correcta, más una URL
 * de imagen opcional (pensada sobre todo para Banderas y Animalitos).
 */

type OptionDraft = {
  text: string;
  isCorrect: boolean;
};

export type QuestionFormInitialValues = {
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  text: string;
  imageUrl: string | null;
  options: OptionDraft[];
};

type QuestionFormProps =
  | { formMode: "create"; questionId?: undefined; initialValues?: undefined }
  | { formMode: "edit"; questionId: number; initialValues: QuestionFormInitialValues };

const INPUT_CLASS =
  "block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-stone-700";
const FIELD_ERROR_CLASS = "mt-1 text-xs font-medium text-red-600";
const FIELDSET_CLASS = "rounded-xl border border-stone-200 bg-white p-4";
const LEGEND_CLASS = "px-1 text-sm font-semibold text-stone-800";

const EMPTY_OPTIONS: OptionDraft[] = [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

function errorsFor(errors: ActionErrors, key: string): string[] {
  return errors[key] ?? [];
}

export function QuestionForm({ formMode, questionId, initialValues }: QuestionFormProps) {
  const [category, setCategory] = useState<QuestionCategory>(
    initialValues?.category ?? QUESTION_CATEGORY_VALUES[0]
  );
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(
    initialValues?.difficulty ?? "medium"
  );
  const [text, setText] = useState(initialValues?.text ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [options, setOptions] = useState<OptionDraft[]>(
    initialValues?.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) ??
      EMPTY_OPTIONS.map((o) => ({ ...o }))
  );
  const [errors, setErrors] = useState<ActionErrors>({});
  const [isPending, startTransition] = useTransition();
  const [pendingInput, setPendingInput] = useState<QuestionInput | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  function updateOptionText(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, text: value } : o)));
  }

  function setCorrectOption(index: number) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === index })));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const trimmedImageUrl = imageUrl.trim();
    const input: QuestionInput = {
      category,
      difficulty,
      text,
      imageUrl: trimmedImageUrl === "" ? null : trimmedImageUrl,
      options: options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    };

    setKeyError(null);
    setPendingInput(input);
  }

  function handleKeyConfirm(key: string) {
    if (!pendingInput) return;
    setKeyError(null);
    startTransition(async () => {
      const result =
        formMode === "edit"
          ? await updateQuestionAction(questionId, pendingInput, key)
          : await createQuestionAction(pendingInput, key);
      if (!result.success) {
        if (result.errors._key?.[0]) {
          setKeyError(result.errors._key[0]);
          return;
        }
        setErrors(result.errors);
        setPendingInput(null);
      }
    });
  }

  function handleKeyCancel() {
    setPendingInput(null);
    setKeyError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={LABEL_CLASS}>
            Categoría
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as QuestionCategory)}
            className={INPUT_CLASS}
          >
            {QUESTION_CATEGORY_VALUES.map((value) => (
              <option key={value} value={value}>
                {QUESTION_CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
          {errorsFor(errors, "category").map((msg) => (
            <p key={msg} role="alert" className={FIELD_ERROR_CLASS}>
              {msg}
            </p>
          ))}
        </div>

        <div>
          <label htmlFor="difficulty" className={LABEL_CLASS}>
            Dificultad
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
            className={INPUT_CLASS}
          >
            {QUESTION_DIFFICULTY_VALUES.map((value) => (
              <option key={value} value={value}>
                {QUESTION_DIFFICULTY_LABELS[value]}
              </option>
            ))}
          </select>
          {errorsFor(errors, "difficulty").map((msg) => (
            <p key={msg} role="alert" className={FIELD_ERROR_CLASS}>
              {msg}
            </p>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="question-text" className={LABEL_CLASS}>
          Pregunta
        </label>
        <textarea
          id="question-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className={INPUT_CLASS}
        />
        {errorsFor(errors, "text").map((msg) => (
          <p key={msg} role="alert" className={FIELD_ERROR_CLASS}>
            {msg}
          </p>
        ))}
      </div>

      <div>
        <label htmlFor="image-url" className={LABEL_CLASS}>
          URL de imagen (opcional — bandera o foto de animal)
        </label>
        <input
          id="image-url"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className={INPUT_CLASS}
        />
        {imageUrl.trim() !== "" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl.trim()}
            alt="Vista previa"
            className="mt-2 h-32 w-auto rounded-md border border-stone-200 object-contain"
          />
        )}
        {errorsFor(errors, "imageUrl").map((msg) => (
          <p key={msg} role="alert" className={FIELD_ERROR_CLASS}>
            {msg}
          </p>
        ))}
      </div>

      <fieldset className={FIELDSET_CLASS}>
        <legend className={LEGEND_CLASS}>Opciones (4, marca la correcta)</legend>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index}>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={option.text}
                  placeholder={`Opción ${index + 1}`}
                  onChange={(e) => updateOptionText(index, e.target.value)}
                  className={`${INPUT_CLASS} flex-1`}
                />
                <label className="flex items-center gap-1.5 whitespace-nowrap text-sm text-stone-700">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={option.isCorrect}
                    onChange={() => setCorrectOption(index)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Correcta
                </label>
              </div>
              {errorsFor(errors, `options.${index}.text`).map((msg) => (
                <p key={msg} role="alert" className={FIELD_ERROR_CLASS}>
                  {msg}
                </p>
              ))}
            </div>
          ))}
        </div>
        {errorsFor(errors, "options").map((msg) => (
          <p key={msg} role="alert" className={FIELD_ERROR_CLASS}>
            {msg}
          </p>
        ))}
      </fieldset>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formMode === "edit" ? "Guardar cambios" : "Guardar pregunta"}
        </button>
        {pendingInput && (
          <KeyPromptDialog
            error={keyError}
            isPending={isPending}
            onConfirm={handleKeyConfirm}
            onCancel={handleKeyCancel}
          />
        )}
      </div>
    </form>
  );
}
