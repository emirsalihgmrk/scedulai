import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pluralize } from "@/lib/utils";
import { getActivityService } from "@/services/progress";

import CalendarGrid from "./calendar-grid";

export default async function ActivityCalendar() {
  const activity = await getActivityService();
  if (!activity) return null;

  const activeDays = activity.days.filter(
    (day) => day.listeningSeconds > 0 || day.answers > 0 || day.reviews > 0,
  );
  const weeks = activity.days.length / 7;

  return (
    <Card aria-labelledby="activity-title" className="h-full">
      <CardHeader className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <CardTitle
          id="activity-title"
          className="font-display text-lg font-bold"
        >
          Activity
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {pluralize(activeDays.length, "active day")} in the last {weeks}{" "}
          weeks
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div
          role="img"
          aria-label={`Activity calendar: ${pluralize(activeDays.length, "active day")} in the last ${weeks} weeks.`}
        >
          <CalendarGrid days={activity.days} today={activity.today} />
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Current streak</dt>
            <dd className="font-display text-xl font-bold text-foreground">
              {pluralize(activity.currentStreak, "day")}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Longest streak</dt>
            <dd className="font-display text-xl font-bold text-foreground">
              {pluralize(activity.longestStreak, "day")}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export function ActivityCalendarFallback() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="h-36 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
