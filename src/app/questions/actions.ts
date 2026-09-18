"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { questionInputSchema, type QuestionInput } from "@/lib/validation/question";
import { createQuestion, updateQuestion, deleteQuestion } from "@/lib/dal/questions";
import { isValidEditKey, INVALID_EDIT_KEY_MESSAGE } from "@/lib/auth/edit-key";

/**
 * Server Actions co-localizadas para crear/editar/borrar preguntas. Validan
 * con el esquema zod compartido y delegan en el DAL — ningún componente
 * accede a Drizzle directamente. Crear y editar exigen además la clave
 * compartida (ver src/lib/auth/edit-key.ts); borrar solo pide confirmación.
 */

export type ActionErrors = Record<string, string[]>;

export type QuestionActionResult =
  | { success: true }
  | { success: false; errors: ActionErrors };

function toErrorMap(error: z.ZodError): ActionErrors {
  const map: ActionErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    (map[key] ??= []).push(issue.message);
  }
  return map;
}

export async function createQuestionAction(
  input: QuestionInput,
  key: string
): Promise<QuestionActionResult> {
  if (!isValidEditKey(key)) {
    return { success: false, errors: { _key: [INVALID_EDIT_KEY_MESSAGE] } };
  }

  const parsed = questionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: toErrorMap(parsed.error) };
  }

  await createQuestion(parsed.data);
  redirect("/questions");
}

export async function updateQuestionAction(
  id: number,
  input: QuestionInput,
  key: string
): Promise<QuestionActionResult> {
  if (!isValidEditKey(key)) {
    return { success: false, errors: { _key: [INVALID_EDIT_KEY_MESSAGE] } };
  }

  const parsed = questionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: toErrorMap(parsed.error) };
  }

  await updateQuestion(id, parsed.data);
  redirect("/questions");
}

export type DeleteQuestionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteQuestionAction(id: number): Promise<DeleteQuestionResult> {
  try {
    await deleteQuestion(id);
  } catch {
    return {
      success: false,
      error: "No se pudo eliminar la pregunta. Inténtalo de nuevo.",
    };
  }
  revalidatePath("/questions");
  revalidatePath("/categorias");
  return { success: true };
}
