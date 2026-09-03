export function accuracyClasses(accuracy: number) {
  return accuracy < 75
    ? "bg-warning/12 text-warning-foreground"
    : "bg-success/12 text-success";
}
