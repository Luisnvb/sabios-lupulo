import type { QuestionDifficulty } from "@/lib/reference/categories";

/** Pregunta estándar de 4 opciones (todas las categorías salvo flags/animals). */
export type StandardQuestionSeed = {
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  difficulty?: QuestionDifficulty;
};

/**
 * Pregunta de "Diversión con banderas": la imagen se construye en el script
 * de seed a partir de `iso2` (flagcdn.com), no se hardcodea ninguna URL en
 * los datos para evitar enlaces inventados/rotos.
 */
export type FlagQuestionSeed = {
  country: string;
  iso2: string; // ISO 3166-1 alpha-2, minúsculas (p.ej. "es", "ug")
  distractors: [string, string, string];
  difficulty?: QuestionDifficulty;
};

/**
 * Pregunta de "Animalitos": la imagen se resuelve en el script de seed
 * consultando la miniatura de Wikipedia en español para `wikipediaTitle`,
 * por el mismo motivo (evitar URLs de imagen inventadas).
 */
export type AnimalQuestionSeed = {
  animal: string;
  wikipediaTitle: string; // título del artículo en es.wikipedia.org
  distractors: [string, string, string];
  difficulty?: QuestionDifficulty;
};
