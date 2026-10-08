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
  userTable
} from "@/db/schema";
import { questionPayloadSchema } from "@/schemas/column-types";

// Raw, generated shapes only — narrowing happens in schemas/<module>.ts.
//   <Entity>Row             every table ($inferSelect)
//   <entity>RowSchema       select schema, only where a read is parsed at runtime
//   create<Entity>RowSchema insert schema, only for tables the app writes;
//                           update/upsert inputs derive from it via .partial()
//
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

