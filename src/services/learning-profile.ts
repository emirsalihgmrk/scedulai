import { cache } from "react";

import { createLearningProfile } from "@/dal/learning-profile/mutations";
import { getLearningProfile } from "@/dal/learning-profile/queries";
import { updateUser } from "@/dal/user/mutations";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import {
  completeOnboardingSchema
  
  
} from "@/schemas/learning-profile";
import type {CompleteOnboardingInput, LearningProfile} from "@/schemas/learning-profile";
import { getCurrentUserService } from "@/services/auth";

export const getLearningProfileService = cache(
  async (): Promise<LearningProfile | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const profile = await getLearningProfile(user.id);
    return profile ?? null;
  },
);

// Idempotent: a returning user who walks through onboarding again (e.g. after
// their session expired) keeps their existing profile untouched.
export async function completeOnboardingService(
  input: CompleteOnboardingInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const { name, nativeLanguage, targetLanguage, level, goal, dailyMinutes } =
    completeOnboardingSchema.parse(input);

  const profile = await getLearningProfileService();
  if (profile) return;

  await db.transaction(async (tx) => {
    await updateUser(user.id, { name, nativeLanguage }, tx);
    await createLearningProfile(
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
  });
}
