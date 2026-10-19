"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type {
  PhraseDefinition,
  ReviewVocabularyItemInput,
  SaveGlossInput,
  SaveTranscriptPhraseInput,
} from "@/schemas/vocabulary";
import {
  deleteVocabularyItemService,
  reviewVocabularyItemService,
  savePracticeGlossService,
  saveQuizGlossService,
  saveTranscriptPhraseService,
} from "@/services/vocabulary";

export async function saveTranscriptPhraseAction(
  sectionId: string,
  input: SaveTranscriptPhraseInput,
): Promise<ActionResult<PhraseDefinition>> {
  try {
    const data = await saveTranscriptPhraseService(sectionId, input);
    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function saveQuizGlossAction(
  sectionId: string,
  questionId: string,
  input: SaveGlossInput,
): Promise<ActionResult> {
  try {
    await saveQuizGlossService(sectionId, questionId, input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function savePracticeGlossAction(
  questionId: string,
  input: SaveGlossInput,
): Promise<ActionResult> {
  try {
    await savePracticeGlossService(questionId, input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function reviewVocabularyItemAction(
  vocabularyItemId: string,
  input: ReviewVocabularyItemInput,
): Promise<ActionResult> {
  try {
    await reviewVocabularyItemService(vocabularyItemId, input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function deleteVocabularyItemAction(
  vocabularyItemId: string,
): Promise<ActionResult> {
  try {
    await deleteVocabularyItemService(vocabularyItemId);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
