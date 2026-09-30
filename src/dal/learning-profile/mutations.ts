import { db  } from "@/db";
import type {Transaction} from "@/db";
import { learningProfilesTable } from "@/db/schema";
import type { CreateLearningProfileInput } from "@/schemas/learning-profile";

// `undefined` when the user already has a profile for this target language.
export async function createLearningProfile(
  userId: string,
  input: CreateLearningProfileInput,
  tx?: Transaction,
): Promise<{ id: string } | undefined> {
  const executor = tx ?? db;
  const [row] = await executor
    .insert(learningProfilesTable)
    .values({ userId, ...input })
    .onConflictDoNothing({
      target: [
        learningProfilesTable.userId,
        learningProfilesTable.targetLanguage,
      ],
    })
    .returning({ id: learningProfilesTable.id });
  return row;
}
