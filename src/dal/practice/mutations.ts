import { eq } from "drizzle-orm";

import { db } from "@/db";
import type { Transaction } from "@/db";
import { practicesTable } from "@/db/schema";
import type {
  CreatePracticeInput,
  UpdatePracticeInput,
} from "@/schemas/practice";

export async function createPractice(
  userId: string,
  input: CreatePracticeInput,
  tx?: Transaction,
): Promise<{ id: string }> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(practicesTable)
    .values({ userId, ...input })
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
