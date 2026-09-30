import { Suspense } from "react";

import OnboardingFlow, { OnboardingFlowFallback } from "./onboarding-flow";

export default function PageView() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col px-6 py-8">
      <Suspense fallback={<OnboardingFlowFallback />}>
        <OnboardingFlow />
      </Suspense>
    </main>
  );
}
