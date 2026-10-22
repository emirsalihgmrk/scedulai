import { cache } from "react";

import { definePhrase } from "@/ai/tasks/define-phrase";
import { getNativeLanguageEnglishName } from "@/constants/language";
import { PROGRESS_WINDOW_DAYS } from "@/constants/progress";
import {
  createVocabularyItem,
  createVocabularyReview,
  deleteVocabularyItem,
  upsertVocabularyCard,
  upsertVocabularyItem,
} from "@/dal/vocabulary/mutations";
import {
  getDueVocabularyItems,
  getNewVocabularyItems,
  getVocabularyCards,
  getVocabularyItem,
  getVocabularyItemCount,
  getVocabularyItems,
  getVocabularyReviews,
} from "@/dal/vocabulary/queries";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { scheduleReview } from "@/lib/fsrs";
import { matchPhrase, parseTimestamp } from "@/lib/utils";
import type { Question } from "@/schemas/quiz";
import {
  createVocabularyItemSchema,
  reviewVocabularyItemSchema,
  saveGlossSchema,
  saveTranscriptPhraseSchema,
  upsertVocabularyItemSchema,
} from "@/schemas/vocabulary";
import type {
  PhraseDefinition,
  ReviewVocabularyItemInput,
  SaveGlossInput,
  SaveTranscriptPhraseInput,
  VocabularyCardListItem,
  VocabularyItemListItem,
  VocabularyItemWithCard,
  VocabularyReviewListItem,
} from "@/schemas/vocabulary";
import { getCurrentUserService } from "@/services/auth";
import { getPracticeService } from "@/services/practice";
import { getQuizService } from "@/services/quiz";
import { getTranscriptService, getVideoService } from "@/services/video";

// One review session's size. New words are capped per session, not per day,
// because a daily cap needs the learner's time zone (Phase 3).
const DUE_CARD_LIMIT = 50;
const NEW_CARD_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export const getVocabularyItemsService = cache(
  async (): Promise<VocabularyItemListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getVocabularyItems(user.id);
  },
);

export const getDueVocabularyItemsService = cache(
  async (): Promise<VocabularyItemListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getDueVocabularyItems(user.id, new Date(), DUE_CARD_LIMIT);
  },
);

export const getNewVocabularyItemsService = cache(
  async (): Promise<VocabularyItemListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getNewVocabularyItems(user.id, NEW_CARD_LIMIT);
  },
);

export const getVocabularyItemService = cache(
  async (vocabularyItemId: string): Promise<VocabularyItemWithCard | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const item = await getVocabularyItem(vocabularyItemId, user.id);
    return item ?? null;
  },
);

export const getVocabularyItemCountService = cache(
  async (): Promise<number> => {
    const user = await getCurrentUserService();
    if (!user) return 0;
    return getVocabularyItemCount(user.id);
  },
);

export const getVocabularyCardsService = cache(
  async (): Promise<VocabularyCardListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getVocabularyCards(user.id);
  },
);

// Only as far back as the progress page looks.
export const getVocabularyReviewsService = cache(
  async (): Promise<VocabularyReviewListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    const since = new Date(Date.now() - PROGRESS_WINDOW_DAYS * DAY_MS);
    return getVocabularyReviews(user.id, since);
  },
);

// A phrase saved again from a transcript takes the new line as its context, so
// the card always shows the latest place it was seen in a video.
export async function saveTranscriptPhraseService(
  sectionId: string,
  input: SaveTranscriptPhraseInput,
): Promise<PhraseDefinition> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const { lineIndex, phrase } = saveTranscriptPhraseSchema.parse(input);

  const video = await getVideoService(sectionId);
  if (!video) throw new AppError("This section has no video");

  const lines = await getTranscriptService(video.id);
  const line = lines.at(lineIndex);
  if (!line) throw new AppError("Not found");
  if (!matchPhrase(line.text, phrase)) {
    throw new AppError("Those words are not in this line");
  }

  const definition = await definePhrase({
    phrase,
    sentence: line.text,
    nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
  });

  // The picked words are the phrase as the line says it, even when the model
  // turns it into dictionary form.
  const item = upsertVocabularyItemSchema.parse({
    ...definition,
    context: line.text,
    contextPhrase: phrase,
    timeSeconds: parseTimestamp(line.time),
  });

  await upsertVocabularyItem(user.id, video.id, item);

  return { phrase: item.phrase, meaning: item.meaning };
}

// A gloss already carries its translation, so no model call is needed. Saved
// again, it never replaces the existing item, whose context may come from a
// video.
async function saveGloss(
  userId: string,
  question: Question,
  glossPhrase: string,
  videoId: string | null,
): Promise<void> {
  const { payload } = question;
  if (payload.type !== "translation") {
    throw new AppError("Invalid question type");
  }
  const gloss = payload.glosses?.find(({ phrase }) => phrase === glossPhrase);
  if (!gloss) throw new AppError("Not found");

  const { expectedTranslation } = payload;
  await createVocabularyItem(
    userId,
    videoId,
    createVocabularyItemSchema.parse({
      phrase: gloss.meaning,
      meaning: gloss.phrase,
      context: expectedTranslation,
      // A gloss's English is in dictionary form, so the sentence holds it only
      // when it uses that form too ("meeting", but not "gave up").
      contextPhrase: matchPhrase(expectedTranslation, gloss.meaning)
        ? gloss.meaning
        : null,
      timeSeconds: null,
    }),
  );
}

export async function saveQuizGlossService(
  sectionId: string,
  questionId: string,
  input: SaveGlossInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const { phrase } = saveGlossSchema.parse(input);

  const [quiz, video] = await Promise.all([
    getQuizService(sectionId),
    getVideoService(sectionId),
  ]);
  const question = quiz?.questions.find(({ id }) => id === questionId);
  if (!question) throw new AppError("Not found");

  await saveGloss(user.id, question, phrase, video?.id ?? null);
}

export async function savePracticeGlossService(
  questionId: string,
  input: SaveGlossInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const { phrase } = saveGlossSchema.parse(input);

  const practice = await getPracticeService();
  const question = practice?.questions.find(({ id }) => id === questionId);
  if (!question) throw new AppError("Not found");

  await saveGloss(user.id, question, phrase, null);
}

export async function reviewVocabularyItemService(
  vocabularyItemId: string,
  input: ReviewVocabularyItemInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const { rating } = reviewVocabularyItemSchema.parse(input);

  const item = await getVocabularyItemService(vocabularyItemId);
  if (!item) throw new AppError("Not found");

  const card = scheduleReview(item.card, rating, new Date());

  await db.transaction(async (tx) => {
    await upsertVocabularyCard(user.id, item.id, card, tx);
    await createVocabularyReview(
      user.id,
      item.id,
      { rating, state: item.card?.state ?? "new" },
      tx,
    );
  });
}

export async function deleteVocabularyItemService(
  vocabularyItemId: string,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  await deleteVocabularyItem(vocabularyItemId, user.id);
}
