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
  UpsertVocabularyCardInput,
  UpsertVocabularyItemInput,
} from "@/schemas/vocabulary";

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

export async function upsertVocabularyItem(
  userId: string,
  videoId: string | null,
  input: UpsertVocabularyItemInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  const { phrase, ...fields } = input;
  await executor
    .insert(vocabularyItemsTable)
    .values({ userId, videoId, phrase, ...fields })
    .onConflictDoUpdate({
      target: [vocabularyItemsTable.userId, vocabularyItemsTable.phrase],
      set: { videoId, ...fields },
    });
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
