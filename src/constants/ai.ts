export const AI_TASKS = ["analyze-sentence", "generate-sentences"] as const;
export type AiTask = (typeof AI_TASKS)[number];
