import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getActivityService } from "@/services/progress";

import { formatDay, formatListeningTime } from "./format";

const CHART_DAYS = 30;

export default async function ListeningChart() {
  const activity = await getActivityService();
  if (!activity) return null;

  const days = activity.days.slice(-CHART_DAYS);
  const goalMinutes = activity.goalSeconds ? activity.goalSeconds / 60 : null;
  const minutes = days.map((day) => day.listeningSeconds / 60);
  const scaleMax = Math.max(goalMinutes ?? 0, ...minutes, 1);
  const totalSeconds = days.reduce((sum, day) => sum + day.listeningSeconds, 0);
  const goalDays =
    goalMinutes === null
      ? 0
      : minutes.filter((value) => value >= goalMinutes).length;

  return (
    <Card aria-labelledby="listening-title" className="h-full">
      <CardHeader className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <CardTitle
          id="listening-title"
          className="font-display text-lg font-bold"
        >
          Listening
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {formatListeningTime(totalSeconds)} in {CHART_DAYS} days
          {goalMinutes !== null && ` · goal met on ${goalDays}`}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div
          role="img"
          aria-label={`Minutes listened per day over the last ${CHART_DAYS} days, ${formatListeningTime(totalSeconds)} in total.`}
          className="relative flex h-40 items-end gap-0.5 border-b border-border"
        >
          {goalMinutes !== null && (
            <div
              className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-foreground/40"
              style={{ bottom: `${(goalMinutes / scaleMax) * 100}%` }}
            >
              <span className="absolute -top-4 right-0 bg-card pl-1 text-[10px] text-muted-foreground">
                Goal {goalMinutes} min
              </span>
            </div>
          )}
          {days.map((day, index) => {
            const height = (minutes[index] / scaleMax) * 100;
            const isGoalMet = goalMinutes !== null && minutes[index] >= goalMinutes;
            return (
              <Tooltip key={day.day}>
                <TooltipTrigger
                  render={
                    <div className="flex h-full flex-1 items-end hover:bg-muted/60" />
                  }
                >
                  <div
                    className={cn(
                      "w-full rounded-t-sm",
                      day.listeningSeconds > 0 ? "min-h-0.5" : "min-h-0",
                      isGoalMet ? "bg-primary" : "bg-primary/45",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {formatDay(day.day, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  : {formatListeningTime(day.listeningSeconds)}
                  {isGoalMet && " · goal met"}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{formatDay(days[0].day)}</span>
          <span>Today</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ListeningChartFallback() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-44 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
