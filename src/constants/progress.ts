export const QUIZ_STATUSES = ["in_progress", "passed", "failed"] as const;
export type QuizStatus = (typeof QUIZ_STATUSES)[number];