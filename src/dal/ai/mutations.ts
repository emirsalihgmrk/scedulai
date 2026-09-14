import { db } from "@/db";
import { aiTracesTable } from "@/db/schema";
import type { CreateAiTraceInput } from "@/schemas/ai";

export async function createAiTrace(input: CreateAiTraceInput): Promise<void> {
  await db.insert(aiTracesTable).values(input);
}
