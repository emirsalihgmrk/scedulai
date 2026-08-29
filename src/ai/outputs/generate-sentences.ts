import { z } from "zod";

export const sentencePairSchema = z.object({
  native: z
    .string()
    .describe("The practice sentence in the user's native language."),
  english: z
    .string()
    .describe("The correct English translation of this sentence."),
});

export const generateSentencesOutputSchema = z.object({
  sentences: z.array(sentencePairSchema),
});

export type GenerateSentencesOutput = z.infer<
  typeof generateSentencesOutputSchema
>;