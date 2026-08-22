"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { SignInInput, SignUpInput } from "@/schemas/auth";

export async function signUpUser(data: SignUpInput) {
  return auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      nativeLanguage: data.nativeLanguage,
      plan: data.plan,
    },
    headers: await headers(),
  });
}

export async function signInUser(data: SignInInput) {
  return auth.api.signInEmail({
    body: {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    },
    headers: await headers(),
  });
}

export async function signOutUser() {
  return auth.api.signOut({
    headers: await headers(),
  });
}