import { z } from "zod";

import { DAILY_MINUTES_OPTIONS } from "@/constants/learning";
import {
  createLearningProfileRowSchema
  
} from "@/db/rows";
import type {LearningProfileRow} from "@/db/rows";
import { updateUserSchema } from "@/schemas/user";

// ── Query types ──

export type LearningProfile = Pick<
  LearningProfileRow,
  "id" | "targetLanguage" | "level" | "levelSource" | "goal" | "dailyMinutes"
>;

// ── DAL input schemas ──

// `level` is nullable: "I don't know my level" leaves it null until the
// placement test sets it.
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

// Everything onboarding collects apart from the email/OTP account step.
// `levelSource` is derived server-side from whether a level was picked.
export const completeOnboardingSchema = createLearningProfileSchema
  .omit({ levelSource: true })
  .extend(
    updateUserSchema.pick({ name: true, nativeLanguage: true }).required()
      .shape,
  );
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
