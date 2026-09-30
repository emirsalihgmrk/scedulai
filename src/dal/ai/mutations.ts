import { db  } from "@/db";
import type {Transaction} from "@/db";
import { aiTracesTable } from "@/db/schema";
import type { CreateAiTraceInput } from "@/schemas/ai";

export async function createAiTrace(
  userId: string | null,
  input: CreateAiTraceInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor.insert(aiTracesTable).values({ userId, ...input });
}
