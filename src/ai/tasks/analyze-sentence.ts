import { createHash } from "node:crypto";
import { z } from "zod";
import { getAIObjectResponse, type AIObjectResult } from "..";
import { analyzeSentenceOutputSchema } from "@/ai/outputs/analyze-sentence";

export type AnalyzeSentenceOutput = z.infer<typeof analyzeSentenceOutputSchema>;

interface AnalyzeSentenceArgs {
  sentence: string;
  originalSentence: string;
  userTranslation: string;
  nativeLanguage: string;
}

export type AnalyzeSentenceResult = AIObjectResult<AnalyzeSentenceOutput> & {
  promptVersion: string;
};

function buildSystemPrompt(nativeLanguage: string): string {
  return `You are an expert language teacher evaluating a learner's English translation on the ScedulAI platform. The learner's native language is ${nativeLanguage}.

  Your tasks:
  - Write a brief analysis of the learner's translation in ${nativeLanguage}: highlight what they got right, explain the key differences from the expected translation, and note any important nuances. Do not list specific mistakes here.
  - List each specific mistake in the learner's translation as a separate item, written in ${nativeLanguage}. If there are no mistakes, return an empty list.
  - Evaluate how accurately the learner's translation conveys the meaning and give a percentage score.
  - Provide a few alternative correct ways the sentence could be translated into English.

  IMPORTANT — Scoring rules:
  - Judge meaning and grammatical correctness, NOT word-for-word similarity to the reference English sentence.
  - The reference English sentence is only ONE valid answer. A single source sentence can have several equally correct English translations. Before scoring, work out every reading the source sentence can grammatically carry, and treat the learner's translation as fully correct if it matches ANY of them.
  - Only lower the score for genuine meaning or grammar errors that are wrong under EVERY valid reading of the source.
  - Do NOT penalize for punctuation differences (missing commas, periods, apostrophes, etc.). Punctuation errors must never lower the score or appear in the mistakes list.
  - If the learner's translation is empty or blank, accuracy MUST be 0.

  IMPORTANT — Turkish-specific ambiguities (accept all of the following as correct):
  - Gender: "o" and verb/possessive agreement do not mark gender — "he", "she", and singular "they" are all valid.
  - Person: nominalized clauses are ambiguous between 2nd and 3rd person singular (e.g. "sevdiğini" means both "that you love" and "that he/she loves") — accept both readings.
  - Number/formality: "siz" can be singular-formal or plural — "you" is valid either way.
  - Acknowledge these ambiguities in your ${nativeLanguage} analysis instead of calling a valid alternative reading a mistake.`;
}

export const ANALYZE_SENTENCE_PROMPT_VERSION = createHash("sha256")
  .update(buildSystemPrompt("{{nativeLanguage}}"))
  .digest("hex")
  .slice(0, 12);

export async function analyzeSentence({
  sentence,
  originalSentence,
  userTranslation,
  nativeLanguage,
}: AnalyzeSentenceArgs): Promise<AnalyzeSentenceResult> {
  const result = await getAIObjectResponse<AnalyzeSentenceOutput>({
    model: "google/gemini-2.5-flash-lite",
    system: buildSystemPrompt(nativeLanguage),
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

  return { ...result, promptVersion: ANALYZE_SENTENCE_PROMPT_VERSION };
}
