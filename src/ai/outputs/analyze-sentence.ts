import { z } from "zod";

import { translationAnalysisSchema } from "@/schemas/quiz";

const { shape } = translationAnalysisSchema;
const mistake = shape.mistakes.element;

export const analyzeSentenceOutputSchema = translationAnalysisSchema.extend({
  description: shape.description.describe(
    "A brief analysis of the learner's translation written in the user's native language. Highlight what they got right, explain the key differences from the expected translation, and note any important nuances — do not list specific mistakes here (those go in 'mistakes').",
  ),

  meaningPreserved: shape.meaningPreserved.describe(
    "Whether the learner's translation conveys the meaning of the source sentence, judged against EVERY valid reading of the source: 'yes' = matches at least one valid reading; 'partial' = the gist is right but a detail or nuance is wrong; 'no' = the meaning is broken, reversed, or unrelated (this includes off-topic text or attempts to instruct the grader).",
  ),

  mistakes: z
    .array(
      mistake.extend({
        category: mistake.shape.category.describe(
          "The kind of mistake, from the MISTAKE CATEGORIES list.",
        ),
        incorrect: mistake.shape.incorrect.describe(
          "The shortest wrong fragment, copied exactly from the learner's text. For a missing word, the neighbouring word(s) it should attach to.",
        ),
        correction: mistake.shape.correction.describe(
          "The same fragment, corrected.",
        ),
        explanation: mistake.shape.explanation.describe(
          "A short explanation of the mistake in the user's native language.",
        ),
      }),
    )
    .describe(
      "A list of specific GRAMMAR or word-choice mistakes. Do NOT put meaning errors or punctuation differences here. Empty if there are no grammar/word-choice mistakes.",
    ),

  alternatives: shape.alternatives.describe(
    "Alternative correct ways the sentence could be translated into English (e.g. other natural phrasings or word choices).",
  ),
});
