"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { toActionFailure } from "@/lib/action";
import { signInSchema, signUpSchema } from "@/schemas/auth";
import type { SignInInput, SignUpInput } from "@/schemas/auth";
import type { ActionResult } from "@/schemas/common";

export async function signUpUser(data: SignUpInput): Promise<ActionResult> {
  try {
    const input = signUpSchema.parse(data);
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
  try {
    const input = signInSchema.parse(data);
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