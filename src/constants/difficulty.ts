export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_BADGE_CLASSES: Record<Difficulty, string> = {
  beginner:
    "bg-background text-success ring-2 ring-success/40 backdrop-blur-sm",
  intermediate:
    "bg-background text-warning-foreground ring-2 ring-warning/40 backdrop-blur-sm",
  advanced:
    "bg-background text-destructive ring-2 ring-destructive/40 backdrop-blur-sm",
};
