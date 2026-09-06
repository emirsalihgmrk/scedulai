import { z } from "zod";
import {
  QuizRow,
  QuestionRow,
  AnswerRow,
  createAnswerRowSchema,
  createQuizRowSchema,
  createQuestionRowSchema,
} from "@/db/types";

export type {
  QuestionPayload,
  AnswerAnalysis,
  AnswerResponse,
} from "@/db/schema";

// query

export type Question = Omit<QuestionRow, "createdAt" | "updatedAt">;

export type Answer = Pick<AnswerRow, "response" | "analysis" | "accuracy">;

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

export const submitAnswerSchema = createAnswerRowSchema.pick({
  response: true,
  analysis: true,
  accuracy: true,
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const createAnswerSchema = z.object({
  ...submitAnswerSchema.shape,
});
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
