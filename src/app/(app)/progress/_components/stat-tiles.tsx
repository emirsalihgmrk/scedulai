import { BookOpenCheck, Headphones, Languages, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createElement } from "react";

import { Card } from "@/components/ui/card";
import { getProgressTotalsService } from "@/services/progress";

import { formatListeningTime, formatPercent } from "./format";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}

function StatTile({ icon, label, value, detail }: StatTileProps) {
  return (
    <Card className="gap-3 p-(--card-spacing)">
      <div className="flex items-center gap-2 text-muted-foreground">
        {createElement(icon, { className: "size-4" })}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="font-display text-3xl leading-none font-bold text-foreground tabular-nums">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{detail}</span>
    </Card>
  );
}

export default async function StatTiles() {
  const totals = await getProgressTotalsService();
  if (!totals) return null;

  return (
    <section
      aria-label="Totals"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      <StatTile
        icon={Headphones}
        label="Listening time"
        value={formatListeningTime(totals.listeningSeconds)}
        detail={`${formatListeningTime(totals.listeningSecondsThisWeek)} this week`}
      />
      <StatTile
        icon={BookOpenCheck}
        label="Words learned"
        value={String(totals.learnedWords)}
        detail={`of ${totals.savedWords} saved`}
      />
      <StatTile
        icon={Languages}
        label="Sentences translated"
        value={String(totals.answers)}
        detail={
          totals.firstTryAccuracy === null
            ? `${totals.answersThisWeek} this week`
            : `${formatPercent(totals.firstTryAccuracy)} right first try`
        }
      />
      <StatTile
        icon={ListChecks}
        label="Sections completed"
        value={String(totals.completedSections)}
        detail="Quizzes finished"
      />
    </section>
  );
}

export function StatTilesFallback() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <Card key={index} className="gap-3 p-(--card-spacing)">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </Card>
      ))}
    </div>
  );
}
