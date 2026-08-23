export const PLANS = ["free", "premium"] as const;
export type Plan = (typeof PLANS)[number];

export type PlanOption = {
  value: Plan;
  name: string;
  price: string;
  description: string;
};

export const PLAN_OPTIONS = [
  {
    value: "free",
    name: "Free",
    price: "$0",
    description: "5 sentences a day",
  },
  {
    value: "premium",
    name: "Pro",
    price: "$2/mo",
    description: "Unlimited",
  },
] satisfies readonly PlanOption[];