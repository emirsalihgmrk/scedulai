import { db } from "@/db";
import { sectionProgressTable } from "@/db/schema";
import type { UpsertSectionProgressInput } from "@/schemas/program";
import type { Transaction } from "@/schemas/common";

export async function upsertSectionProgress(
  userId: string,
  sectionId: string,
  input: UpsertSectionProgressInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .insert(sectionProgressTable)
    .values({ userId, sectionId, ...input })
    .onConflictDoUpdate({
      target: [sectionProgressTable.userId, sectionProgressTable.sectionId],
      set: input,
    });
}