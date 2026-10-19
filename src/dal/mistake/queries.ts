import { and, eq, gte } from "drizzle-orm";

import type { MistakeSource } from "@/constants/mistake";
import { db } from "@/db";
import { mistakesTable } from "@/db/schema";
import type { MistakeListItem } from "@/schemas/mistake";

const mistakeColumns = {
  id: true,
  category: true,
  incorrect: true,
  correction: true,
  explanation: true,
  sourceSentence: true,
  userTranslation: true,
} as const;

export async function getMistakes(
  userId: string,
  source: MistakeSource,
): Promise<MistakeListItem[]> {
  return db.query.mistakesTable.findMany({
    where: and(
      eq(mistakesTable.userId, userId),
      eq(mistakesTable.source, source),
    ),
    columns: { ...mistakeColumns, createdAt: true },
    orderBy: (mistakes, { desc }) => desc(mistakes.createdAt),
  });
}

export async function getRecentMistakes(
  userId: string,
  since: Date,
): Promise<MistakeListItem[]> {
  return db.query.mistakesTable.findMany({
    where: and(
      eq(mistakesTable.userId, userId),
      gte(mistakesTable.createdAt, since),
    ),
    columns: { ...mistakeColumns, createdAt: true },
    orderBy: (mistakes, { desc }) => desc(mistakes.createdAt),
  });
}
