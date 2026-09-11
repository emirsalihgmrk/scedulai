export const QUIZ_STATUSES = ["in_progress", "passed", "failed"] as const;
export type QuizStatus = (typeof QUIZ_STATUSES)[number];

// Minimum average accuracy (%) required to pass a quiz.
export const QUIZ_PASS_ACCURACY = 75;