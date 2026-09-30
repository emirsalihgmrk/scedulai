"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/schemas/common";

// Sign-in / sign-up go through authClient (emailOtp) so they pass the
// /api/auth rate limiter; only sign-out stays a server action.
export async function signOutUser(): Promise<ActionResult> {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
