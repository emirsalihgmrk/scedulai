import { questionsTable, quizzesTable } from "@/db/schema";
import {
  questionFillInTheBlankAnswerSchema,
  questionAnswerSchema,
  questionTranslationAnswerSchema,
  questionFillInTheBlankPayloadSchema,
  questionPayloadSchema,
  questionTranslationPayloadSchema,
  quizCreateSchema,
  questionAnswerSubmitSchema,
} from "@/schemas/quiz";

import { aiAnalysisSchema } from "@/ai/outputs/analyze-sentence";
import { z } from "zod";

// quiz types

type QuizSelect = typeof quizzesTable.$inferSelect;
export type Quiz = Pick<QuizSelect, "cefrLevel">;
export type QuizCreateInput = z.infer<typeof quizCreateSchema>;

// question types

export const QUESTION_TYPES = ["translation", "fill-in-the-blank"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_DIRECTIONS = [
  "native-to-target",
  "target-to-native",
] as const;
export type QuestionDirection = (typeof QUESTION_DIRECTIONS)[number];

export type QuestionTranslationPayload = z.infer<
  typeof questionTranslationPayloadSchema
>;
export type QuestionFillInTheBlankPayload = z.infer<
  typeof questionFillInTheBlankPayloadSchema
>;
export type QuestionPayload = z.infer<typeof questionPayloadSchema>;

export type QuestionTranslationAnswer = z.infer<
  typeof questionTranslationAnswerSchema
>;
export type QuestionFillInTheBlankAnswer = z.infer<
  typeof questionFillInTheBlankAnswerSchema
>;
export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;

export type QuestionAnswerAnalysis = z.infer<typeof aiAnalysisSchema>;

export type Question = typeof questionsTable.$inferSelect;

export type QuestionAnswerSubmitInput = z.infer<
  typeof questionAnswerSubmitSchema
>;

export type QuestionAnswerUpdateInput = {
  answer: QuestionAnswer;
  answerAnalysis: QuestionAnswerAnalysis;
  answerAccuracy: number;
};

// combined types

export type QuizWithQuestions = Pick<QuizSelect, "id" | "cefrLevel"> & {
  questions: Question[];
};
