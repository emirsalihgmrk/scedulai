import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import type {
  accountTable,
  channelsTable,
  programsTable,
  sectionsTable,
  sessionTable,
  transcriptsTable,
  verificationTable,
  videosTable} from "@/db/schema";
import {
  learningProfilesTable,
  mistakesTable,
  practicesTable,
  questionsTable,
  quizzesTable,
  sectionProgressTable,
  userTable,
  vocabularyCardsTable,
  vocabularyItemsTable,
  vocabularyReviewsTable
} from "@/db/schema";
import { questionPayloadSchema } from "@/schemas/column-types";

// drizzle-zod only *types* `$type<>()` jsonb columns — at runtime it emits a
// generic JSON validator. Every typed jsonb column must be refined with its
// real schema below so the row schema actually validates it.

export type UserRow = typeof userTable.$inferSelect;
export const userRowSchema = createSelectSchema(userTable);
export const createUserRowSchema = createInsertSchema(userTable);

export type SessionRow = typeof sessionTable.$inferSelect;

export type AccountRow = typeof accountTable.$inferSelect;

export type VerificationRow = typeof verificationTable.$inferSelect;

export type LearningProfileRow = typeof learningProfilesTable.$inferSelect;
export const createLearningProfileRowSchema = createInsertSchema(
  learningProfilesTable,
);

export type ProgramRow = typeof programsTable.$inferSelect;

export type SectionRow = typeof sectionsTable.$inferSelect;

export type SectionProgressRow = typeof sectionProgressTable.$inferSelect;
export const createSectionProgressRowSchema =
  createInsertSchema(sectionProgressTable);

export type ChannelRow = typeof channelsTable.$inferSelect;

export type VideoRow = typeof videosTable.$inferSelect;

export type TranscriptRow = typeof transcriptsTable.$inferSelect;

export type QuizRow = typeof quizzesTable.$inferSelect;
export const createQuizRowSchema = createInsertSchema(quizzesTable);

export type QuestionRow = typeof questionsTable.$inferSelect;
export const createQuestionRowSchema = createInsertSchema(questionsTable, {
  payload: questionPayloadSchema,
});

export type MistakeRow = typeof mistakesTable.$inferSelect;
export const createMistakeRowSchema = createInsertSchema(mistakesTable);

export type PracticeRow = typeof practicesTable.$inferSelect;
export const createPracticeRowSchema = createInsertSchema(practicesTable);

export type VocabularyItemRow = typeof vocabularyItemsTable.$inferSelect;
export const createVocabularyItemRowSchema =
  createInsertSchema(vocabularyItemsTable);

export type VocabularyCardRow = typeof vocabularyCardsTable.$inferSelect;
export const createVocabularyCardRowSchema =
  createInsertSchema(vocabularyCardsTable);

export type VocabularyReviewRow = typeof vocabularyReviewsTable.$inferSelect;
export const createVocabularyReviewRowSchema = createInsertSchema(
  vocabularyReviewsTable,
);

