import { z } from "zod";
import { getAIObjectResponse } from "..";

const outputSchema = z.object({
  analysis: z
    .string()
    .describe(
      "A detailed analysis of the sentence's structure, grammar, and meaning. Must be written in the user's native language so the learner can understand it.",
    ),

  expressions: z
    .array(z.string())
    .describe(
      "A list of idiomatic English expressions or phrases relevant to the correct translation.",
    ),
  accuracy: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "How accurately the user's English translation conveys the meaning of the original sentence, as a percentage from 0 to 100.",
    ),
  alternatives: z
    .array(z.string())
    .describe(
      "Alternative correct ways the sentence could be translated into English (e.g. other natural phrasings or word choices).",
    ),
});

type AnalyzeSentenceOutput = z.infer<typeof outputSchema>;

interface AnalyzeSentenceArgs {
  sentence: string;
  originalSentence: string;
  userTranslation: string;
  nativeLanguage: string;
}

export function analyzeSentence({
  sentence,
  originalSentence,
  userTranslation,
  nativeLanguage,
}: AnalyzeSentenceArgs): Promise<AnalyzeSentenceOutput> {
  return getAIObjectResponse<AnalyzeSentenceOutput>({
    messages: [
      {
        role: "user",
        content: `A learner is practicing translating a sentence from their native language (${nativeLanguage}) into English. Below is the sentence in their native language, the original English sentence it was derived from (the correct answer), and the learner's own English translation.

Analyze the sentence's structure, grammar, and meaning, writing this analysis in ${nativeLanguage} so the learner can understand it. Identify key English vocabulary words and idiomatic expressions from the correct translation. Evaluate how accurately the learner's translation matches the original English sentence and give a percentage score. Finally, provide a few alternative correct ways the sentence could be translated into English.

Sentence (${nativeLanguage}):
${sentence}

Original English sentence (correct answer):
${originalSentence}

Learner's English translation:
${userTranslation}`,
      },
    ],
    output: {
      schema: outputSchema,
    },
  });
}
