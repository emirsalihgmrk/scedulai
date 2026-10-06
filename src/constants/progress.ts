export const QUIZ_STATUSES = ["in_progress", "passed", "failed"] as const;
export type QuizStatus = (typeof QUIZ_STATUSES)[number];

// Share of questions that must be answered correctly to pass a quiz.
export const QUIZ_PASS_RATIO = 0.75;
