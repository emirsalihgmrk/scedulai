import { db } from "@/db";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UpdateUserInput } from "@/schemas/auth";
import type { Transaction } from "@/schemas/common";

export async function updateUser(
  userId: string,
  input: UpdateUserInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  await executor
    .update(userTable)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(userTable.id, userId));
}
