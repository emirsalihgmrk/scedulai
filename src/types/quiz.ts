import { questionsTable, quizzesTable } from "@/db/schema";

import { aiAnalysisSchema } from "@/ai/outputs/analyze-sentence";
import { z } from "zod";

// quiz types

type QuizSelect = typeof quizzesTable.$inferSelect;

// question types

export type Question = typeof questionsTable.$inferSelect;

export const QUESTION_TYPES = ["translation", "fill-in-the-blank"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_DIRECTIONS = [
  "native-to-target",
  "target-to-native",
] as const;
export type QuestionDirection = (typeof QUESTION_DIRECTIONS)[number];

export type QuestionAnswerAnalysis = z.infer<typeof aiAnalysisSchema>;

// combined types

export type QuizWithQuestions = Pick<QuizSelect, "id" | "cefrLevel"> & {
  questions: Question[];
};
