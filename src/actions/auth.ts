"use server";

import { toActionFailure  } from "@/lib/action";
import type {ActionResult} from "@/lib/action";
import { signOutService } from "@/services/auth";

export async function signOutAction(): Promise<ActionResult> {
  try {
    await signOutService();
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
