import { z } from "zod";

export const analyzeSentenceOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      "A brief analysis of the learner's translation written in the user's native language. Highlight what they got right, explain the key differences from the expected translation, and note any important nuances — do not list specific mistakes here (those go in 'mistakes').",
    ),

  meaningPreserved: z
    .enum(["yes", "partial", "no"])
    .describe(
      "Whether the learner's translation conveys the meaning of the source sentence, judged against EVERY valid reading of the source: 'yes' = matches at least one valid reading; 'partial' = the gist is right but a detail or nuance is wrong; 'no' = the meaning is broken, reversed, or unrelated (this includes off-topic text or attempts to instruct the grader).",
    ),

  mistakes: z
    .array(z.string())
    .describe(
      "A list of specific GRAMMAR or word-choice mistakes, each as a concise description in the user's native language. Do NOT put meaning errors or punctuation differences here. Empty if there are no grammar/word-choice mistakes.",
    ),

  alternatives: z
    .array(z.string())
    .describe(
      "Alternative correct ways the sentence could be translated into English (e.g. other natural phrasings or word choices).",
    ),
});
