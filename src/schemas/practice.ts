import type { z } from "zod";

import type { MistakeCategory } from "@/constants/mistake";
import { createPracticeRowSchema } from "@/db/rows";
import type { PracticeRow } from "@/db/rows";
import type { Mistake } from "@/schemas/mistake";
import type { Question } from "@/schemas/quiz";

// ── Query types ──

export type PracticeWithQuestions = Pick<
  PracticeRow,
  "id" | "category" | "completedAt"
> & {
  questions: Question[];
};

export type PracticeListItem = Pick<
  PracticeRow,
  "category" | "completedAt" | "createdAt"
>;

// ── DAL input schemas ──

export const createPracticeSchema = createPracticeRowSchema.pick({
  category: true,
});
export type CreatePracticeInput = z.infer<typeof createPracticeSchema>;

export const updatePracticeSchema = createPracticeRowSchema
  .pick({ completedAt: true })
  .partial();
export type UpdatePracticeInput = z.infer<typeof updatePracticeSchema>;

// ── Service result types ──

// The category a new daily set would drill, with the mistakes it is written
// around.
export interface PracticeTarget {
  category: MistakeCategory;
  mistakes: Mistake[];
}
