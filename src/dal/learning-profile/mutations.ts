import { db  } from "@/db";
import type {Transaction} from "@/db";
import { learningProfilesTable } from "@/db/schema";
import type { CreateLearningProfileInput } from "@/schemas/learning-profile";

// `undefined` when the user already has a profile.
export async function createLearningProfile(
  userId: string,
  input: CreateLearningProfileInput,
  tx?: Transaction,
): Promise<{ id: string } | undefined> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(learningProfilesTable)
    .values({ userId, ...input })
    .onConflictDoNothing({ target: learningProfilesTable.userId })
    .returning({ id: learningProfilesTable.id });
  return row;
}
