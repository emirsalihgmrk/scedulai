import { and, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import { practicesTable } from "@/db/schema";
import type {
  PracticeListItem,
  PracticeWithQuestions,
} from "@/schemas/practice";

export async function getLatestPractice(
  userId: string,
  since: Date,
): Promise<PracticeWithQuestions | undefined> {
  return db.query.practicesTable.findFirst({
    where: and(
      eq(practicesTable.userId, userId),
      gte(practicesTable.createdAt, since),
    ),
    columns: { id: true, category: true, completedAt: true },
    with: {
      questions: {
        columns: { createdAt: false, updatedAt: false },
        orderBy: (questions, { asc }) => asc(questions.order),
      },
    },
    orderBy: (practices, { desc }) => desc(practices.createdAt),
  });
}

export async function getPractices(
  userId: string,
  since: Date,
): Promise<PracticeListItem[]> {
  return db.query.practicesTable.findMany({
    where: and(
      eq(practicesTable.userId, userId),
      gte(practicesTable.createdAt, since),
    ),
    columns: { category: true, completedAt: true, createdAt: true },
    orderBy: (practices, { desc }) => desc(practices.createdAt),
  });
}
