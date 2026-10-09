import type { z } from "zod";

import { createPracticeRowSchema } from "@/db/rows";
import type { PracticeRow } from "@/db/rows";
import type { Question } from "@/schemas/quiz";

// ── Query types ──

export type PracticeWithQuestions = Pick<PracticeRow, "id" | "completedAt"> & {
  questions: Question[];
};

// ── DAL input schemas ──

export const updatePracticeSchema = createPracticeRowSchema
  .pick({ completedAt: true })
  .partial();
export type UpdatePracticeInput = z.infer<typeof updatePracticeSchema>;
