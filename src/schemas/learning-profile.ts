import { z } from "zod";

import { DAILY_MINUTES_OPTIONS } from "@/constants/learning";
import { createLearningProfileRowSchema } from "@/db/rows";
import type { LearningProfileRow } from "@/db/rows";
import { updateUserSchema } from "@/schemas/user";

// ── Query types ──

export type LearningProfile = Pick<
  LearningProfileRow,
  "id" | "targetLanguage" | "level" | "levelSource" | "goal" | "dailyMinutes"
>;

// ── DAL input schemas ──

export const createLearningProfileSchema = createLearningProfileRowSchema
  .pick({ targetLanguage: true, level: true, levelSource: true, goal: true })
  .extend({
    dailyMinutes: z
      .number()
      .int()
      .refine(
        (value) => (DAILY_MINUTES_OPTIONS as readonly number[]).includes(value),
        "Invalid daily goal",
      ),
  });
export type CreateLearningProfileInput = z.infer<
  typeof createLearningProfileSchema
>;

// ── Service input schemas ──

// optionIndex null = "I don't know". Answers are scored on the server, so the
// client never asserts a placement level itself.
const placementAnswerSchema = z.object({
  questionId: z.string().max(40),
  optionIndex: z.number().int().min(0).max(9).nullable(),
});

export const completeOnboardingSchema = createLearningProfileSchema
  .omit({ levelSource: true })
  .extend(
    updateUserSchema.pick({ name: true, nativeLanguage: true }).required()
      .shape,
  )
  .extend({ placementAnswers: z.array(placementAnswerSchema).max(50).optional() });
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
