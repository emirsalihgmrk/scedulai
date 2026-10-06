import type { z } from "zod";

import {
  createAnswerRowSchema,
  createQuestionRowSchema,
  createQuizRowSchema
  
  
  
} from "@/db/rows";
import type {AnswerRow, QuestionRow, QuizRow} from "@/db/rows";
import {
  fillInTheBlankResponseSchema,
  translationResponseSchema,
} from "@/schemas/column-types";

// ── Re-exports (jsonb shapes owned by this module) ──

export {
  translationPayloadSchema,
  translationResponseSchema,
  translationAnalysisSchema,
  translationResultSchema,
  fillInTheBlankPayloadSchema,
  fillInTheBlankResponseSchema,
  fillInTheBlankAnalysisSchema,
  fillInTheBlankResultSchema,
  questionPayloadSchema,
  answerResultSchema,
} from "@/schemas/column-types";
export type {
  TranslationPayload,
  TranslationResponse,
  TranslationAnalysis,
  TranslationResult,
  FillInTheBlankPayload,
  FillInTheBlankResponse,
  FillInTheBlankAnalysis,
  FillInTheBlankResult,
  QuestionPayload,
  AnswerResult,
} from "@/schemas/column-types";

// ── Query types ──

export type Question = Omit<QuestionRow, "createdAt" | "updatedAt">;

export type Answer = Pick<AnswerRow, "result" | "accuracy">;

export type QuestionWithAnswer = Question & {
  answer: Answer | null;
};

export type QuizWithQuestions = Pick<QuizRow, "id"> & {
  questions: QuestionWithAnswer[];
};

// ── DAL input schemas ──

export const createQuizSchema = createQuizRowSchema.pick({
  nativeLanguage: true,
  targetLanguage: true,
});
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const createQuestionSchema = createQuestionRowSchema.pick({
  order: true,
  type: true,
  payload: true,
});
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const upsertAnswerSchema = createAnswerRowSchema.pick({
  result: true,
  accuracy: true,
});
export type UpsertAnswerInput = z.infer<typeof upsertAnswerSchema>;

// ── Service input schemas ──

// A jsonb shape is aliased, never re-declared.
export const submitTranslationAnswerSchema = translationResponseSchema;
export type SubmitTranslationAnswerInput = z.infer<
  typeof submitTranslationAnswerSchema
>;

export const submitFillInTheBlankAnswerSchema = fillInTheBlankResponseSchema;
export type SubmitFillInTheBlankAnswerInput = z.infer<
  typeof submitFillInTheBlankAnswerSchema
>;
