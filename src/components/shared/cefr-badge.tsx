import { Badge } from "@/components/ui/badge";
import type { CefrLevel } from "@/constants/learning";
import { cn } from "@/lib/utils";

// Coloured by the band (A basic, B independent, C proficient) of the top level.
const BAND_CLASSES = {
  A: "bg-background text-success ring-2 ring-success/40",
  B: "bg-background text-warning-foreground ring-2 ring-warning/40",
  C: "bg-background text-destructive ring-2 ring-destructive/40",
} as const;

interface CefrBadgeProps {
  min: CefrLevel;
  max: CefrLevel;
  className?: string;
}

export default function CefrBadge({ min, max, className }: CefrBadgeProps) {
  return (
    <Badge
      data-slot="cefr-badge"
      className={cn(BAND_CLASSES[max[0] as keyof typeof BAND_CLASSES], className)}
    >
      {min === max ? min : `${min}–${max}`}
    </Badge>
  );
}
