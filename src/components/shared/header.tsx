import { Suspense } from "react";

import NavTabs, { NavTabsFallback } from "@/components/shared/nav-tabs";

// Below `sm` the tabs move to BottomNav, and the header has nothing else.
export default function Header() {
  return (
    <header className="sticky top-0 z-10 hidden border-b border-border bg-background/85 backdrop-blur sm:block">
      <div className="flex items-center justify-center px-6 py-3">
        <Suspense fallback={<NavTabsFallback variant="top" />}>
          <NavTabs variant="top" />
        </Suspense>
      </div>
    </header>
  );
}
