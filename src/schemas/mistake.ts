import type { z } from "zod";

import { createMistakeRowSchema } from "@/db/rows";
import type { MistakeRow, PracticeRow } from "@/db/rows";

// ── Query types ──

export type Mistake = Pick<
  MistakeRow,
  | "id"
  | "category"
  | "incorrect"
  | "correction"
  | "explanation"
  | "sourceSentence"
  | "userTranslation"
>;

export type MistakeListItem = Mistake &
  Pick<MistakeRow, "createdAt"> & {
    practice: Pick<PracticeRow, "completedAt"> | null;
  };

// ── DAL input schemas ──

export const createMistakeSchema = createMistakeRowSchema.pick({
  source: true,
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
