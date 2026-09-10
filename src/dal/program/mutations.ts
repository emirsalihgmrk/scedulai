import { db } from "@/db";
import { sectionProgressTable } from "@/db/schema";
import type { UpdateVideoPositionInput } from "@/schemas/program";

export async function upsertVideoPosition(
  userId: string,
  sectionId: string,
  input: UpdateVideoPositionInput,
): Promise<void> {
  await db
    .insert(sectionProgressTable)
    .values({ userId, sectionId, ...input })
    .onConflictDoUpdate({
      target: [sectionProgressTable.userId, sectionProgressTable.sectionId],
      set: { videoPositionSeconds: input.videoPositionSeconds },
    });
}
