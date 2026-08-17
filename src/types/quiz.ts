import { questionsTable, quizzesTable } from "@/db/schema";

export const QUESTION_TYPES = ["translation", "fill-in-the-blank"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_DIRECTIONS = [
  "native-to-target",
  "target-to-native",
] as const;
export type QuestionDirection = (typeof QUESTION_DIRECTIONS)[number];

export type TranslationPayload = {
  type: "translation";
  sourceSentence: string;
  expectedTranslation?: string;
  hint?: string;
};

export type FillInTheBlankPayload = {
  type: "fill-in-the-blank";
  sentenceWithBlank: string;
  missingWord: string;
  options?: string[];
};

export type QuestionPayload = TranslationPayload | FillInTheBlankPayload;

export type TranslationAnswer = {
  type: "translation";
  userTranslation: string;
};

export type FillInTheBlankAnswer = {
  type: "fill-in-the-blank";
  selectedWord: string;
};

export type QuestionAnswer = TranslationAnswer | FillInTheBlankAnswer;

export type AiAnalysis = {
  analyse: string;
  mistakes?: string[];
  alternativeAnswers?: string[];
  expressions?: string[];
};

/// derived types from db tables

type QuizSelect = typeof quizzesTable.$inferSelect;
export type Quiz = Pick<QuizSelect, "cefrLevel">;

export type Question = typeof questionsTable.$inferSelect;

export type QuizWithQuestions = Pick<QuizSelect, "id" | "cefrLevel"> & {
  questions: Question[];
};
