import { Flame, GraduationCap, LogIn } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createElement } from "react";
import type { ReactNode } from "react";

import CefrBadge from "@/components/shared/cefr-badge";
import EmptyState from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { pluralize } from "@/lib/utils";
import { getCurrentUserService } from "@/services/auth";
import { getLatestSectionProgressService } from "@/services/program";
import {
  getActivityService,
  getLevelEstimateService,
} from "@/services/progress";

import ContinueWatching from "./continue-watching";
import GoalRing from "./goal-ring";

interface HeroStatProps {
  visual: ReactNode;
  label: string;
  value: string;
  detail: string;
}

function HeroStat({ visual, label, value, detail }: HeroStatProps) {
  return (
    <div className="flex items-center gap-3">
      {visual}
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="font-display text-lg leading-tight font-bold text-foreground">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </div>
    </div>
  );
}

interface IconTileProps {
  icon: LucideIcon;
}

function IconTile({ icon }: IconTileProps) {
  return (
    <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      {createElement(icon, { className: "size-7" })}
    </span>
  );
}

export default async function ProgressHero() {
  const [user, activity, estimate, latest] = await Promise.all([
    getCurrentUserService(),
    getActivityService(),
    getLevelEstimateService(),
    getLatestSectionProgressService(),
  ]);

  if (!user || !activity) {
    return (
      <EmptyState
        icon={LogIn}
        title="Sign in to see your progress"
        description="Listening time, saved words and grammar trends are kept in your account."
      />
    );
  }

  const todaySeconds = activity.days.at(-1)?.listeningSeconds ?? 0;
  const { goalSeconds, currentStreak, longestStreak } = activity;
  const isGoalMet = goalSeconds !== null && todaySeconds >= goalSeconds;

  return (
    <Card className="grid grid-cols-1 gap-6 p-(--card-spacing) [--card-spacing:--spacing(5)] md:grid-cols-[1fr_minmax(0,340px)] md:gap-8">
      <div className="flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Welcome back, {user.name.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isGoalMet
              ? "Today's listening goal is done. Everything else is a bonus."
              : currentStreak > 0
                ? "Keep your streak going: a few minutes today is enough."
                : "A few minutes today starts a new streak."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {goalSeconds !== null && (
            <HeroStat
              visual={
                <GoalRing seconds={todaySeconds} goalSeconds={goalSeconds} />
              }
              label="Today"
              value={`${Math.floor(todaySeconds / 60)} / ${goalSeconds / 60} min`}
              detail={isGoalMet ? "Goal reached" : "Listening goal"}
            />
          )}
          <HeroStat
            visual={<IconTile icon={Flame} />}
            label="Streak"
            value={pluralize(currentStreak, "day")}
            detail={`Best: ${pluralize(longestStreak, "day")}`}
          />
          <HeroStat
            visual={<IconTile icon={GraduationCap} />}
            label="Estimated level"
            value={estimate?.estimate ?? "Not set"}
            detail={
              estimate?.next
                ? `Next: ${estimate.next.level}`
                : estimate?.estimate
                  ? "Top of the scale"
                  : "Answer quizzes to measure"
            }
          />
        </div>

        {estimate?.estimate && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CefrBadge min={estimate.estimate} max={estimate.estimate} />
            <span>
              {estimate.estimate !== estimate.profileLevel
                ? `Your answers put you above the ${estimate.profileLevel ?? "starting"} level you began with.`
                : estimate.levelSource === "placement"
                  ? "Set by your placement test."
                  : "The level you picked at sign-up."}
            </span>
          </div>
        )}
      </div>

      <ContinueWatching latest={latest} />
    </Card>
  );
}

export function ProgressHeroFallback() {
  return (
    <Card className="grid grid-cols-1 gap-6 p-(--card-spacing) [--card-spacing:--spacing(5)] md:grid-cols-[1fr_minmax(0,340px)] md:gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="size-16 animate-pulse rounded-2xl bg-muted" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
    </Card>
  );
}
