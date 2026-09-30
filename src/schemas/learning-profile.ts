import { z } from "zod";
import { DAILY_MINUTES_OPTIONS } from "@/constants/learning";
import {
  createLearningProfileRowSchema,
  createUserRowSchema,
  type LearningProfileRow,
} from "@/db/rows";

// query types
export type LearningProfile = Pick<
  LearningProfileRow,
  "id" | "targetLanguage" | "level" | "levelSource" | "goal" | "dailyMinutes"
>;

// mutation schemas
// `level` is nullable: "I don't know my level" leaves it null until the
// placement test sets it. `levelSource` is derived server-side.
export const createLearningProfileSchema = createLearningProfileRowSchema
  .pick({ targetLanguage: true, goal: true, level: true })
  .extend({
    dailyMinutes: z
      .number()
      .int()
      .refine(
        (value) =>
          (DAILY_MINUTES_OPTIONS as readonly number[]).includes(value),
        "Invalid daily goal",
      ),
  });
export type CreateLearningProfileInput = z.infer<
  typeof createLearningProfileSchema
>;

// DAL input: the widest shape, including server-derived fields.
export const insertLearningProfileSchema = createLearningProfileRowSchema.pick({
  targetLanguage: true,
  goal: true,
  level: true,
  levelSource: true,
  dailyMinutes: true,
});
export type InsertLearningProfileInput = z.infer<
  typeof insertLearningProfileSchema
>;

// Everything onboarding collects apart from the email/OTP account step.
export const completeOnboardingSchema = createLearningProfileSchema.extend({
  nativeLanguage: createUserRowSchema.shape.nativeLanguage.unwrap(),
  name: z.string().trim().min(1, "Tell us what to call you").max(60),
});
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
