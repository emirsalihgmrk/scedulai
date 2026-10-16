import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
} from "ts-fsrs";
import type { Card, Grade } from "ts-fsrs";

import type { CardState, ReviewRating } from "@/constants/vocabulary";
import type {
  UpsertVocabularyCardInput,
  VocabularyCard,
} from "@/schemas/vocabulary";

// Long-term scheduling only: a card gets one review a day. A miss is re-asked
// within the session by the review card, without another review.
const scheduler = fsrs(
  generatorParameters({ enable_fuzz: true, enable_short_term: false }),
);

const CARD_STATES_BY_FSRS_STATE: Record<State, CardState> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

const FSRS_STATES_BY_CARD_STATE: Record<CardState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

const FSRS_GRADES_BY_REVIEW_RATING: Record<ReviewRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

function toFsrsCard(card: VocabularyCard | null, now: Date): Card {
  if (!card) return createEmptyCard(now);
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    // Deprecated in ts-fsrs; it is derived from `last_review` on every review.
    elapsed_days: 0,
    scheduled_days: card.scheduledDays,
    learning_steps: card.learningSteps,
    reps: card.reps,
    lapses: card.lapses,
    state: FSRS_STATES_BY_CARD_STATE[card.state],
    last_review: card.lastReviewedAt,
  };
}

function fromFsrsCard(card: Card, reviewedAt: Date): UpsertVocabularyCardInput {
  return {
    state: CARD_STATES_BY_FSRS_STATE[card.state],
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    lastReviewedAt: reviewedAt,
  };
}

// A word without a card yet is new, so its first review starts from an empty
// card.
export function scheduleReview(
  card: VocabularyCard | null,
  rating: ReviewRating,
  now: Date,
): UpsertVocabularyCardInput {
  const next = scheduler.next(
    toFsrsCard(card, now),
    now,
    FSRS_GRADES_BY_REVIEW_RATING[rating],
  );
  return fromFsrsCard(next.card, now);
}
