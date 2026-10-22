import { sql } from "drizzle-orm";

import { db } from "@/db";
import type { Transaction } from "@/db";
import { listeningDaysTable, sectionProgressTable } from "@/db/schema";
import type {
  UpsertListeningDayInput,
  UpsertSectionProgressInput,
} from "@/schemas/program";

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

// Accumulates: the seconds are added to the day's existing total.
export async function upsertListeningDay(
  userId: string,
  day: string,
  input: UpsertListeningDayInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .insert(listeningDaysTable)
    .values({ userId, day, ...input })
    .onConflictDoUpdate({
      target: [listeningDaysTable.userId, listeningDaysTable.day],
      set: {
        seconds: sql`${listeningDaysTable.seconds} + ${input.seconds}`,
        updatedAt: new Date(),
      },
    });
}
