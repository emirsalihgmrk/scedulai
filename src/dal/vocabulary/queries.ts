import { and, eq, gte, lte, notExists } from "drizzle-orm";

import { db } from "@/db";
import {
  vocabularyCardsTable,
  vocabularyItemsTable,
  vocabularyReviewsTable,
} from "@/db/schema";
import type {
  VocabularyCardListItem,
  VocabularyItemListItem,
  VocabularyItemWithCard,
  VocabularyReviewListItem,
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

export async function getVocabularyItemCount(userId: string): Promise<number> {
  return db.$count(
    vocabularyItemsTable,
    eq(vocabularyItemsTable.userId, userId),
  );
}

export async function getVocabularyCards(
  userId: string,
): Promise<VocabularyCardListItem[]> {
  return db.query.vocabularyCardsTable.findMany({
    where: eq(vocabularyCardsTable.userId, userId),
    columns: { state: true, scheduledDays: true, due: true },
  });
}

export async function getVocabularyReviews(
  userId: string,
  since: Date,
): Promise<VocabularyReviewListItem[]> {
  return db.query.vocabularyReviewsTable.findMany({
    where: and(
      eq(vocabularyReviewsTable.userId, userId),
      gte(vocabularyReviewsTable.createdAt, since),
    ),
    columns: { rating: true, createdAt: true },
    orderBy: (reviews, { asc }) => asc(reviews.createdAt),
  });
}
