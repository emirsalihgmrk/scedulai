import { z } from "zod";

import type { QuestionType } from "@/constants/question";

// A vocabulary hint on a translation question. Each side has its dictionary
// form (lemma: "give up", not the root "give") and the form its sentence uses:
// `nativeInContext` is in the source sentence, `englishInContext` in the
// expected translation.
export const glossSchema = z.object({
  nativeInContext: z.string(),
  nativeLemma: z.string(),
  englishLemma: z.string(),
  englishInContext: z.string(),
});
export type Gloss = z.infer<typeof glossSchema>;

export const translationPayloadSchema = z.object({
  type: z.literal("translation"),
  sourceSentence: z.string(),
  expectedTranslation: z.string(),
  hint: z.string().optional(),
  // Optional: questions generated before glosses existed have none.
  glosses: z.array(glossSchema).optional(),
});
export type TranslationPayload = z.infer<typeof translationPayloadSchema>;

export const questionPayloadSchema = z.discriminatedUnion("type", [
  translationPayloadSchema,
]);
export type QuestionPayload = z.infer<typeof questionPayloadSchema>;

type AssertTrue<T extends true> = T;
export type QuestionTypeCoverage = AssertTrue<
  [Exclude<QuestionType, QuestionPayload["type"]>] extends [never]
    ? true
    : false
>;

export const transcriptLineSchema = z.object({
  time: z.string(),
  text: z.string(),
});
export type TranscriptLine = z.infer<typeof transcriptLineSchema>;
