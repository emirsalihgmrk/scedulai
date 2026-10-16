// A saved word's place in the spaced-repetition schedule (FSRS). A word with no
// card yet is new; "new" is stored only as the state a review started from.
export const CARD_STATES = ["new", "learning", "review", "relearning"] as const;
export type CardState = (typeof CARD_STATES)[number];

export const REVIEW_RATINGS = ["again", "hard", "good", "easy"] as const;
export type ReviewRating = (typeof REVIEW_RATINGS)[number];
