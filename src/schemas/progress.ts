import type { CefrLevel, LevelSource } from "@/constants/learning";
import type { MistakeCategory } from "@/constants/mistake";

// The progress module has no tables: it summarises other modules' reads.

// ── Service result types ──

// `day` is the learner's local "YYYY-MM-DD".
export interface ActivityDay {
  day: string;
  listeningSeconds: number;
  answers: number;
  reviews: number;
}

export interface Activity {
  today: string;
  // Oldest first, ending today, ACTIVITY_WEEKS long.
  days: ActivityDay[];
  currentStreak: number;
  longestStreak: number;
  goalSeconds: number | null;
}

export interface ProgressTotals {
  listeningSeconds: number;
  listeningSecondsThisWeek: number;
  answers: number;
  answersThisWeek: number;
  firstTryAccuracy: number | null;
  learnedWords: number;
  savedWords: number;
  completedSections: number;
}

// Rates are 0–1 and null when a period has too few answers to mean anything.
export interface Trend {
  rate: number | null;
  previousRate: number | null;
  // Oldest first, one per week over both periods.
  weekly: (number | null)[];
}

// `rate` is the share of first attempts with a mistake in the category.
export interface CategoryTrend extends Trend {
  category: MistakeCategory;
  mistakes: number;
}

export interface AccuracyTrends {
  accuracy: Trend;
  answers: number;
  categories: CategoryTrend[];
}

export interface DueDay {
  day: string;
  count: number;
}

export interface VocabularyProgress {
  saved: number;
  unreviewed: number;
  learning: number;
  learned: number;
  recallRate: number | null;
  recentReviews: number;
  // Today first (overdue words included), DUE_FORECAST_DAYS long.
  dueForecast: DueDay[];
}

export interface LevelProgress {
  level: CefrLevel;
  answers: number;
  accuracy: number | null;
  isComfortable: boolean;
}

export interface LevelEstimate {
  profileLevel: CefrLevel | null;
  levelSource: LevelSource | null;
  estimate: CefrLevel | null;
  // The level above the estimate, null at C2.
  next: LevelProgress | null;
}
