import { cache } from "react";

import { generatePracticeSentences } from "@/ai/tasks/generate-practice-sentences";
import { getNativeLanguageEnglishName } from "@/constants/language";
import { createPractice, updatePractice } from "@/dal/practice/mutations";
import { getPractice } from "@/dal/practice/queries";
import { createPracticeQuestions } from "@/dal/quiz/mutations";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import type { PracticeWithQuestions } from "@/schemas/practice";
import { getCurrentUserService } from "@/services/auth";
import { getLearningProfileService } from "@/services/learning-profile";
import { getMistakeService } from "@/services/mistake";

const QUESTION_COUNT = 3;

export const getPracticeService = cache(
  async (mistakeId: string): Promise<PracticeWithQuestions | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const practice = await getPractice(mistakeId, user.id);
    return practice ?? null;
  },
);

// Generated once per mistake: a mistake that already has a practice returns it
// without calling the model, so repeated requests never repeat the cost.
export async function generatePracticeByAiService(
  mistakeId: string,
): Promise<PracticeWithQuestions> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const [mistake, practice, profile] = await Promise.all([
    getMistakeService(mistakeId),
    getPracticeService(mistakeId),
    getLearningProfileService(),
  ]);
  if (!mistake) throw new AppError("Not found");
  if (practice) return practice;

  const { sentences } = await generatePracticeSentences({
    mistake,
    nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
    level: profile?.level ?? null,
    count: QUESTION_COUNT,
  });

  return db.transaction(async (tx) => {
    const created = await createPractice(user.id, mistake.id, tx);
    if (!created) throw new AppError("Practice could not be created");

    const questions = await createPracticeQuestions(
      created.id,
      sentences.map((sentence, index) => ({
        order: index,
        type: "translation",
        payload: {
          type: "translation",
          sourceSentence: sentence.native,
          expectedTranslation: sentence.english,
          glosses: sentence.glosses,
        },
      })),
      tx,
    );

    return { id: created.id, completedAt: null, questions };
  });
}

// Trusts the client, like completeQuizService: answers are not stored, so the
// server can't recount them.
export async function completePracticeService(
  mistakeId: string,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const practice = await getPracticeService(mistakeId);
  if (!practice) throw new AppError("Not found");

  await updatePractice(practice.id, { completedAt: new Date() });
}
