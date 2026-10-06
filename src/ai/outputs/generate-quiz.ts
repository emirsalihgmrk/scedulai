import { z } from "zod";

export const BLANK_PATTERN = /\{\{(.+?)\}\}/g;
export const MAX_BLANKS_PER_SENTENCE = 3;

export const translationItemSchema = z.object({
  native: z
    .string()
    .describe("The practice sentence in the user's native language."),
  english: z
    .string()
    .describe("The correct English translation of this sentence."),
});

export const fillInTheBlankItemSchema = z.object({
  sentence: z
    .string()
    .refine((sentence) => {
      const blankCount = [...sentence.matchAll(BLANK_PATTERN)].length;
      return blankCount >= 1 && blankCount <= MAX_BLANKS_PER_SENTENCE;
    }, `The sentence must contain 1-${MAX_BLANKS_PER_SENTENCE} blanks written as {{word}}.`)
    .describe(
      "A complete English sentence where each blank is the missing word wrapped in double curly braces, e.g. 'I {{drink}} coffee every {{morning}}.'",
    ),
  distractors: z
    .array(z.string())
    .describe(
      "Two or three plausible but incorrect English words that do not fit any blank.",
    ),
});

export const generateQuizOutputSchema = z.object({
  translations: z.array(translationItemSchema),
  fillInTheBlanks: z.array(fillInTheBlankItemSchema),
});

export type GenerateQuizOutput = z.infer<typeof generateQuizOutputSchema>;
