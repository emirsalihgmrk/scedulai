import { z } from "zod";

import { getAiObjectResponse } from "@/ai";
import {
  BLANK_PATTERN,
  fillInTheBlankItemSchema,
  generateQuizOutputSchema,
  MAX_BLANKS_PER_SENTENCE,
  translationItemSchema,
} from "@/ai/outputs/generate-quiz";
import type { GenerateQuizOutput } from "@/ai/outputs/generate-quiz";
import type {
  FillInTheBlankPayload,
  QuestionPayload,
  TranslationPayload,
} from "@/schemas/quiz";

export const GENERATE_QUIZ_MODEL = "google/gemini-2.5-flash";

export interface GenerateQuizArgs {
  transcript: string;
  nativeLanguage: string;
  translationCount: number;
  fillInTheBlankCount: number;
}

function toTranslationPayload(
  item: GenerateQuizOutput["translations"][number],
): TranslationPayload {
  return {
    type: "translation",
    sourceSentence: item.native,
    expectedTranslation: item.english,
  };
}

// The model writes blanks inline as {{word}}; segments and the shuffled word
// pool are derived here so the payload shape never depends on model formatting.
function toFillInTheBlankPayload(
  item: GenerateQuizOutput["fillInTheBlanks"][number],
): FillInTheBlankPayload {
  const segments: FillInTheBlankPayload["segments"] = [];
  const answers: string[] = [];
  let cursor = 0;

  for (const match of item.sentence.matchAll(BLANK_PATTERN)) {
    const answer = match[1].trim();
    if (match.index > cursor) {
      segments.push({
        kind: "text",
        value: item.sentence.slice(cursor, match.index),
      });
    }
    segments.push({ kind: "blank", answer });
    answers.push(answer);
    cursor = match.index + match[0].length;
  }
  if (cursor < item.sentence.length) {
    segments.push({ kind: "text", value: item.sentence.slice(cursor) });
  }

  const wordPool = [...answers, ...item.distractors.map((w) => w.trim())];
  for (let i = wordPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordPool[i], wordPool[j]] = [wordPool[j], wordPool[i]];
  }

  return { type: "fill-in-the-blank", segments, wordPool };
}

// Alternates the two kinds so a quiz never opens with a long run of one type.
function interleave(
  translations: QuestionPayload[],
  fillInTheBlanks: QuestionPayload[],
): QuestionPayload[] {
  const result: QuestionPayload[] = [];
  const longest = Math.max(translations.length, fillInTheBlanks.length);
  for (let i = 0; i < longest; i++) {
    if (i < translations.length) result.push(translations[i]);
    if (i < fillInTheBlanks.length) result.push(fillInTheBlanks[i]);
  }
  return result;
}

export async function generateQuiz({
  transcript,
  nativeLanguage,
  translationCount,
  fillInTheBlankCount,
}: GenerateQuizArgs): Promise<QuestionPayload[]> {
  const outputSchema = generateQuizOutputSchema.extend({
    translations: z
      .array(translationItemSchema)
      .length(
        translationCount,
        `Exactly ${translationCount} translation items must be generated.`,
      )
      .describe(
        `The ${translationCount} translation practice items. Each contains a sentence in the user's native language and its correct English translation.`,
      ),
    fillInTheBlanks: z
      .array(fillInTheBlankItemSchema)
      .length(
        fillInTheBlankCount,
        `Exactly ${fillInTheBlankCount} fill-in-the-blank items must be generated.`,
      )
      .describe(
        `The ${fillInTheBlankCount} fill-in-the-blank practice items, written entirely in English.`,
      ),
  });
  const system = `You are an expert language teacher creating a practice quiz on the ScedulAI platform. The learner's native language is ${nativeLanguage} and they are learning English.

Given a transcript, analyze its sentence patterns, vocabulary, and expressions, then generate new practice material:
- ${translationCount} translation items: write the sentence in ${nativeLanguage} and give its correct English translation.
- ${fillInTheBlankCount} fill-in-the-blank items: write a natural English sentence and wrap each missing word in double curly braces, e.g. "I {{drink}} coffee every {{morning}}.". Blank 1-${MAX_BLANKS_PER_SENTENCE} words that teach the transcript's vocabulary or grammar, each with a single clearly correct answer. Add 2-3 plausible distractor words that do not fit any blank.

Keep every sentence short and suited to the transcript's difficulty. Do not copy transcript sentences verbatim.`;

  const { output } = await getAiObjectResponse<GenerateQuizOutput>({
    model: GENERATE_QUIZ_MODEL,
    system,
    messages: [{ role: "user", content: `Transcript:\n${transcript}` }],
    output: { schema: outputSchema },
  });

  return interleave(
    output.translations.map(toTranslationPayload),
    output.fillInTheBlanks.map(toFillInTheBlankPayload),
  );
}
