import { QUIZ_PASS_ACCURACY } from "@/constants/progress";

export function accuracyClasses(accuracy: number) {
  return accuracy < QUIZ_PASS_ACCURACY
    ? "bg-warning/12 text-warning-foreground"
    : "bg-success/12 text-success";
}

type Verdict = "yes" | "partial" | "no";

export function verdictClasses(verdict: Verdict) {
  return {
    yes: "bg-success/12 text-success",
    partial: "bg-warning/12 text-warning-foreground",
    no: "bg-destructive/12 text-destructive",
  }[verdict];
}
