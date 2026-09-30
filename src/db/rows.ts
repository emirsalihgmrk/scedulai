import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import {
  accountTable,
  aiTracesTable,
  answersTable,
  channelsTable,
  learningProfilesTable,
  programsTable,
  questionsTable,
  quizzesTable,
  sectionProgressTable,
  sectionsTable,
  sessionTable,
  transcriptsTable,
  userTable,
  verificationTable,
  videosTable,
} from "./schema";
import {
  answerResultSchema,
  questionPayloadSchema,
} from "@/schemas/column-types";

// drizzle-zod only *types* `$type<>()` jsonb columns — at runtime it emits a
// generic JSON validator. Every typed jsonb column must be refined with its
// real schema below so the row schema actually validates it.

export type UserRow = typeof userTable.$inferSelect;
export const userRowSchema = createSelectSchema(userTable);
export const createUserRowSchema = createInsertSchema(userTable);

export type LearningProfileRow = typeof learningProfilesTable.$inferSelect;
export const createLearningProfileRowSchema = createInsertSchema(
  learningProfilesTable,
);

export type SessionRow = typeof sessionTable.$inferSelect;

export type AccountRow = typeof accountTable.$inferSelect;

export type VerificationRow = typeof verificationTable.$inferSelect;

export type ProgramRow = typeof programsTable.$inferSelect;

export type SectionRow = typeof sectionsTable.$inferSelect;

export type ChannelRow = typeof channelsTable.$inferSelect;

export type VideoRow = typeof videosTable.$inferSelect;

export type TranscriptRow = typeof transcriptsTable.$inferSelect;

export type QuizRow = typeof quizzesTable.$inferSelect;
export const createQuizRowSchema = createInsertSchema(quizzesTable);

export type QuestionRow = typeof questionsTable.$inferSelect;
export const createQuestionRowSchema = createInsertSchema(questionsTable, {
  payload: questionPayloadSchema,
});

export type AnswerRow = typeof answersTable.$inferSelect;
export const createAnswerRowSchema = createInsertSchema(answersTable, {
  result: answerResultSchema,
});

export type SectionProgressRow = typeof sectionProgressTable.$inferSelect;
export const updateSectionProgressRowSchema =
  createUpdateSchema(sectionProgressTable);

export type AiTraceRow = typeof aiTracesTable.$inferSelect;
export const createAiTraceRowSchema = createInsertSchema(aiTracesTable);
