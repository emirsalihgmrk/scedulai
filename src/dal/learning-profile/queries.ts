import { eq } from "drizzle-orm";

import { db } from "@/db";
import { learningProfilesTable } from "@/db/schema";
import type { LearningProfile } from "@/schemas/learning-profile";

export async function getLearningProfile(
  userId: string,
): Promise<LearningProfile | undefined> {
  return db.query.learningProfilesTable.findFirst({
    where: eq(learningProfilesTable.userId, userId),
    columns: {
      id: true,
      level: true,
      levelSource: true,
      goal: true,
      dailyMinutes: true,
    },
  });
}
