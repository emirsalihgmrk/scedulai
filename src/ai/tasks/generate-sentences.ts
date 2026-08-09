import { getAIObjectResponse } from "@/ai";
import { z } from "zod";

const sentencePair = z.object({
  native: z
    .string()
    .describe("The practice sentence in the user's native language."),
  english: z
    .string()
    .describe("The correct English translation of this sentence."),
  cefrLevel: z
    .enum(["A1", "A2", "B1", "B2", "C1", "C2"])
    .describe("The CEFR proficiency level of the sentence."),
});

type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type GenerateSentencesOutput = {
  sentences: z.infer<typeof sentencePair>[];
};

const cefrDescriptions: Record<CefrLevel, string> = {
  A1: "very simple everyday words and phrases, basic subject-verb-object patterns, present tense only",
  A2: "simple connected sentences, common vocabulary, basic past and future tense",
  B1: "clear standard sentences on familiar topics, some dependent clauses and connectors like 'because', 'although'",
  B2: "complex sentences, abstract topics, passive voice, conditional structures, varied vocabulary",
  C1: "sophisticated language, nuanced meaning, idiomatic expressions, complex grammatical structures",
  C2: "subtle distinctions, highly idiomatic, native-like complexity and precision",
};

interface GenerateSentencesArgs {
  transcript: string;
  nativeLanguage: string;
  count: number;
  cefrLevel: CefrLevel;
}

export function generateSentences({
  transcript,
  nativeLanguage,
  count,
  cefrLevel,
}: GenerateSentencesArgs): Promise<GenerateSentencesOutput> {
  const description = cefrDescriptions[cefrLevel];
  const outputSchema = z.object({
    sentences: z
      .array(sentencePair)
      .length(count, `Exactly ${count} sentence pairs must be generated.`)
      .describe(
        `The ${count} newly generated practice sentence pairs at CEFR level "${cefrLevel}", based on the transcript's patterns and vocabulary. Each pair contains the sentence in the user's native language and its correct English translation.`,
      ),
  });
  const system = `You are an expert language teacher creating practice sentence pairs on the ScedulAI platform. The learner's native language is ${nativeLanguage}.

  Given a transcript, analyze its sentence patterns, vocabulary, and expressions, then generate exactly ${count} new practice sentence pairs. For each pair:
  - Write the sentence in ${nativeLanguage}.
  - Provide its correct English translation.
  - Set the cefrLevel field to "${cefrLevel}".
  
  All sentences must match CEFR level "${cefrLevel}": ${description}.`;

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
