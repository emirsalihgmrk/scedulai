"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/programs", label: "Programs" },
  { href: "/practice", label: "Practice" },
  { href: "/account", label: "Account" },
] as const;

interface NavTabListProps {
  activeHref: string | null;
}

function NavTabList({ activeHref }: NavTabListProps) {
  return (
    <nav className="flex items-center justify-center gap-1">
      {TABS.map((tab) => {
        const isActive = tab.href === activeHref;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

// The pathname is request data on dynamic routes, so the header renders the
// tabs without a highlight (NavTabsFallback) until it resolves.
export default function NavTabs() {
  const pathname = usePathname();
  const activeTab = TABS.find(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  return <NavTabList activeHref={activeTab?.href ?? null} />;
}

export function NavTabsFallback() {
  return <NavTabList activeHref={null} />;
}
