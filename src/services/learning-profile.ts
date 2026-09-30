import { cache } from "react";
import { db } from "@/db";
import { getLearningProfile } from "@/dal/learning-profile/queries";
import { createLearningProfile } from "@/dal/learning-profile/mutations";
import { updateUser } from "@/dal/user/mutations";
import { getCurrentUser } from "@/services/auth";
import { AppError } from "@/lib/errors";
import {
  completeOnboardingSchema,
  type CompleteOnboardingInput,
  type LearningProfile,
} from "@/schemas/learning-profile";

export const getCurrentLearningProfileService = cache(
  async function getCurrentLearningProfileService(): Promise<LearningProfile | null> {
    const user = await getCurrentUser();
    if (!user) return null;
    const profile = await getLearningProfile(user.id);
    return profile ?? null;
  },
);

// Idempotent: a returning user who walks through onboarding again (e.g. after
// their session expired) keeps their existing profile untouched.
export async function completeOnboardingService(
  input: CompleteOnboardingInput,
): Promise<{ created: boolean }> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Unauthorized");

  const parsedInput = completeOnboardingSchema.safeParse(input);
  if (!parsedInput.success) throw new AppError("Invalid data");
  const { name, nativeLanguage, targetLanguage, level, goal, dailyMinutes } =
    parsedInput.data;

  const existing = await getLearningProfile(user.id);
  if (existing) return { created: false };

  return db.transaction(async (tx) => {
    await updateUser(user.id, { name, nativeLanguage }, tx);
    const row = await createLearningProfile(
      user.id,
      {
        targetLanguage,
        goal,
        dailyMinutes,
        level: level ?? null,
        levelSource: level ? "self" : null,
      },
      tx,
    );
    return { created: row !== undefined };
  });
}
