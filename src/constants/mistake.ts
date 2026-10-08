export const MISTAKE_CATEGORIES = [
  "tense",
  "verb-form",
  "agreement",
  "article",
  "preposition",
  "word-order",
  "word-choice",
  "plural",
  "pronoun",
  "spelling",
  "other",
] as const;
export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number];
