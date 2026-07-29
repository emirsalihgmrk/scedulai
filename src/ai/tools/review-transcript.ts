import { z } from "zod";
import { tool } from "ai";

export const reviewTranscriptTool = tool({
  description: `Use this tool ONLY when you are asked to analyze or review a transcript. It extracts key sentence structures, vocabulary, and expressions from the transcript, and generates exactly 15 new practice sentences in the user's native language for the user to translate into English later.`,
  inputSchema: z.object({
    sentences: z
      .array(z.string())
      .length(15, "Exactly 15 sentences must be generated.")
      .describe(
        "The 15 newly generated practice sentences in the user's native language based on the transcript's patterns and vocabulary.",
      ),
  }),
  execute: async ({ sentences }) => {
    return { sentences };
  },
});
