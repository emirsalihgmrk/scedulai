import { Suspense } from "react";

import Header from "@/components/shared/header";

import OnboardingRedirect from "./_components/onboarding-redirect";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <OnboardingRedirect />
      </Suspense>
      <Header />
      {children}
    </div>
  );
}
