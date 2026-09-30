import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { userSchema  } from "@/schemas/user";
import type {User} from "@/schemas/user";

// better-auth owns sessions and the auth tables, so this module wraps its API
// instead of a DAL.

export const getCurrentUserService = cache(async (): Promise<User | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return userSchema.parse(session.user);
});

export async function signOutService(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
}
