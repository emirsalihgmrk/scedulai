import { db } from "@/db";
import { learningProfilesTable } from "@/db/schema";
import type { InsertLearningProfileInput } from "@/schemas/learning-profile";
import type { Transaction } from "@/schemas/common";

export async function createLearningProfile(
  userId: string,
  input: InsertLearningProfileInput,
  tx?: Transaction,
): Promise<{ id: string } | undefined> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(learningProfilesTable)
    .values({ userId, ...input })
    .onConflictDoNothing({
      target: [learningProfilesTable.userId, learningProfilesTable.targetLanguage],
    })
    .returning({ id: learningProfilesTable.id });
  return row;
}
