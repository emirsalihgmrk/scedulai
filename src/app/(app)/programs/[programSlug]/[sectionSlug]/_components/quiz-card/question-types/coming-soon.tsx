import { Construction } from "lucide-react";

// Placeholder body for question types whose UI hasn't shipped yet.
export default function ComingSoon() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
      <Construction className="size-6" />
      <p className="text-sm">This question type is coming soon.</p>
    </div>
  );
}
