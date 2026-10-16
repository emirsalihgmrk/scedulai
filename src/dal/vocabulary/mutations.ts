import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import type { Transaction } from "@/db";
import {
  vocabularyCardsTable,
  vocabularyItemsTable,
  vocabularyReviewsTable,
} from "@/db/schema";
import type {
  CreateVocabularyItemInput,
  CreateVocabularyReviewInput,
  UpdateVocabularyItemInput,
  UpsertVocabularyCardInput,
} from "@/schemas/vocabulary";

// `undefined` when the user already saved the phrase.
export async function createVocabularyItem(
  userId: string,
  videoId: string | null,
  input: CreateVocabularyItemInput,
  tx?: Transaction,
): Promise<{ id: string } | undefined> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(vocabularyItemsTable)
    .values({ userId, videoId, ...input })
    .onConflictDoNothing()
    .returning({ id: vocabularyItemsTable.id });
  return row;
}

export async function updateVocabularyItem(
  userId: string,
  phrase: string,
  videoId: string | null,
  input: UpdateVocabularyItemInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .update(vocabularyItemsTable)
    .set({ videoId, ...input })
    .where(
      and(
        eq(vocabularyItemsTable.userId, userId),
        eq(vocabularyItemsTable.phrase, phrase),
      ),
    );
}

export async function upsertVocabularyCard(
  userId: string,
  vocabularyItemId: string,
  input: UpsertVocabularyCardInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .insert(vocabularyCardsTable)
    .values({ userId, vocabularyItemId, ...input })
    .onConflictDoUpdate({
      target: vocabularyCardsTable.vocabularyItemId,
      set: input,
    });
}

export async function createVocabularyReview(
  userId: string,
  vocabularyItemId: string,
  input: CreateVocabularyReviewInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .insert(vocabularyReviewsTable)
    .values({ userId, vocabularyItemId, ...input });
}

export async function deleteVocabularyItem(
  vocabularyItemId: string,
  userId: string,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .delete(vocabularyItemsTable)
    .where(
      and(
        eq(vocabularyItemsTable.id, vocabularyItemId),
        eq(vocabularyItemsTable.userId, userId),
      ),
    );
}
