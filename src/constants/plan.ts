export const PLANS = ["free", "premium"] as const;
export type Plan = (typeof PLANS)[number];
