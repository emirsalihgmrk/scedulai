"use client";

import {
  BookMarked,
  ChartLine,
  CircleUser,
  Dumbbell,
  LibraryBig,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/progress", label: "Progress", icon: ChartLine },
  { href: "/programs", label: "Programs", icon: LibraryBig },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/vocabulary", label: "Vocabulary", icon: BookMarked },
  { href: "/account", label: "Account", icon: CircleUser },
] as const;

type NavTabsVariant = "top" | "bottom";

const LIST_CLASSES: Record<NavTabsVariant, string> = {
  top: "flex items-center justify-center gap-1",
  bottom: "grid h-16 grid-cols-5",
};

const TAB_CLASSES: Record<NavTabsVariant, string> = {
  top: "rounded-md px-3 py-1.5 text-sm",
  bottom: "flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-xs",
};

interface NavTabListProps {
  variant: NavTabsVariant;
  activeHref: string | null;
}

function NavTabList({ variant, activeHref }: NavTabListProps) {
  return (
    <nav className={LIST_CLASSES[variant]}>
      {TABS.map((tab) => {
        const isActive = tab.href === activeHref;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              TAB_CLASSES[variant],
              variant === "top" &&
                (isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"),
              variant === "bottom" &&
                (isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"),
            )}
          >
            {variant === "bottom" && (
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-muted",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
            )}
            <span className={cn(variant === "bottom" && "max-w-full truncate")}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

interface NavTabsProps {
  variant: NavTabsVariant;
}

// The pathname is request data on dynamic routes, so the header renders the
// tabs without a highlight (NavTabsFallback) until it resolves.
export default function NavTabs({ variant }: NavTabsProps) {
  const pathname = usePathname();
  const activeTab = TABS.find(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  return <NavTabList variant={variant} activeHref={activeTab?.href ?? null} />;
}

export function NavTabsFallback({ variant }: NavTabsProps) {
  return <NavTabList variant={variant} activeHref={null} />;
}
