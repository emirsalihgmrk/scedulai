import { getAIObjectResponse } from "@/ai";
import { z } from "zod";

const sentencePair = z.object({
  native: z
    .string()
    .describe("The practice sentence in the user's native language."),
  english: z
    .string()
    .describe("The correct English translation of this sentence."),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .describe("The difficulty level of the sentence."),
});

type Difficulty = "easy" | "medium" | "hard";

type GenerateSentencesOutput = {
  sentences: z.infer<typeof sentencePair>[];
};

const difficultyDescriptions: Record<Difficulty, string> = {
  easy: "simple vocabulary and short structures",
  medium: "compound clauses or moderately complex vocabulary",
  hard: "advanced grammar, idiomatic expressions, or nuanced meaning",
};

interface GenerateSentencesArgs {
  transcript: string;
  nativeLanguage: string;
  count: number;
  difficulty: Difficulty;
}

export function generateSentences({
  transcript,
  nativeLanguage,
  count,
  difficulty,
}: GenerateSentencesArgs): Promise<GenerateSentencesOutput> {
  const description = difficultyDescriptions[difficulty];
  const outputSchema = z.object({
    sentences: z
      .array(sentencePair)
      .length(count, `Exactly ${count} sentence pairs must be generated.`)
      .describe(
        `The ${count} newly generated practice sentence pairs at "${difficulty}" difficulty, based on the transcript's patterns and vocabulary. Each pair contains the sentence in the user's native language and its correct English translation.`,
      ),
  });
  return getAIObjectResponse<GenerateSentencesOutput>({
    messages: [
      {
        role: "user",
        content: `Analyze the following transcript. Based on its sentence patterns, vocabulary, and expressions, generate exactly ${count} new practice sentence pairs for the learner. All sentences must be at the "${difficulty}" difficulty level (${description}). For each pair, provide the sentence in ${nativeLanguage}, its correct English translation, and set the difficulty field to "${difficulty}".\n\nTranscript:\n${transcript}`,
      },
    ],
    output: {
      schema: outputSchema,
    },
  });
}
