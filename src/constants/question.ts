export const QUESTION_TYPES = ["translation", "fill-in-the-blank"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_DIRECTIONS = [
  "native-to-target",
  "target-to-native",
] as const;
export type QuestionDirection = (typeof QUESTION_DIRECTIONS)[number];
