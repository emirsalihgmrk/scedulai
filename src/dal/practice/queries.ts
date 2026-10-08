import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { practicesTable } from "@/db/schema";
import type { PracticeWithQuestions } from "@/schemas/practice";

export async function getPractice(
  mistakeId: string,
  userId: string,
): Promise<PracticeWithQuestions | undefined> {
  return db.query.practicesTable.findFirst({
    where: and(
      eq(practicesTable.mistakeId, mistakeId),
      eq(practicesTable.userId, userId),
    ),
    columns: { id: true },
    with: {
      questions: {
        columns: { createdAt: false, updatedAt: false },
        orderBy: (questions, { asc }) => asc(questions.order),
      },
    },
  });
}
