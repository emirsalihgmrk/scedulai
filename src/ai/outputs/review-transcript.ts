import { z } from "zod";

const description = `A structured transcript analysis output. It extracts key sentence structures, vocabulary, and expressions from the transcript to generate exactly 15 new practice sentences in user's native language for English translation exercises.`;

const schema = z.object({
  sentences: z
    .array(z.string())
    .length(15, "Exactly 15 sentences must be generated.")
    .describe(
      "The 15 newly generated practice sentences in the user's native language based on the transcript's patterns and vocabulary.",
    ),
});

export const reviewTranscriptOutput = {
  description,
  schema,
};
