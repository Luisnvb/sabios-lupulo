import { z } from "zod";
import { QUESTION_CATEGORY_VALUES, QUESTION_DIFFICULTY_VALUES } from "@/lib/reference/categories";

/**
 * Esquema único de validación para crear/editar preguntas, compartido por
 * la Server Action y (indirectamente, vía los mismos tipos) por el
 * formulario cliente. A diferencia de trivia-friends no hay modo
 * single/multiple_choice ni season/episode: aquí toda pregunta tiene
 * categoría fija y siempre exactamente 4 opciones con 1 correcta.
 */

const answerOptionInputSchema = z.object({
  text: z.string().trim().min(1, "El texto de la opción es obligatorio."),
  isCorrect: z.boolean(),
});

export const questionInputSchema = z
  .object({
    category: z.enum(QUESTION_CATEGORY_VALUES, {
      errorMap: () => ({ message: "Selecciona una categoría válida." }),
    }),
    difficulty: z.enum(QUESTION_DIFFICULTY_VALUES, {
      errorMap: () => ({ message: "Selecciona una dificultad válida." }),
    }),
    text: z.string().trim().min(1, "El texto de la pregunta es obligatorio."),
    imageUrl: z
      .string()
      .trim()
      .url("La URL de la imagen no es válida.")
      .nullable(),
    options: z
      .array(answerOptionInputSchema)
      .length(4, "Debe haber exactamente 4 opciones."),
  })
  .superRefine((data, ctx) => {
    const correctCount = data.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe haber exactamente una opción marcada como correcta.",
        path: ["options"],
      });
    }

    const seen = new Set<string>();
    data.options.forEach((option, index) => {
      const key = option.text.trim().toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las opciones no pueden repetirse.",
          path: ["options", index, "text"],
        });
      }
      seen.add(key);
    });
  });

export type QuestionInput = z.infer<typeof questionInputSchema>;
