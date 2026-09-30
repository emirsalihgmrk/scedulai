import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/constants/difficulty";
import { cn } from "@/lib/utils";

const DIFFICULTY_CLASSES: Record<Difficulty, string> = {
  beginner:
    "bg-background text-success ring-2 ring-success/40 backdrop-blur-sm",
  intermediate:
    "bg-background text-warning-foreground ring-2 ring-warning/40 backdrop-blur-sm",
  advanced:
    "bg-background text-destructive ring-2 ring-destructive/40 backdrop-blur-sm",
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export default function DifficultyBadge({
  difficulty,
  className,
}: DifficultyBadgeProps) {
  return (
    <Badge
      data-slot="difficulty-badge"
      className={cn(DIFFICULTY_CLASSES[difficulty], className)}
    >
      {difficulty}
    </Badge>
  );
}
