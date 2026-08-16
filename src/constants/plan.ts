export const PLANS = ["free", "basic", "premium"] as const;
export type Plan = (typeof PLANS)[number];
