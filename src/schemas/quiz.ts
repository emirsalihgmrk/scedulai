import { aiAnalysisSchema } from "@/ai/outputs/analyze-sentence";
import { z } from "zod";
import {
  QuizRow,
  QuestionRow,
  AnswerRow,
  createAnswerSchema,
} from "@/db/types";

// query types

export type Question = Omit<QuestionRow, "createdAt" | "updatedAt">;

export type QuestionWithAnswer = Question & {
  answer: Pick<AnswerRow, "response" | "analysis" | "accuracy"> | null;
};

export type QuizWithQuestions = Pick<QuizRow, "id"> & {
  questions: QuestionWithAnswer[];
};

// column types

export type AnswerAnalysis = z.infer<typeof aiAnalysisSchema>;

export type QuestionPayload = {
  type: "translation";
  sourceSentence: string;
  expectedTranslation: string;
  hint?: string;
};

// schemas - derived types

export const answerResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("translation"),
    userTranslation: z.string().min(1),
  }),
]);

export type AnswerResponse = z.infer<typeof answerResponseSchema>;

export const submitAnswerSchema = createAnswerSchema.pick({
  response: true,
  analysis: true,
  accuracy: true,
});
