import { Suspense } from "react";

import BottomNav from "@/components/shared/bottom-nav";
import Header from "@/components/shared/header";

import OnboardingRedirect from "./_components/onboarding-redirect";
import TimeZoneSync from "./_components/time-zone-sync";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-screen bg-background pb-[calc(--spacing(16)+env(safe-area-inset-bottom))] sm:pb-0">
      <Suspense fallback={null}>
        <OnboardingRedirect />
      </Suspense>
      <Suspense fallback={null}>
        <TimeZoneSync />
      </Suspense>
      <Header />
      {children}
      <BottomNav />
    </div>
  );
}
