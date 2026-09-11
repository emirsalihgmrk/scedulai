import { db } from "@/db";
import { sectionProgressTable } from "@/db/schema";
import type { UpsertSectionProgressInput } from "@/schemas/program";

export async function upsertSectionProgress(
  userId: string,
  sectionId: string,
  input: UpsertSectionProgressInput,
): Promise<void> {
  await db
    .insert(sectionProgressTable)
    .values({ userId, sectionId, ...input })
    .onConflictDoUpdate({
      target: [sectionProgressTable.userId, sectionProgressTable.sectionId],
      set: input,
    });
}