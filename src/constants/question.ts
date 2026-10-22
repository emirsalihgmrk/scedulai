export const QUESTION_TYPES = ["translation"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_DIRECTIONS = [
  "native-to-target",
  "target-to-native",
] as const;
export type QuestionDirection = (typeof QUESTION_DIRECTIONS)[number];

// A question's owner: a section quiz or a daily practice set.
export const QUESTION_SOURCES = ["section", "practice"] as const;
export type QuestionSource = (typeof QUESTION_SOURCES)[number];
