import { eq } from "drizzle-orm";

import { db  } from "@/db";
import type {Transaction} from "@/db";
import { userTable } from "@/db/schema";
import type { UpdateUserInput } from "@/schemas/user";

export async function updateUser(
  userId: string,
  input: UpdateUserInput,
  tx?: Transaction,
): Promise<void> {
  const executor = tx ?? db;
  // better-auth's user table has no $onUpdate hook, so bump it by hand.
  await executor
    .update(userTable)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(userTable.id, userId));
}
