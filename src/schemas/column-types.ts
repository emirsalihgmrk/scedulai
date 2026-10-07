import { z } from "zod";

import type { QuestionType } from "@/constants/question";

export const translationPayloadSchema = z.object({
  type: z.literal("translation"),
  sourceSentence: z.string(),
  expectedTranslation: z.string(),
  hint: z.string().optional(),
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
