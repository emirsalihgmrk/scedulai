import { getAIObjectResponse } from "@/ai";
import { z } from "zod";

const SYSTEM_PROMPT =
  "You are an expert language teacher on the ScedulAI platform.";

const outputSchema = z.object({
  sentences: z
    .array(z.string())
    .length(15, "Exactly 15 sentences must be generated.")
    .describe(
      "The 15 newly generated practice sentences in the user's native language based on the transcript's patterns and vocabulary.",
    ),
});

type GeneratePracticeSentencesOutput = z.infer<typeof outputSchema>;

interface GeneratePracticeSentencesArgs {
  transcript: string;
  nativeLanguage: string;
}

export function generatePracticeSentences({
  transcript,
  nativeLanguage,
}: GeneratePracticeSentencesArgs): Promise<GeneratePracticeSentencesOutput> {
  return getAIObjectResponse<GeneratePracticeSentencesOutput>({
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze the following transcript. Based on its sentence patterns, vocabulary, and expressions, generate exactly 15 new practice sentences in ${nativeLanguage} for the learner to translate into English.\n\nTranscript:\n${transcript}`,
      },
    ],
    output: {
      schema: outputSchema,
    },
  });
}