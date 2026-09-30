import { eq } from "drizzle-orm";

import { db } from "@/db";
import { learningProfilesTable } from "@/db/schema";
import type { LearningProfile } from "@/schemas/learning-profile";

// Users have a single profile until multiple target languages ship; the most
// recently updated one is treated as active.
export async function getLearningProfile(
  userId: string,
): Promise<LearningProfile | undefined> {
  return db.query.learningProfilesTable.findFirst({
    where: eq(learningProfilesTable.userId, userId),
    columns: {
      id: true,
      targetLanguage: true,
      level: true,
      levelSource: true,
      goal: true,
      dailyMinutes: true,
    },
    orderBy: (profiles, { desc }) => desc(profiles.updatedAt),
  });
}
