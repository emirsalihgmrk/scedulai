import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const SIZE = 64;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface GoalRingProps {
  seconds: number;
  goalSeconds: number;
  className?: string;
}

// Today's listening against the daily goal set at onboarding.
export default function GoalRing({
  seconds,
  goalSeconds,
  className,
}: GoalRingProps) {
  const ratio = goalSeconds > 0 ? Math.min(seconds / goalSeconds, 1) : 0;
  const isMet = ratio >= 1;
  const minutes = Math.floor(seconds / 60);

  return (
    <div
      data-slot="goal-ring"
      role="img"
      aria-label={`${minutes} of ${goalSeconds / 60} minutes listened today`}
      className={cn("relative size-16 shrink-0", className)}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          className={cn(
            "transition-[stroke-dashoffset] duration-700",
            isMet ? "stroke-success" : "stroke-primary",
            ratio === 0 && "opacity-0",
          )}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-foreground">
        {isMet ? <Check className="size-6 text-success" /> : minutes}
      </span>
    </div>
  );
}
