import { redirect } from "next/navigation";

import { getCurrentUser } from "@/services/auth";
import { getCurrentLearningProfileService } from "@/services/learning-profile";
import OnboardingFlow from "./onboarding-flow";

// Open to guests (full flow, ending in the email/code step) and to signed-in
// users without a profile (account step skipped). Onboarded users are sent on.
export default async function OnboardingPageView() {
  const [user, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentLearningProfileService(),
  ]);
  if (profile) redirect("/programs");

  return (
    <OnboardingFlow
      viewer={
        user ? { name: user.name, nativeLanguage: user.nativeLanguage } : null
      }
    />
  );
}
