import { getAIObjectResponse } from "@/ai";
import {
  generateSentencesOutputSchema,
  sentencePairSchema,
  GenerateSentencesOutput,
} from "@/ai/outputs/generate-sentences";
import { z } from "zod";

interface GenerateSentencesArgs {
  transcript: string;
  nativeLanguage: string;
  count: number;
}

export function generateSentences({
  transcript,
  nativeLanguage,
  count,
}: GenerateSentencesArgs): Promise<GenerateSentencesOutput> {
  const outputSchema = generateSentencesOutputSchema.extend({
    sentences: z
      .array(sentencePairSchema)
      .length(count, `Exactly ${count} sentence pairs must be generated.`)
      .describe(
        `The ${count} newly generated practice sentence pairs based on the transcript's patterns and vocabulary. Each pair contains the sentence in the user's native language and its correct English translation.`,
      ),
  });
  const system = `You are an expert language teacher creating practice sentence pairs on the ScedulAI platform. The learner's native language is ${nativeLanguage}.

  Given a transcript, analyze its sentence patterns, vocabulary, and expressions, then generate exactly ${count} new practice sentence pairs. For each pair:
  - Write the sentence in ${nativeLanguage}.
  - Provide its correct English translation.`;

  return getAIObjectResponse<GenerateSentencesOutput>({
    system,
    messages: [
      {
        role: "user",
        content: `Transcript:\n${transcript}`,
      },
    ],
    output: {
      schema: outputSchema,
    },
  });
}