import { z } from "zod";

import {
  createGradeRowSchema,
  createQuestionRowSchema,
  createQuizRowSchema,
} from "@/db/rows";
import type {
  GradeRow,
  MistakeRow,
  QuestionRow,
  QuizRow,
  VideoRow,
} from "@/db/rows";
import { translationMistakeSchema } from "@/schemas/mistake";

// ── Re-exports (jsonb shapes owned by this module) ──

export {
  glossSchema,
  translationPayloadSchema,
  questionPayloadSchema,
} from "@/schemas/column-types";
export type {
  Gloss,
  TranslationPayload,
  QuestionPayload,
} from "@/schemas/column-types";

// ── Query types ──

export type Question = Omit<QuestionRow, "createdAt" | "updatedAt">;

export type QuizWithQuestions = Pick<QuizRow, "id"> & {
  questions: Question[];
};

export type Grade = Pick<GradeRow, "id">;

// A practice question has no quiz, and so no video level.
export type GradeListItem = Pick<
  GradeRow,
  "createdAt" | "source" | "isCorrect" | "isFirstAttempt"
> & {
  mistakes: Pick<MistakeRow, "category">[];
  question: {
    quiz: {
      section: { video: Pick<VideoRow, "cefrLevel"> | null };
    } | null;
  } | null;
};

// ── DAL input schemas ──

export const createQuizSchema = createQuizRowSchema.pick({
  nativeLanguage: true,
});
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const createQuestionSchema = createQuestionRowSchema.pick({
  order: true,
  type: true,
  payload: true,
});
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const createGradeSchema = createGradeRowSchema.pick({
  source: true,
  isCorrect: true,
  isFirstAttempt: true,
});
export type CreateGradeInput = z.infer<typeof createGradeSchema>;

// ── Service input schemas ──

// Answers are graded, never stored (only the verdict and the mistakes found in
// them are), so this shape has no table to derive from.
export const gradeTranslationSchema = z.object({
  userTranslation: z.string().trim().min(1).max(200),
});
export type GradeTranslationInput = z.infer<typeof gradeTranslationSchema>;

// ── Service result types ──

export const translationAnalysisSchema = z.object({
  description: z.string(),
  meaningPreserved: z.enum(["yes", "partial", "no"]),
  mistakes: z.array(translationMistakeSchema),
  alternatives: z.array(z.string()),
});
export type TranslationAnalysis = z.infer<typeof translationAnalysisSchema>;

export type TranslationGrade = GradeTranslationInput & {
  analysis: TranslationAnalysis;
  isCorrect: boolean;
};
