import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, pluralize } from "@/lib/utils";
import type { ActivityDay } from "@/schemas/progress";

import { formatDay } from "../format";

// One hue, light to dark: how much happened that day. A day's score is its
// listening minutes plus its answers and reviews.
const LEVEL_CLASSES = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
] as const;
const LEVEL_THRESHOLDS = [1, 10, 25, 50];
const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

function getScore(day: ActivityDay): number {
  return Math.floor(day.listeningSeconds / 60) + day.answers + day.reviews;
}

function getLevel(day: ActivityDay): number {
  const score = getScore(day);
  if (score === 0 && day.listeningSeconds > 0) return 1;
  return LEVEL_THRESHOLDS.filter((threshold) => score >= threshold).length;
}

function describeDay(day: ActivityDay): string {
  const parts = [
    day.listeningSeconds >= 60 &&
      `${Math.floor(day.listeningSeconds / 60)} min listened`,
    day.answers > 0 && pluralize(day.answers, "sentence"),
    day.reviews > 0 && `${pluralize(day.reviews, "word")} reviewed`,
  ].filter(Boolean);
  const date = formatDay(day.day, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${date}: ${parts.length > 0 ? parts.join(" · ") : "no activity"}`;
}

// Monday-first, so the first column is padded up to the first day's weekday.
function getWeekday(day: string): number {
  return (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7;
}

interface CalendarGridProps {
  days: ActivityDay[];
  today: string;
}

export default function CalendarGrid({ days, today }: CalendarGridProps) {
  const padding = days.length > 0 ? getWeekday(days[0].day) : 0;
  const cells: (ActivityDay | null)[] = [
    ...Array<null>(padding).fill(null),
    ...days,
  ];
  const columns = Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 overflow-x-auto pb-1">
        <div className="mt-5 grid grid-rows-7 gap-1 pr-1 text-[10px] leading-none text-muted-foreground">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={index} className="flex h-3.5 items-center sm:h-4">
              {label}
            </span>
          ))}
        </div>

        {columns.map((column, columnIndex) => {
          // A month is labelled above the column holding its 1st.
          const monthStart = column.find(
            (day) => day && day.day.endsWith("-01"),
          );
          return (
            <div key={columnIndex} className="flex flex-col gap-1">
              <span className="h-4 text-[10px] leading-none whitespace-nowrap text-muted-foreground">
                {monthStart && formatDay(monthStart.day, { month: "short" })}
              </span>
              {column.map((day, rowIndex) =>
                day ? (
                  <Tooltip key={day.day}>
                    <TooltipTrigger
                      render={
                        <div
                          className={cn(
                            "size-3.5 rounded-[3px] sm:size-4",
                            LEVEL_CLASSES[getLevel(day)],
                            day.day === today &&
                              "ring-2 ring-foreground/60 ring-offset-1 ring-offset-card",
                          )}
                        />
                      }
                    />
                    <TooltipContent>{describeDay(day)}</TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={`pad-${rowIndex}`} className="size-3.5 sm:size-4" />
                ),
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span className="mr-1">Less</span>
        {LEVEL_CLASSES.map((className) => (
          <span key={className} className={cn("size-3 rounded-[3px]", className)} />
        ))}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
}
