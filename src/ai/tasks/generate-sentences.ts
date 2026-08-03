import { getAIObjectResponse } from "@/ai";
import { z } from "zod";

const sentencePair = z.object({
  native: z
    .string()
    .describe("The practice sentence in the user's native language."),
  english: z
    .string()
    .describe("The correct English translation of this sentence."),
});

const outputSchema = z.object({
  sentences: z
    .array(sentencePair)
    .length(15, "Exactly 15 sentence pairs must be generated.")
    .describe(
      "The 15 newly generated practice sentence pairs based on the transcript's patterns and vocabulary. Each pair contains the sentence in the user's native language and its correct English translation.",
    ),
});

type GenerateSentencesOutput = z.infer<typeof outputSchema>;

interface GenerateSentencesArgs {
  transcript: string;
  nativeLanguage: string;
}

export function generateSentences({
  transcript,
  nativeLanguage,
}: GenerateSentencesArgs): Promise<GenerateSentencesOutput> {
  return getAIObjectResponse<GenerateSentencesOutput>({
    messages: [
      {
        role: "user",
        content: `Analyze the following transcript. Based on its sentence patterns, vocabulary, and expressions, generate exactly 15 new practice sentence pairs for the learner. For each pair, provide the sentence in ${nativeLanguage} and its correct English translation.\n\nTranscript:\n${transcript}`,
      },
    ],
    output: {
      schema: outputSchema,
    },
  });
}
