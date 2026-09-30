export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

// "self" = picked by the learner during onboarding, "placement" = set by the
// placement test. Placement results override self-reported levels.
export const LEVEL_SOURCES = ["self", "placement"] as const;
export type LevelSource = (typeof LEVEL_SOURCES)[number];

export const LEARNING_GOALS = ["work", "travel", "exam", "fun"] as const;
export type LearningGoal = (typeof LEARNING_GOALS)[number];

export const DAILY_MINUTES_OPTIONS = [5, 10, 15, 20, 30] as const;
export type DailyMinutes = (typeof DAILY_MINUTES_OPTIONS)[number];
