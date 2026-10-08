import type { z } from "zod";

import { createMistakeRowSchema } from "@/db/rows";

// ── DAL input schemas ──

export const createMistakeSchema = createMistakeRowSchema.pick({
  category: true,
  incorrect: true,
  correction: true,
  explanation: true,
  sourceSentence: true,
  userTranslation: true,
});
export type CreateMistakeInput = z.infer<typeof createMistakeSchema>;

// ── Service result types ──

export const translationMistakeSchema = createMistakeSchema.pick({
  category: true,
  incorrect: true,
  correction: true,
  explanation: true,
});
export type TranslationMistake = z.infer<typeof translationMistakeSchema>;
