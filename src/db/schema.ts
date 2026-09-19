import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Esquema del banco de preguntas de Sabios del Lúpulo, inspirado en el
 * modelo question/answer_option de trivia-friends. Cada pregunta pertenece
 * a una de las 8 categorías fijas del trivial de los jueves en Checkpoint
 * Arcade. "flags" y "animals" llevan además una imagen (bandera o foto de
 * animal) a identificar.
 */

export const questionCategoryEnum = pgEnum("question_category", [
  "geography",
  "art_literature",
  "history",
  "entertainment",
  "science_nature",
  "sports",
  "flags",
  "animals",
]);

export const questionDifficultyEnum = pgEnum("question_difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const question = pgTable("question", {
  id: serial("id").primaryKey(),
  category: questionCategoryEnum("category").notNull(),
  text: text("text").notNull(),
  difficulty: questionDifficultyEnum("difficulty").notNull().default("medium"),
  // Solo relleno para "flags" (bandera del país) y "animals" (foto del
  // animal); null para el resto de categorías.
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const answerOption = pgTable("answer_option", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .notNull()
    .references(() => question.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const questionRelations = relations(question, ({ many }) => ({
  answerOptions: many(answerOption),
}));

export const answerOptionRelations = relations(answerOption, ({ one }) => ({
  question: one(question, {
    fields: [answerOption.questionId],
    references: [question.id],
  }),
}));

export type Question = typeof question.$inferSelect;
export type NewQuestion = typeof question.$inferInsert;
export type AnswerOption = typeof answerOption.$inferSelect;
export type NewAnswerOption = typeof answerOption.$inferInsert;
