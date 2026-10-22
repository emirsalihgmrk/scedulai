// How far back the progress page looks: the activity calendar's 16 weeks.
export const ACTIVITY_WEEKS = 16;
export const PROGRESS_WINDOW_DAYS = ACTIVITY_WEEKS * 7;

// Accuracy is compared over two back-to-back periods of this many weeks.
export const TREND_WEEKS = 4;
// A period with fewer first attempts than this shows no rate: a handful of
// answers would swing it wildly.
export const MIN_TREND_ANSWERS = 10;

// A word is learned once FSRS schedules its next review this many days out
// (Anki's "mature").
export const LEARNED_MIN_DAYS = 21;
export const RECALL_WINDOW_DAYS = 30;
export const DUE_FORECAST_DAYS = 7;

// A level is "comfortable" with enough first attempts on its videos, recently
// enough, at this accuracy or better.
export const LEVEL_WINDOW_DAYS = 90;
export const LEVEL_MIN_ANSWERS = 10;
export const LEVEL_PASS_RATIO = 0.7;
