import { and, eq, lte, notExists } from "drizzle-orm";

import { db } from "@/db";
import { vocabularyCardsTable, vocabularyItemsTable } from "@/db/schema";
import type {
  VocabularyItemListItem,
  VocabularyItemWithCard,
} from "@/schemas/vocabulary";

const LIST_ITEM_COLUMNS = {
  id: true,
  phrase: true,
  meaning: true,
  context: true,
  contextPhrase: true,
  timeSeconds: true,
  createdAt: true,
} as const;

export async function getVocabularyItems(
  userId: string,
): Promise<VocabularyItemListItem[]> {
  return db.query.vocabularyItemsTable.findMany({
    where: eq(vocabularyItemsTable.userId, userId),
    columns: LIST_ITEM_COLUMNS,
    with: {
      video: { columns: { title: true } },
    },
    orderBy: (items, { desc }) => desc(items.createdAt),
  });
}

// Items whose card is due by `now`, the most overdue first.
export async function getDueVocabularyItems(
  userId: string,
  now: Date,
  limit: number,
): Promise<VocabularyItemListItem[]> {
  const rows = await db.query.vocabularyCardsTable.findMany({
    where: and(
      eq(vocabularyCardsTable.userId, userId),
      lte(vocabularyCardsTable.due, now),
    ),
    columns: {},
    with: {
      vocabularyItem: {
        columns: LIST_ITEM_COLUMNS,
        with: {
          video: { columns: { title: true } },
        },
      },
    },
    orderBy: (cards, { asc }) => asc(cards.due),
    limit,
  });
  return rows.map(({ vocabularyItem }) => vocabularyItem);
}

// Items never reviewed (they have no card yet), the oldest saved first.
export async function getNewVocabularyItems(
  userId: string,
  limit: number,
): Promise<VocabularyItemListItem[]> {
  return db.query.vocabularyItemsTable.findMany({
    where: (items) =>
      and(
        eq(items.userId, userId),
        notExists(
          db
            .select({ id: vocabularyCardsTable.id })
            .from(vocabularyCardsTable)
            .where(eq(vocabularyCardsTable.vocabularyItemId, items.id)),
        ),
      ),
    columns: LIST_ITEM_COLUMNS,
    with: {
      video: { columns: { title: true } },
    },
    orderBy: (items, { asc }) => asc(items.createdAt),
    limit,
  });
}

export async function getVocabularyItem(
  vocabularyItemId: string,
  userId: string,
): Promise<VocabularyItemWithCard | undefined> {
  return db.query.vocabularyItemsTable.findFirst({
    where: and(
      eq(vocabularyItemsTable.id, vocabularyItemId),
      eq(vocabularyItemsTable.userId, userId),
    ),
    columns: { id: true },
    with: {
      card: {
        columns: {
          state: true,
          due: true,
          stability: true,
          difficulty: true,
          scheduledDays: true,
          learningSteps: true,
          reps: true,
          lapses: true,
          lastReviewedAt: true,
        },
      },
    },
  });
}
