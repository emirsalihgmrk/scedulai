import { z } from "zod";

import { createQuestionRowSchema, createQuizRowSchema } from "@/db/rows";
import type { QuestionRow, QuizRow } from "@/db/rows";

// ── Re-exports (jsonb shapes owned by this module) ──

export {
  translationPayloadSchema,
  questionPayloadSchema,
} from "@/schemas/column-types";
export type {
  TranslationPayload,
  QuestionPayload,
} from "@/schemas/column-types";

// ── Query types ──

export type Question = Omit<QuestionRow, "createdAt" | "updatedAt">;

export type QuizWithQuestions = Pick<QuizRow, "id"> & {
  questions: Question[];
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

// ── Service input schemas ──

// Answers are graded, never stored, so this shape has no table to derive from.
export const gradeTranslationSchema = z.object({
  userTranslation: z.string().trim().min(1).max(200),
});
export type GradeTranslationInput = z.infer<typeof gradeTranslationSchema>;

// ── Service result types ──

export const translationAnalysisSchema = z.object({
  description: z.string(),
  meaningPreserved: z.enum(["yes", "partial", "no"]),
  mistakes: z.array(z.string()),
  alternatives: z.array(z.string()),
});
export type TranslationAnalysis = z.infer<typeof translationAnalysisSchema>;

export type TranslationGrade = GradeTranslationInput & {
  analysis: TranslationAnalysis;
  isCorrect: boolean;
};
