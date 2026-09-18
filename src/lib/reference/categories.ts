export const QUESTION_CATEGORY_VALUES = [
  "geography",
  "art_literature",
  "history",
  "entertainment",
  "science_nature",
  "sports",
  "flags",
  "animals",
] as const;

export type QuestionCategory = (typeof QUESTION_CATEGORY_VALUES)[number];

export const QUESTION_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  geography: "Geografía",
  art_literature: "Arte y Literatura",
  history: "Historia",
  entertainment: "Entretenimiento / Espectáculos",
  science_nature: "Ciencias y Naturaleza",
  sports: "Deportes",
  flags: "Diversión con banderas",
  animals: "Animalitos",
};

export const QUESTION_CATEGORY_EMOJI: Record<QuestionCategory, string> = {
  geography: "🗺️",
  art_literature: "🎨",
  history: "🏛️",
  entertainment: "🎬",
  science_nature: "🔬",
  sports: "⚽",
  flags: "🚩",
  animals: "🐾",
};

export const QUESTION_CATEGORY_DESCRIPTIONS: Record<QuestionCategory, string> = {
  geography: "Países, capitales, ríos, montañas y demás mapamundi.",
  art_literature: "Pintores, escritores, obras y movimientos artísticos.",
  history: "Sucesos, personajes y fechas que marcaron la humanidad.",
  entertainment: "Cine, series, música y cultura pop.",
  science_nature: "Ciencia, cuerpo humano, naturaleza y tecnología.",
  sports: "Fútbol, olimpiadas y deporte en general.",
  flags: "Identifica el país a partir de su bandera.",
  animals: "Identifica al animal que aparece en la foto.",
};

export const QUESTION_DIFFICULTY_VALUES = ["easy", "medium", "hard"] as const;
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTY_VALUES)[number];

export const QUESTION_DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};
