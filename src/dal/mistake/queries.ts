import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { mistakesTable } from "@/db/schema";
import type { Mistake, MistakeListItem } from "@/schemas/mistake";

const mistakeColumns = {
  id: true,
  category: true,
  incorrect: true,
  correction: true,
  explanation: true,
  sourceSentence: true,
  userTranslation: true,
} as const;

export async function getMistakes(userId: string): Promise<MistakeListItem[]> {
  return db.query.mistakesTable.findMany({
    where: eq(mistakesTable.userId, userId),
    columns: { ...mistakeColumns, createdAt: true },
    with: {
      practice: { columns: { completedAt: true } },
    },
    orderBy: (mistakes, { desc }) => desc(mistakes.createdAt),
  });
}

export async function getMistake(
  mistakeId: string,
  userId: string,
): Promise<Mistake | undefined> {
  return db.query.mistakesTable.findFirst({
    where: and(
      eq(mistakesTable.id, mistakeId),
      eq(mistakesTable.userId, userId),
    ),
    columns: mistakeColumns,
  });
}
