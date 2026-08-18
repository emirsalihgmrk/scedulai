import { z } from "zod";
import { getAIObjectResponse } from "..";
import { analyzeSentenceOutputSchema } from "@/ai/outputs/analyze-sentence";

export type AnalyzeSentenceOutput = z.infer<typeof analyzeSentenceOutputSchema>;

interface AnalyzeSentenceArgs {
  sentence: string;
  originalSentence: string;
  userTranslation: string;
  nativeLanguage: string;
}

export function analyzeSentence({
  sentence,
  originalSentence,
  userTranslation,
  nativeLanguage,
}: AnalyzeSentenceArgs): Promise<AnalyzeSentenceOutput> {
  const system = `You are an expert language teacher evaluating a learner's English translation on the ScedulAI platform. The learner's native language is ${nativeLanguage}.

  Your tasks:
  - Write a brief analysis of the learner's translation in ${nativeLanguage}: highlight what they got right, explain the key differences from the expected translation, and note any important nuances. Do not list specific mistakes here.
  - List each specific mistake in the learner's translation as a separate item, written in ${nativeLanguage}. If there are no mistakes, return an empty list.
  - Identify key English vocabulary words and idiomatic expressions from the correct translation.
  - Evaluate how accurately the learner's translation conveys the meaning and give a percentage score.
  - Provide a few alternative correct ways the sentence could be translated into English.

  IMPORTANT — Scoring rules:
  - Judge meaning and grammatical correctness, NOT word-for-word similarity to the reference English sentence.
  - The reference English sentence is only ONE valid answer. A single source sentence can have several equally correct English translations. Before scoring, work out every reading the source sentence can grammatically carry, and treat the learner's translation as fully correct if it matches ANY of them.
  - Only lower the score for genuine meaning or grammar errors that are wrong under EVERY valid reading of the source.
  - If the learner's translation is empty or blank, accuracy MUST be 0.

  IMPORTANT — Turkish-specific ambiguities (accept all of the following as correct):
  - Gender: "o" and verb/possessive agreement do not mark gender — "he", "she", and singular "they" are all valid.
  - Person: nominalized clauses are ambiguous between 2nd and 3rd person singular (e.g. "sevdiğini" means both "that you love" and "that he/she loves") — accept both readings.
  - Number/formality: "siz" can be singular-formal or plural — "you" is valid either way.
  - Acknowledge these ambiguities in your ${nativeLanguage} analysis instead of calling a valid alternative reading a mistake.`;

  return getAIObjectResponse<AnalyzeSentenceOutput>({
    model: "google/gemini-2.5-flash-lite",
    system,
    messages: [
      {
        role: "user",
        content: `Sentence (${nativeLanguage}): ${sentence}
        Original English sentence (correct answer): ${originalSentence}
        Learner's English translation: ${userTranslation}`,
      },
    ],
    output: {
      schema: analyzeSentenceOutputSchema,
    },
  });
}