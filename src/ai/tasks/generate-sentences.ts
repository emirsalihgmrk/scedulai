import { z } from "zod";

import { getAiObjectResponse } from "@/ai";
import {
  generateSentencesOutputSchema,
  sentencePairSchema,
} from "@/ai/outputs/generate-sentences";
import type { GenerateSentencesOutput } from "@/ai/outputs/generate-sentences";

// Shared with the practice task. The learner sees only the English lemma while
// translating, which gives away the word, never the grammar they are meant to
// produce; the in-context form is shown once the answer is graded.
export function buildGlossRules(nativeLanguage: string): string {
  return `For each pair, also list glosses: vocabulary hints the learner can open while translating.
- Gloss every content word or fixed expression of the ${nativeLanguage} sentence (nouns, verbs, adjectives, adverbs, idioms). Skip names, numbers and words whose English is identical.
- nativeInContext: copied exactly, character for character, from the ${nativeLanguage} sentence. A multi-word expression is one gloss.
- nativeLemma: the same word or expression in ${nativeLanguage} dictionary form: a verb as its infinitive, a noun without case, possessive or plural endings.
- englishLemma: its English meaning in dictionary form: base verb ("go", never "went" or "is going"), singular noun, no article. Never reveal tense, agreement, articles or prepositions the translation needs.
- englishInContext: the words of the English translation that carry this meaning, copied exactly, character for character, from it ("went", "is going", "children").`;
}

export interface GenerateSentencesArgs {
  transcript: string;
  nativeLanguage: string;
  count: number;
}

export async function generateSentences({
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
  - Provide its correct English translation.

${buildGlossRules(nativeLanguage)}`;

  const { output } = await getAiObjectResponse<GenerateSentencesOutput>({
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
  return output;
}
