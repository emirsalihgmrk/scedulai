import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface ChangeProps {
  rate: number | null;
  previousRate: number | null;
  // Whether a lower rate is the good direction (mistakes) or not (accuracy).
  isLowerBetter: boolean;
}

export default function Change({ rate, previousRate, isLowerBetter }: ChangeProps) {
  if (rate === null) {
    return <span className="text-xs text-muted-foreground">–</span>;
  }
  if (previousRate === null) {
    return <span className="text-xs text-muted-foreground">New</span>;
  }

  const points = Math.round((rate - previousRate) * 100);
  if (points === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-3.5" />
        Steady
      </span>
    );
  }

  const isBetter = isLowerBetter ? points < 0 : points > 0;
  const Icon = points < 0 ? TrendingDown : TrendingUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        isBetter ? "text-success" : "text-destructive",
      )}
    >
      <Icon className="size-3.5" />
      {points > 0 ? "+" : "−"}
      {Math.abs(points)} pts
      <span className="sr-only">{isBetter ? "(better)" : "(worse)"}</span>
    </span>
  );
}
