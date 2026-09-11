import { QUIZ_PASS_ACCURACY } from "@/constants/progress";

export function accuracyClasses(accuracy: number) {
  return accuracy < QUIZ_PASS_ACCURACY
    ? "bg-warning/12 text-warning-foreground"
    : "bg-success/12 text-success";
}
