import { z } from "zod";

import type { QuestionType } from "@/constants/question";

// ---------------------------------------------------------------------------
// JSONB column shapes — the single source of truth for every `$type<>()`
// column in db/schema.ts.
//
// Why a separate file: db/schema.ts depends on these shapes, so they must sit
// *below* it in the graph. This file may import only `zod` and `@/constants/*`
// (enforced by ESLint).
//
// Internal building block: only `db/` and `schemas/` import this file. Every
// other layer takes these types from the owning module file (`@/schemas/quiz`,
// `@/schemas/video`), which re-exports them.
//
// Only the object stored at a column's root carries the `type` discriminant;
// nested parts (response, analysis) do not.
// ---------------------------------------------------------------------------

// ===========================================================================
// quiz — questions.payload / answers.result
//
// Each question type defines four parts:
//   payload  — stored in `questions.payload`
//   response — what the learner submits
//   analysis — how the response was graded
//   result   — stored in `answers.result`
// ===========================================================================

// translation

export const translationPayloadSchema = z.object({
  type: z.literal("translation"),
  sourceSentence: z.string(),
  expectedTranslation: z.string(),
  hint: z.string().optional(),
});
export type TranslationPayload = z.infer<typeof translationPayloadSchema>;

export const translationResponseSchema = z.object({
  userTranslation: z.string().trim().min(1).max(200),
});
export type TranslationResponse = z.infer<typeof translationResponseSchema>;

export const translationAnalysisSchema = z.object({
  description: z.string(),
  meaningPreserved: z.enum(["yes", "partial", "no"]),
  mistakes: z.array(z.string()),
  alternatives: z.array(z.string()),
});
export type TranslationAnalysis = z.infer<typeof translationAnalysisSchema>;

export const translationResultSchema = z.object({
  type: z.literal("translation"),
  response: translationResponseSchema,
  analysis: translationAnalysisSchema,
});
export type TranslationResult = z.infer<typeof translationResultSchema>;

// fill-in-the-blank

export const fillInTheBlankPayloadSchema = z.object({
  type: z.literal("fill-in-the-blank"),
  segments: z.array(
    z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("text"), value: z.string() }),
      z.object({ kind: z.literal("blank"), answer: z.string() }),
    ]),
  ),
  wordPool: z.array(z.string()),
});
export type FillInTheBlankPayload = z.infer<typeof fillInTheBlankPayloadSchema>;

export const fillInTheBlankResponseSchema = z.object({
  answers: z.array(z.string()),
});
export type FillInTheBlankResponse = z.infer<
  typeof fillInTheBlankResponseSchema
>;

export const fillInTheBlankAnalysisSchema = z.object({
  blankResults: z.array(z.boolean()),
});
export type FillInTheBlankAnalysis = z.infer<
  typeof fillInTheBlankAnalysisSchema
>;

export const fillInTheBlankResultSchema = z.object({
  type: z.literal("fill-in-the-blank"),
  response: fillInTheBlankResponseSchema,
  analysis: fillInTheBlankAnalysisSchema,
});
export type FillInTheBlankResult = z.infer<typeof fillInTheBlankResultSchema>;

// column unions

export const questionPayloadSchema = z.discriminatedUnion("type", [
  translationPayloadSchema,
  fillInTheBlankPayloadSchema,
]);
export type QuestionPayload = z.infer<typeof questionPayloadSchema>;

export const answerResultSchema = z.discriminatedUnion("type", [
  translationResultSchema,
  fillInTheBlankResultSchema,
]);
export type AnswerResult = z.infer<typeof answerResultSchema>;

// Compile-time guard: every QUESTION_TYPES entry has a payload and a result
// variant. Fails to compile when a type is added to constants/ but not here.
type AssertTrue<T extends true> = T;
export type QuestionTypeCoverage = AssertTrue<
  [
    Exclude<QuestionType, QuestionPayload["type"]>,
    Exclude<QuestionType, AnswerResult["type"]>,
  ] extends [never, never]
    ? true
    : false
>;

// ===========================================================================
// video — transcripts.content
// ===========================================================================

export const transcriptLineSchema = z.object({
  time: z.string(),
  text: z.string(),
});
export type TranscriptLine = z.infer<typeof transcriptLineSchema>;
