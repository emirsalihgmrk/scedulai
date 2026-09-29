import { z } from "zod";
import {
  QuizRow,
  QuestionRow,
  AnswerRow,
  createQuizRowSchema,
  createQuestionRowSchema,
  createAnswerRowSchema,
} from "@/db/rows";
import { translationResponseSchema } from "@/schemas/column-types";

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

// query

export type Question = Omit<QuestionRow, "createdAt" | "updatedAt">;

export type Answer = Pick<AnswerRow, "result" | "accuracy">;

export type QuestionWithAnswer = Question & {
  answer: Answer | null;
};

export type QuizWithQuestions = Pick<QuizRow, "id"> & {
  questions: QuestionWithAnswer[];
};

// mutation

//// quiz

export const createQuizSchema = createQuizRowSchema.pick({
  nativeLanguage: true,
  targetLanguage: true,
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

//// question

export const createQuestionSchema = createQuestionRowSchema.pick({
  quizId: true,
  order: true,
  type: true,
  payload: true,
});
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

//// answer

export const submitTranslationAnswerSchema = translationResponseSchema;

export type SubmitTranslationAnswerInput = z.infer<
  typeof submitTranslationAnswerSchema
>;

export const createAnswerSchema = createAnswerRowSchema.pick({
  result: true,
  accuracy: true,
});

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
