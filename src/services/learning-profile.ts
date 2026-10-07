import { cache } from "react";

import type { CefrLevel } from "@/constants/learning";
import {
  PLACEMENT_LEVELS,
  PLACEMENT_PASS_RATIO,
  PLACEMENT_QUESTIONS,
} from "@/constants/placement";
import { createLearningProfile } from "@/dal/learning-profile/mutations";
import { getLearningProfile } from "@/dal/learning-profile/queries";
import { updateUser } from "@/dal/user/mutations";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { completeOnboardingSchema } from "@/schemas/learning-profile";
import type {
  CompleteOnboardingInput,
  LearningProfile,
} from "@/schemas/learning-profile";
import { getCurrentUserService } from "@/services/auth";

export const getLearningProfileService = cache(
  async (): Promise<LearningProfile | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const profile = await getLearningProfile(user.id);
    return profile ?? null;
  },
);

// The highest level whose questions were passed, provided every level below it
// was passed too. Unanswered and "I don't know" count as wrong; A1 is the floor.
function estimatePlacementLevel(
  answers: NonNullable<CompleteOnboardingInput["placementAnswers"]>,
): CefrLevel {
  const chosen = new Map(
    answers.map((answer) => [answer.questionId, answer.optionIndex]),
  );

  let estimate: CefrLevel = "A1";
  for (const level of PLACEMENT_LEVELS) {
    const atLevel = PLACEMENT_QUESTIONS.filter((question) => question.level === level);
    const correct = atLevel.filter(
      (question) => chosen.get(question.id) === question.correctIndex,
    ).length;
    if (correct / atLevel.length < PLACEMENT_PASS_RATIO) break;
    estimate = level;
  }
  return estimate;
}

export async function completeOnboardingService(
  input: CompleteOnboardingInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const {
    name,
    nativeLanguage,
    level,
    goal,
    dailyMinutes,
    placementAnswers,
  } = completeOnboardingSchema.parse(input);

  const profile = await getLearningProfileService();
  if (profile) return;

  // A self-reported level wins; answers only count when the learner was unsure.
  const placedLevel =
    !level && placementAnswers
      ? estimatePlacementLevel(placementAnswers)
      : null;

  await db.transaction(async (tx) => {
    await updateUser(user.id, { name, nativeLanguage }, tx);
    await createLearningProfile(
      user.id,
      {
        goal,
        dailyMinutes,
        level: level ?? placedLevel,
        levelSource: level ? "self" : placedLevel ? "placement" : null,
      },
      tx,
    );
  });
}
