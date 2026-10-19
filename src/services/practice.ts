import { cache } from "react";

import { generatePracticeSentences } from "@/ai/tasks/generate-practice-sentences";
import { getNativeLanguageEnglishName } from "@/constants/language";
import { RECENT_MISTAKE_DAYS } from "@/constants/mistake";
import type { MistakeCategory } from "@/constants/mistake";
import { createPractice, updatePractice } from "@/dal/practice/mutations";
import { getLatestPractice, getPractices } from "@/dal/practice/queries";
import { createPracticeQuestions } from "@/dal/quiz/mutations";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import type { MistakeListItem } from "@/schemas/mistake";
import type {
  PracticeListItem,
  PracticeTarget,
  PracticeWithQuestions,
} from "@/schemas/practice";
import { getCurrentUserService } from "@/services/auth";
import { getLearningProfileService } from "@/services/learning-profile";
import { getRecentMistakesService } from "@/services/mistake";

const QUESTION_COUNT = 5;
const EXAMPLE_MISTAKE_LIMIT = 5;
const HOUR_MS = 60 * 60 * 1000;
// "Today" until the learner's time zone is known (Phase 3): a set made within
// this window is today's, so a daily habit at a drifting hour still gets one
// set a day.
const DAY_WINDOW_HOURS = 20;

// Every set the weakness rule may need: one older than the mistake window
// changes nothing, since every mistake it could discount is out of the window.
export const getPracticesService = cache(
  async (): Promise<PracticeListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    const since = new Date(Date.now() - RECENT_MISTAKE_DAYS * 24 * HOUR_MS);
    return getPractices(user.id, since);
  },
);

// Today's set.
export const getPracticeService = cache(
  async (): Promise<PracticeWithQuestions | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const since = new Date(Date.now() - DAY_WINDOW_HOURS * HOUR_MS);
    const practice = await getLatestPractice(user.id, since);
    return practice ?? null;
  },
);

interface CategoryWeakness {
  category: MistakeCategory;
  mistakes: MistakeListItem[];
  lastDrilledAt: number;
}

// A category is as weak as the mistakes made in it since it was last drilled
// (or within the window, if never), so a set answered without a mistake moves
// the session on to another category. Only a finished set counts as drilled:
// an abandoned one leaves its mistakes to come back. It counts from its
// creation, so mistakes made during the set still count. Ties go to the
// category drilled least recently, then to the one with the newest mistake.
// "other" can't be drilled.
function getWeakestCategory(
  mistakes: MistakeListItem[],
  practices: PracticeListItem[],
): CategoryWeakness | null {
  const lastDrilledAt = new Map<MistakeCategory, number>();
  for (const practice of practices) {
    if (!practice.completedAt) continue;
    if (!lastDrilledAt.has(practice.category)) {
      lastDrilledAt.set(practice.category, practice.createdAt.getTime());
    }
  }

  const weaknesses = new Map<MistakeCategory, CategoryWeakness>();
  for (const mistake of mistakes) {
    if (mistake.category === "other") continue;
    const drilledAt = lastDrilledAt.get(mistake.category) ?? -Infinity;
    if (mistake.createdAt.getTime() <= drilledAt) continue;
    const weakness = weaknesses.get(mistake.category) ?? {
      category: mistake.category,
      mistakes: [],
      lastDrilledAt: drilledAt,
    };
    weakness.mistakes.push(mistake);
    weaknesses.set(mistake.category, weakness);
  }

  const [weakest] = [...weaknesses.values()].sort(
    (a, b) =>
      b.mistakes.length - a.mistakes.length ||
      a.lastDrilledAt - b.lastDrilledAt ||
      b.mistakes[0].createdAt.getTime() - a.mistakes[0].createdAt.getTime(),
  );
  return weakest ?? null;
}

// Every attempt writes its mistakes again, so a retried sentence would
// otherwise fill the examples with copies of one mistake.
function getExampleMistakes(mistakes: MistakeListItem[]): MistakeListItem[] {
  const seen = new Set<string>();
  return mistakes
    .filter((mistake) => {
      const key = `${mistake.incorrect}\n${mistake.correction}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, EXAMPLE_MISTAKE_LIMIT);
}

// What a new set would drill; derived from the mistake and practice reads
// rather than mirroring a DAL query.
export const getPracticeTargetService = cache(
  async (): Promise<PracticeTarget | null> => {
    const [mistakes, practices] = await Promise.all([
      getRecentMistakesService(),
      getPracticesService(),
    ]);
    const weakest = getWeakestCategory(mistakes, practices);
    if (!weakest) return null;
    return {
      category: weakest.category,
      mistakes: getExampleMistakes(weakest.mistakes),
    };
  },
);

// Generated once a day: today's set is returned without calling the model, so
// repeated requests never repeat the cost. Two requests racing past the check
// can each create a set; the newer one wins, which is harmless.
export async function generatePracticeByAiService(): Promise<PracticeWithQuestions> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const [practice, target, profile] = await Promise.all([
    getPracticeService(),
    getPracticeTargetService(),
    getLearningProfileService(),
  ]);
  if (practice) return practice;
  if (!target) throw new AppError("No mistakes to practice yet");

  const { sentences } = await generatePracticeSentences({
    category: target.category,
    mistakes: target.mistakes,
    nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
    level: profile?.level ?? null,
    count: QUESTION_COUNT,
  });

  return db.transaction(async (tx) => {
    const created = await createPractice(
      user.id,
      { category: target.category },
      tx,
    );

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

    return {
      id: created.id,
      category: target.category,
      completedAt: null,
      questions,
    };
  });
}

// Trusts the client, like completeQuizService: answers are not stored, so the
// server can't recount them.
export async function completePracticeService(): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const practice = await getPracticeService();
  if (!practice) throw new AppError("Not found");

  await updatePractice(practice.id, { completedAt: new Date() });
}
