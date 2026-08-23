"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { SignInInput, SignUpInput } from "@/schemas/auth";

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };

export async function signUpUser(data: SignUpInput): Promise<AuthResult> {
  try {
    await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
        nativeLanguage: data.nativeLanguage,
        plan: data.plan,
      },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof APIError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

export async function signInUser(data: SignInInput): Promise<AuthResult> {
  try {
    await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof APIError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

export async function signOutUser() {
  return auth.api.signOut({
    headers: await headers(),
  });
}