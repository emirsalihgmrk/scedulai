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

// Where the graded answer came from: a section quiz or a mistake's practice.
export const MISTAKE_SOURCES = ["section", "practice"] as const;
export type MistakeSource = (typeof MISTAKE_SOURCES)[number];

export const MISTAKE_CATEGORY_LABELS: Record<MistakeCategory, string> = {
  tense: "Tense",
  "verb-form": "Verb form",
  agreement: "Agreement",
  article: "Article",
  preposition: "Preposition",
  "word-order": "Word order",
  "word-choice": "Word choice",
  plural: "Plural",
  pronoun: "Pronoun",
  spelling: "Spelling",
  other: "Other",
};
