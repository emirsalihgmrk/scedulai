import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { userSchema } from "@/schemas/auth";
import { readDemoUser } from "@/lib/demo"; //DEMO

export const getCurrentUser = cache(async () => {
  //DEMO: demo cookie varsa gerçek session'ı atla, demo user döndür
  const demoUser = await readDemoUser();
  if (demoUser) return demoUser;

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
