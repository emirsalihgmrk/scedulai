import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

import DailySession, {
  DailySessionFallback,
} from "./_components/daily-session";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link href="/practice">
            <ChevronLeft data-icon="inline-start" />
            Practice
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Today&apos;s session
          </h1>
          <p className="text-sm text-muted-foreground">
            First the words that are due, then new sentences for your weakest
            grammar area. A miss comes back at the end until you get it right.
          </p>
        </div>
      </div>
      <Suspense fallback={<DailySessionFallback />}>
        <DailySession />
      </Suspense>
    </main>
  );
}
