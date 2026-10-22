import { Suspense } from "react";

import NavTabs, { NavTabsFallback } from "@/components/shared/nav-tabs";

// The mobile counterpart of Header. Its height (h-16 plus the safe area) is
// reserved at the bottom of the (app) layout.
export default function BottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      <Suspense fallback={<NavTabsFallback variant="bottom" />}>
        <NavTabs variant="bottom" />
      </Suspense>
    </div>
  );
}
