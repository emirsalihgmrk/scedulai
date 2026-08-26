"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { signInSchema, signUpSchema } from "@/schemas/auth";
import type { SignInInput, SignUpInput } from "@/schemas/auth";
import type { ActionResult } from "@/types/action";

// better-auth surfaces expected failures (e.g. wrong password, email in use) as
// APIError — map those to a typed failure and let anything else bubble up.
function toActionFailure(error: unknown): Extract<ActionResult, { ok: false }> {
  if (error instanceof APIError) return { ok: false, error: error.message };
  throw error;
}

export async function signUpUser(data: SignUpInput): Promise<ActionResult> {
  const input = signUpSchema.parse(data);
  try {
    await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        nativeLanguage: input.nativeLanguage,
        plan: input.plan,
      },
      headers: await headers(),
    });
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function signInUser(data: SignInInput): Promise<ActionResult> {
  const input = signInSchema.parse(data);
  try {
    await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
        rememberMe: input.rememberMe,
      },
      headers: await headers(),
    });
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function signOutUser(): Promise<ActionResult> {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}