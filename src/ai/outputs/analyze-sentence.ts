import { z } from "zod";

export const analyzeSentenceOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      "A brief analysis of the learner's translation written in the user's native language. Highlight what they got right, explain the key differences from the expected translation, and note any important nuances — do not list specific mistakes here (those go in 'mistakes').",
    ),

  mistakes: z
    .array(z.string())
    .describe(
      "A list of specific mistakes found in the learner's translation, each as a concise description in the user's native language. Empty if the translation is correct.",
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
      "How accurately the learner's English translation conveys the meaning of the original sentence, as a percentage from 0 to 100.",
    ),

  alternatives: z
    .array(z.string())
    .describe(
      "Alternative correct ways the sentence could be translated into English (e.g. other natural phrasings or word choices).",
    ),
});

export const aiAnalysisSchema = analyzeSentenceOutputSchema.omit({
  accuracy: true,
});