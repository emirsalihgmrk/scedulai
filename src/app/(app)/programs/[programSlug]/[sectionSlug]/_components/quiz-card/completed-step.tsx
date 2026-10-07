import { CircleCheck, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CompletedStepProps {
  total: number;
  onRestart: () => void;
}

export default function CompletedStep({ total, onRestart }: CompletedStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-success/12 text-success">
        <CircleCheck className="size-8" />
      </span>

      <div className="flex flex-col gap-1.5">
        <p className="font-display text-lg font-semibold text-foreground">
          Quiz completed
        </p>
        <p className="text-sm text-muted-foreground">
          You translated all {total} sentences correctly.
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={onRestart}
        className="gap-1.5"
      >
        <RotateCcw data-icon="inline-start" />
        Practice again
      </Button>
    </div>
  );
}
