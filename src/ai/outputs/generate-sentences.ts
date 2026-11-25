import { z } from "zod";

import { glossSchema } from "@/schemas/quiz";

export const sentencePairSchema = z.object({
  native: z
    .string()
    .describe("The practice sentence in the user's native language."),
  english: z
    .string()
    .describe("The correct English translation of this sentence."),
  glosses: z
    .array(
      glossSchema.extend({
        nativeInContext: z
          .string()
          .describe(
            "A word or fixed expression copied exactly, character for character, from the native sentence.",
          ),
        nativeLemma: z
          .string()
          .describe(
            "The same word or expression in native-language dictionary form: infinitive verb, noun without endings.",
          ),
        englishLemma: z
          .string()
          .describe(
            "Its English meaning in dictionary form: base verb, singular noun, no tense or article.",
          ),
        englishInContext: z
          .string()
          .describe(
            "The words of the English translation that carry this meaning, copied exactly, character for character.",
          ),
      }),
    )
    .describe(
      "Vocabulary hints the learner can look up while translating, in sentence order.",
    ),
});

export const generateSentencesOutputSchema = z.object({
  sentences: z.array(sentencePairSchema),
});

export type GenerateSentencesOutput = z.infer<
  typeof generateSentencesOutputSchema
>;
