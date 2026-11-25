import { CircleCheck } from "lucide-react";

interface CompletedStepProps {
  title: string;
  total: number;
  note?: string;
}

export default function CompletedStep({
  title,
  total,
  note,
}: CompletedStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-success/12 text-success">
        <CircleCheck className="size-8" />
      </span>

      <div className="flex flex-col gap-1.5">
        <p className="font-display text-lg font-semibold text-foreground">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">
          You translated all {total} sentences correctly.
        </p>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}
