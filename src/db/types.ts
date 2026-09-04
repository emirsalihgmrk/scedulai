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
export const createUserSchema = createInsertSchema(userTable);
export const updateUserSchema = createUpdateSchema(userTable);

export type SessionRow = typeof sessionTable.$inferSelect;
export const createSessionSchema = createInsertSchema(sessionTable);
export const updateSessionSchema = createUpdateSchema(sessionTable);

export type AccountRow = typeof accountTable.$inferSelect;
export const createAccountSchema = createInsertSchema(accountTable);
export const updateAccountSchema = createUpdateSchema(accountTable);

export type VerificationRow = typeof verificationTable.$inferSelect;
export const createVerificationSchema = createInsertSchema(verificationTable);
export const updateVerificationSchema = createUpdateSchema(verificationTable);

export type ProgramRow = typeof programsTable.$inferSelect;
export const createProgramSchema = createInsertSchema(programsTable);
export const updateProgramSchema = createUpdateSchema(programsTable);

export type SectionRow = typeof sectionsTable.$inferSelect;
export const createSectionSchema = createInsertSchema(sectionsTable);
export const updateSectionSchema = createUpdateSchema(sectionsTable);

export type ChannelRow = typeof channelsTable.$inferSelect;
export const createChannelSchema = createInsertSchema(channelsTable);
export const updateChannelSchema = createUpdateSchema(channelsTable);

export type VideoRow = typeof videosTable.$inferSelect;
export const createVideoSchema = createInsertSchema(videosTable);
export const updateVideoSchema = createUpdateSchema(videosTable);

export type TranscriptRow = typeof transcriptsTable.$inferSelect;
export const createTranscriptSchema = createInsertSchema(transcriptsTable);
export const updateTranscriptSchema = createUpdateSchema(transcriptsTable);

export type QuizRow = typeof quizzesTable.$inferSelect;
export const createQuizSchema = createInsertSchema(quizzesTable);
export const updateQuizSchema = createUpdateSchema(quizzesTable);

export type QuestionRow = typeof questionsTable.$inferSelect;
export const createQuestionSchema = createInsertSchema(questionsTable);
export const updateQuestionSchema = createUpdateSchema(questionsTable);

export type AnswerRow = typeof answersTable.$inferSelect;
export const createAnswerSchema = createInsertSchema(answersTable);
export const updateAnswerSchema = createUpdateSchema(answersTable);

export type SectionProgressRow = typeof sectionProgressTable.$inferSelect;
export const createSectionProgressSchema =
  createInsertSchema(sectionProgressTable);
export const updateSectionProgressSchema =
  createUpdateSchema(sectionProgressTable);
