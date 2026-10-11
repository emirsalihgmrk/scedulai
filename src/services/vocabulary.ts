import { cache } from "react";

import { definePhrase } from "@/ai/tasks/define-phrase";
import { getNativeLanguageEnglishName } from "@/constants/language";
import {
  createVocabularyItem,
  deleteVocabularyItem,
  updateVocabularyItem,
} from "@/dal/vocabulary/mutations";
import { getVocabularyItems } from "@/dal/vocabulary/queries";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { parseTimestamp } from "@/lib/utils";
import type { Question } from "@/schemas/quiz";
import {
  createVocabularyItemSchema,
  saveGlossSchema,
  saveTranscriptPhraseSchema,
} from "@/schemas/vocabulary";
import type {
  PhraseDefinition,
  SaveGlossInput,
  SaveTranscriptPhraseInput,
  VocabularyItemListItem,
} from "@/schemas/vocabulary";
import { getCurrentUserService } from "@/services/auth";
import { getPracticeService } from "@/services/practice";
import { getQuizService } from "@/services/quiz";
import { getTranscriptService, getVideoService } from "@/services/video";

export const getVocabularyItemsService = cache(
  async (): Promise<VocabularyItemListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getVocabularyItems(user.id);
  },
);

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ");
}

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
  if (!collapseWhitespace(line.text).toLowerCase().includes(phrase)) {
    throw new AppError("Those words are not in this line");
  }

  const definition = await definePhrase({
    phrase,
    sentence: line.text,
    nativeLanguage: getNativeLanguageEnglishName(user.nativeLanguage),
  });
  const item = createVocabularyItemSchema.parse({
    ...definition,
    context: line.text,
    timeSeconds: parseTimestamp(line.time),
  });

  await db.transaction(async (tx) => {
    const created = await createVocabularyItem(user.id, video.id, item, tx);
    if (created) return;
    const { meaning, context, timeSeconds } = item;
    await updateVocabularyItem(
      user.id,
      item.phrase,
      video.id,
      { meaning, context, timeSeconds },
      tx,
    );
  });

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

  await createVocabularyItem(
    userId,
    videoId,
    createVocabularyItemSchema.parse({
      phrase: gloss.meaning,
      meaning: gloss.phrase,
      context: payload.expectedTranslation,
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
  mistakeId: string,
  questionId: string,
  input: SaveGlossInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  const { phrase } = saveGlossSchema.parse(input);

  const practice = await getPracticeService(mistakeId);
  const question = practice?.questions.find(({ id }) => id === questionId);
  if (!question) throw new AppError("Not found");

  await saveGloss(user.id, question, phrase, null);
}

export async function deleteVocabularyItemService(
  vocabularyItemId: string,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) throw new AppError("Unauthorized");

  await deleteVocabularyItem(vocabularyItemId, user.id);
}
