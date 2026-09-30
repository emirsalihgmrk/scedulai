import type { LucideIcon } from "lucide-react";
import { createElement } from "react";

import { cn } from "@/lib/utils";


interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border p-8 text-center",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {createElement(icon, { className: "size-7" })}
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="font-display text-lg font-semibold text-foreground">
          {title}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
