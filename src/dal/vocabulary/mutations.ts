import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import type { Transaction } from "@/db";
import { vocabularyItemsTable } from "@/db/schema";
import type {
  CreateVocabularyItemInput,
  UpdateVocabularyItemInput,
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
