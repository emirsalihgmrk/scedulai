import { db } from "@/db";
import type { Transaction } from "@/db";
import { mistakesTable } from "@/db/schema";
import type { CreateMistakeInput } from "@/schemas/mistake";

export async function createMistakes(
  userId: string,
  questionId: string,
  input: CreateMistakeInput[],
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .insert(mistakesTable)
    .values(input.map((mistake) => ({ userId, questionId, ...mistake })));
}
