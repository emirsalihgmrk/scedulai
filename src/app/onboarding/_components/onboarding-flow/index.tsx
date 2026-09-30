import { redirect } from "next/navigation";

import { getCurrentUserService } from "@/services/auth";
import { getLearningProfileService } from "@/services/learning-profile";

import Wizard from "./wizard";

// Open to guests (full flow, ending in the email/code step) and to signed-in
// users without a profile (account step skipped). Onboarded users are sent on.
export default async function OnboardingFlow() {
  const [user, profile] = await Promise.all([
    getCurrentUserService(),
    getLearningProfileService(),
  ]);
  if (profile) redirect("/programs");

  return (
    <Wizard
      viewer={
        user ? { name: user.name, nativeLanguage: user.nativeLanguage } : null
      }
    />
  );
}

export function OnboardingFlowFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="h-6 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-2 w-full animate-pulse rounded-full bg-muted" />
      <div className="mt-8 flex flex-col gap-3">
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
