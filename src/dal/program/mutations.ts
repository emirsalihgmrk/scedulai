import { db } from "@/db";
import { sectionProgressTable } from "@/db/schema";
import type { SectionProgress } from "@/schemas/program";

export async function createSectionProgress(
  userId: string,
  sectionId: string,
): Promise<SectionProgress | undefined> {
  const [progress] = await db
    .insert(sectionProgressTable)
    .values({ userId, sectionId })
    .onConflictDoNothing()
    .returning({
      quizStatus: sectionProgressTable.quizStatus,
      videoPositionSeconds: sectionProgressTable.videoPositionSeconds,
      updatedAt: sectionProgressTable.updatedAt,
    });

  return progress;
}
