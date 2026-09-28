import { z } from "zod";
import {
  QuizRow,
  QuestionRow,
  AnswerRow,
  createQuizRowSchema,
  createQuestionRowSchema,
  createAnswerRowSchema,
} from "@/db/types";

export type {
  QuestionPayload,
  QuestionTypeMap,
  AnswerResponse,
  AnswerResult,
} from "@/db/schema";

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

export const submitTranslationAnswerSchema = z.object({
  type: z.literal("translation"),
  userTranslation: z.string().trim().min(1).max(200),
});

export type SubmitTranslationAnswerInput = z.infer<typeof submitTranslationAnswerSchema>;

export const createAnswerSchema = createAnswerRowSchema.pick({
  result: true,
  accuracy: true,
});

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
