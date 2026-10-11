import { eq } from "drizzle-orm";

import { db } from "@/db";
import { vocabularyItemsTable } from "@/db/schema";
import type { VocabularyItemListItem } from "@/schemas/vocabulary";

export async function getVocabularyItems(
  userId: string,
): Promise<VocabularyItemListItem[]> {
  return db.query.vocabularyItemsTable.findMany({
    where: eq(vocabularyItemsTable.userId, userId),
    columns: {
      id: true,
      phrase: true,
      meaning: true,
      context: true,
      timeSeconds: true,
      createdAt: true,
    },
    with: {
      video: { columns: { title: true } },
    },
    orderBy: (items, { desc }) => desc(items.createdAt),
  });
}
