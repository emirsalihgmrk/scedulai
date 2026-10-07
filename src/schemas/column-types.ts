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
// Only the object stored at a column's root carries the `type` discriminant.
// ---------------------------------------------------------------------------

// ===========================================================================
// quiz — questions.payload
// ===========================================================================

// translation

export const translationPayloadSchema = z.object({
  type: z.literal("translation"),
  sourceSentence: z.string(),
  expectedTranslation: z.string(),
  hint: z.string().optional(),
});
export type TranslationPayload = z.infer<typeof translationPayloadSchema>;

// column unions

export const questionPayloadSchema = z.discriminatedUnion("type", [
  translationPayloadSchema,
]);
export type QuestionPayload = z.infer<typeof questionPayloadSchema>;

// Compile-time guard: every QUESTION_TYPES entry has a payload variant.
// Fails to compile when a type is added to constants/ but not here.
type AssertTrue<T extends true> = T;
export type QuestionTypeCoverage = AssertTrue<
  [Exclude<QuestionType, QuestionPayload["type"]>] extends [never]
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
