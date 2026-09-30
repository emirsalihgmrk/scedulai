import { redirect } from "next/navigation";

import { getCurrentUserService } from "@/services/auth";
import { getLearningProfileService } from "@/services/learning-profile";

// Signed-in users without a learning profile haven't finished onboarding.
// Guests are never redirected. Rendered inside Suspense so the layout stays
// synchronous and the page streams in parallel.
export default async function OnboardingRedirect() {
  const [user, profile] = await Promise.all([
    getCurrentUserService(),
    getLearningProfileService(),
  ]);
  if (user && !profile) redirect("/onboarding");
  return null;
}
