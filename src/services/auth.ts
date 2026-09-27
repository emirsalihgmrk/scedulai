import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { userSchema } from "@/schemas/auth";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    return userSchema.parse({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      nativeLanguage: session.user.nativeLanguage,
      targetLanguage: session.user.targetLanguage,
      plan: session.user.plan,
    });
  }
  return null;
});
