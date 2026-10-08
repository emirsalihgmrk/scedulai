import { eq } from "drizzle-orm";

import { db } from "@/db";
import type { Transaction } from "@/db";
import { practicesTable } from "@/db/schema";
import type { UpdatePracticeInput } from "@/schemas/practice";

// `undefined` when the mistake already has a practice.
export async function createPractice(
  userId: string,
  mistakeId: string,
  tx?: Transaction,
): Promise<{ id: string } | undefined> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(practicesTable)
    .values({ userId, mistakeId })
    .onConflictDoNothing()
    .returning({ id: practicesTable.id });
  return row;
}

export async function updatePractice(
  practiceId: string,
  input: UpdatePracticeInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .update(practicesTable)
    .set(input)
    .where(eq(practicesTable.id, practiceId));
}
