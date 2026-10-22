import { cache } from "react";

import { CEFR_LEVELS } from "@/constants/learning";
import { MISTAKE_CATEGORIES } from "@/constants/mistake";
import {
  ACTIVITY_WEEKS,
  DUE_FORECAST_DAYS,
  LEARNED_MIN_DAYS,
  LEVEL_MIN_ANSWERS,
  LEVEL_PASS_RATIO,
  LEVEL_WINDOW_DAYS,
  MIN_TREND_ANSWERS,
  RECALL_WINDOW_DAYS,
  TREND_WEEKS,
} from "@/constants/progress";
import { addDays, getDaysBetween, getLocalDay } from "@/lib/time-zone";
import type {
  AccuracyTrends,
  Activity,
  ActivityDay,
  LevelEstimate,
  LevelProgress,
  ProgressTotals,
  Trend,
  VocabularyProgress,
} from "@/schemas/progress";
import type { GradeListItem } from "@/schemas/quiz";
import { getCurrentUserService } from "@/services/auth";
import { getLearningProfileService } from "@/services/learning-profile";
import {
  getCompletedSectionCountService,
  getListeningDaysService,
} from "@/services/program";
import { getGradeCountService, getGradesService } from "@/services/quiz";
import {
  getVocabularyCardsService,
  getVocabularyItemCountService,
  getVocabularyReviewsService,
} from "@/services/vocabulary";

const DAY_MS = 24 * 60 * 60 * 1000;

function getRate(hits: number, total: number, minTotal: number): number | null {
  return total >= minTotal && total > 0 ? hits / total : null;
}

// Any listening, answer or review makes a day active. The current streak still
// counts when today is empty so far: it only breaks once a whole day passes.
function getStreaks(
  activeDays: Set<string>,
  today: string,
): Pick<Activity, "currentStreak" | "longestStreak"> {
  let currentStreak = 0;
  let day = activeDays.has(today) ? today : addDays(today, -1);
  while (activeDays.has(day)) {
    currentStreak += 1;
    day = addDays(day, -1);
  }

  let longestStreak = 0;
  let run = 0;
  let previous: string | null = null;
  for (const active of [...activeDays].sort()) {
    run = previous && addDays(previous, 1) === active ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previous = active;
  }

  return { currentStreak, longestStreak };
}

export const getActivityService = cache(async (): Promise<Activity | null> => {
  const user = await getCurrentUserService();
  if (!user) return null;

  const [listeningDays, grades, reviews, profile] = await Promise.all([
    getListeningDaysService(),
    getGradesService(),
    getVocabularyReviewsService(),
    getLearningProfileService(),
  ]);

  const today = getLocalDay(new Date(), user.timeZone);
  const byDay = new Map<string, ActivityDay>();
  const getDay = (day: string) => {
    let entry = byDay.get(day);
    if (!entry) {
      entry = { day, listeningSeconds: 0, answers: 0, reviews: 0 };
      byDay.set(day, entry);
    }
    return entry;
  };

  for (const { day, seconds } of listeningDays) {
    getDay(day).listeningSeconds += seconds;
  }
  for (const grade of grades) {
    getDay(getLocalDay(grade.createdAt, user.timeZone)).answers += 1;
  }
  for (const review of reviews) {
    getDay(getLocalDay(review.createdAt, user.timeZone)).reviews += 1;
  }

  const activeDays = new Set(
    [...byDay.values()]
      .filter(
        (entry) =>
          entry.listeningSeconds > 0 || entry.answers > 0 || entry.reviews > 0,
      )
      .map((entry) => entry.day),
  );

  const dayCount = ACTIVITY_WEEKS * 7;
  const firstDay = addDays(today, -(dayCount - 1));
  const days = Array.from({ length: dayCount }, (_, index) => {
    const day = addDays(firstDay, index);
    return (
      byDay.get(day) ?? { day, listeningSeconds: 0, answers: 0, reviews: 0 }
    );
  });

  return {
    today,
    days,
    ...getStreaks(activeDays, today),
    goalSeconds: profile ? profile.dailyMinutes * 60 : null,
  };
});

export const getVocabularyProgressService = cache(
  async (): Promise<VocabularyProgress | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;

    const [saved, cards, reviews] = await Promise.all([
      getVocabularyItemCountService(),
      getVocabularyCardsService(),
      getVocabularyReviewsService(),
    ]);

    const learned = cards.filter(
      (card) =>
        card.state === "review" && card.scheduledDays >= LEARNED_MIN_DAYS,
    ).length;

    const recallSince = new Date(Date.now() - RECALL_WINDOW_DAYS * DAY_MS);
    const recent = reviews.filter((review) => review.createdAt >= recallSince);
    const recalled = recent.filter((review) => review.rating !== "again");

    const today = getLocalDay(new Date(), user.timeZone);
    const dueOffsets = cards.map((card) =>
      Math.max(0, getDaysBetween(today, getLocalDay(card.due, user.timeZone))),
    );
    const dueForecast = Array.from(
      { length: DUE_FORECAST_DAYS },
      (_, offset) => ({
        day: addDays(today, offset),
        count: dueOffsets.filter((dueOffset) => dueOffset === offset).length,
      }),
    );

    return {
      saved,
      unreviewed: Math.max(0, saved - cards.length),
      learning: cards.length - learned,
      learned,
      recallRate: getRate(recalled.length, recent.length, 1),
      recentReviews: recent.length,
      dueForecast,
    };
  },
);

export const getProgressTotalsService = cache(
  async (): Promise<ProgressTotals | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;

    const [listeningDays, grades, answers, vocabulary, completedSections] =
      await Promise.all([
        getListeningDaysService(),
        getGradesService(),
        getGradeCountService(),
        getVocabularyProgressService(),
        getCompletedSectionCountService(),
      ]);

    const today = getLocalDay(new Date(), user.timeZone);
    const weekStart = addDays(today, -6);
    const trendStart = addDays(today, -(TREND_WEEKS * 7 - 1));

    const listeningSeconds = listeningDays.reduce(
      (total, { seconds }) => total + seconds,
      0,
    );
    const listeningSecondsThisWeek = listeningDays
      .filter(({ day }) => day >= weekStart)
      .reduce((total, { seconds }) => total + seconds, 0);

    const gradeDays = grades.map((grade) => ({
      grade,
      day: getLocalDay(grade.createdAt, user.timeZone),
    }));
    const firstAttempts = gradeDays.filter(
      ({ grade, day }) => grade.isFirstAttempt && day >= trendStart,
    );

    return {
      listeningSeconds,
      listeningSecondsThisWeek,
      answers,
      answersThisWeek: gradeDays.filter(({ day }) => day >= weekStart).length,
      firstTryAccuracy: getRate(
        firstAttempts.filter(({ grade }) => grade.isCorrect).length,
        firstAttempts.length,
        1,
      ),
      learnedWords: vocabulary?.learned ?? 0,
      savedWords: vocabulary?.saved ?? 0,
      completedSections,
    };
  },
);

// Week 0 is the last 7 days, so the current period is weeks below
// TREND_WEEKS and the previous one the TREND_WEEKS before it.
interface WeekGrade {
  week: number;
  grade: GradeListItem;
}

function getTrend(
  firstAttempts: WeekGrade[],
  isHit: (grade: GradeListItem) => boolean,
): Trend {
  const weekCount = TREND_WEEKS * 2;
  const hits = Array<number>(weekCount).fill(0);
  const totals = Array<number>(weekCount).fill(0);
  for (const { week, grade } of firstAttempts) {
    totals[week] += 1;
    if (isHit(grade)) hits[week] += 1;
  }

  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  return {
    rate: getRate(
      sum(hits.slice(0, TREND_WEEKS)),
      sum(totals.slice(0, TREND_WEEKS)),
      MIN_TREND_ANSWERS,
    ),
    previousRate: getRate(
      sum(hits.slice(TREND_WEEKS)),
      sum(totals.slice(TREND_WEEKS)),
      MIN_TREND_ANSWERS,
    ),
    weekly: totals
      .map((total, week) => getRate(hits[week], total, 1))
      .reverse(),
  };
}

// Only first attempts count: a retry comes right after seeing the correction.
// `other` is left out, as in the daily session.
export const getAccuracyTrendsService = cache(
  async (): Promise<AccuracyTrends | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;

    const grades = await getGradesService();
    const today = getLocalDay(new Date(), user.timeZone);

    const firstAttempts = grades
      .filter((grade) => grade.isFirstAttempt)
      .map((grade) => ({
        grade,
        week: Math.floor(
          getDaysBetween(getLocalDay(grade.createdAt, user.timeZone), today) /
            7,
        ),
      }))
      .filter(({ week }) => week >= 0 && week < TREND_WEEKS * 2);

    const categories = MISTAKE_CATEGORIES.filter(
      (category) => category !== "other",
    )
      .map((category) => ({
        category,
        mistakes: firstAttempts.filter(
          ({ week, grade }) =>
            week < TREND_WEEKS &&
            grade.mistakes.some((mistake) => mistake.category === category),
        ).length,
        ...getTrend(firstAttempts, (grade) =>
          grade.mistakes.some((mistake) => mistake.category === category),
        ),
      }))
      .filter((trend) => trend.weekly.some((rate) => rate !== null && rate > 0))
      .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));

    return {
      accuracy: getTrend(firstAttempts, (grade) => grade.isCorrect),
      answers: firstAttempts.filter(({ week }) => week < TREND_WEEKS).length,
      categories,
    };
  },
);

// Measured on section quizzes only, whose videos carry a level. The estimate
// never drops below the profile's level: easy videos answered well say nothing
// about harder ones.
export const getLevelEstimateService = cache(
  async (): Promise<LevelEstimate | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;

    const [grades, profile] = await Promise.all([
      getGradesService(),
      getLearningProfileService(),
    ]);

    const since = new Date(Date.now() - LEVEL_WINDOW_DAYS * DAY_MS);
    const recent = grades.filter(
      (grade) => grade.isFirstAttempt && grade.createdAt >= since,
    );

    const levels: LevelProgress[] = CEFR_LEVELS.map((level) => {
      const atLevel = recent.filter(
        (grade) => grade.question?.quiz?.section.video?.cefrLevel === level,
      );
      const correct = atLevel.filter((grade) => grade.isCorrect).length;
      const accuracy = getRate(correct, atLevel.length, 1);
      return {
        level,
        answers: atLevel.length,
        accuracy,
        isComfortable:
          atLevel.length >= LEVEL_MIN_ANSWERS &&
          (accuracy ?? 0) >= LEVEL_PASS_RATIO,
      };
    });

    const comfortableIndex = levels.findLastIndex(
      (level) => level.isComfortable,
    );
    const profileIndex = profile?.level
      ? CEFR_LEVELS.indexOf(profile.level)
      : -1;
    const estimateIndex = Math.max(comfortableIndex, profileIndex);

    return {
      profileLevel: profile?.level ?? null,
      levelSource: profile?.levelSource ?? null,
      estimate: estimateIndex >= 0 ? CEFR_LEVELS[estimateIndex] : null,
      next: levels[estimateIndex + 1] ?? null,
    };
  },
);
