import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import {
  accountTable,
  answersTable,
  channelsTable,
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

export type UserRow = typeof userTable.$inferSelect;
export const createUserRowSchema = createInsertSchema(userTable);
export const updateUserRowSchema = createUpdateSchema(userTable);

export type SessionRow = typeof sessionTable.$inferSelect;
export const createSessionRowSchema = createInsertSchema(sessionTable);
export const updateSessionRowSchema = createUpdateSchema(sessionTable);

export type AccountRow = typeof accountTable.$inferSelect;
export const createAccountRowSchema = createInsertSchema(accountTable);
export const updateAccountRowSchema = createUpdateSchema(accountTable);

export type VerificationRow = typeof verificationTable.$inferSelect;
export const createVerificationRowSchema =
  createInsertSchema(verificationTable);
export const updateVerificationRowSchema =
  createUpdateSchema(verificationTable);

export type ProgramRow = typeof programsTable.$inferSelect;
export const createProgramRowSchema = createInsertSchema(programsTable);
export const updateProgramRowSchema = createUpdateSchema(programsTable);

export type SectionRow = typeof sectionsTable.$inferSelect;
export const createSectionRowSchema = createInsertSchema(sectionsTable);
export const updateSectionRowSchema = createUpdateSchema(sectionsTable);

export type ChannelRow = typeof channelsTable.$inferSelect;
export const createChannelRowSchema = createInsertSchema(channelsTable);
export const updateChannelRowSchema = createUpdateSchema(channelsTable);

export type VideoRow = typeof videosTable.$inferSelect;
export const createVideoRowSchema = createInsertSchema(videosTable);
export const updateVideoRowSchema = createUpdateSchema(videosTable);

export type TranscriptRow = typeof transcriptsTable.$inferSelect;
export const createTranscriptRowSchema = createInsertSchema(transcriptsTable);
export const updateTranscriptRowSchema = createUpdateSchema(transcriptsTable);

export type QuizRow = typeof quizzesTable.$inferSelect;
export const createQuizRowSchema = createInsertSchema(quizzesTable);
export const updateQuizRowSchema = createUpdateSchema(quizzesTable);

export type QuestionRow = typeof questionsTable.$inferSelect;
export const createQuestionRowSchema = createInsertSchema(questionsTable);
export const updateQuestionRowSchema = createUpdateSchema(questionsTable);

export type AnswerRow = typeof answersTable.$inferSelect;
export const createAnswerRowSchema = createInsertSchema(answersTable);
export const updateAnswerRowSchema = createUpdateSchema(answersTable);

export type SectionProgressRow = typeof sectionProgressTable.$inferSelect;
export const createSectionProgressRowSchema =
  createInsertSchema(sectionProgressTable);
export const updateSectionProgressRowsSchema =
  createUpdateSchema(sectionProgressTable);
