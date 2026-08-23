import { Check, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

interface AuthBrandPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  features?: string[];
  className?: string;
}

export function AuthBrandPanel({
  eyebrow,
  title,
  description,
  features,
  className,
}: AuthBrandPanelProps) {
  return (
    <div
      data-slot="auth-brand-panel"
      className={cn(
        "relative hidden overflow-hidden bg-primary text-primary-foreground lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-between lg:self-start lg:p-12",
        className,
      )}
    >
      {/* Decorative ring outlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-28 size-128 rounded-full border border-primary-foreground/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-12 size-80 rounded-full border border-primary-foreground/5"
      />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary-foreground/15 text-primary-foreground">
          <GraduationCap className="size-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">
          Scedulai
        </span>
      </div>

      {/* Glass content card */}
      <div className="relative rounded-2xl border border-primary-foreground/12 bg-primary p-8 shadow-2xl backdrop-blur-sm">
        <span className="inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold tracking-wider uppercase">
          {eyebrow}
        </span>
        <h2 className="mt-5 font-display text-3xl leading-tight font-bold text-balance xl:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
          {description}
        </p>

        {features && features.length > 0 && (
          <ul className="mt-6 flex flex-col gap-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                  <Check className="size-3" />
                </span>
                <span className="text-primary-foreground/90">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="relative flex items-center gap-2 text-sm text-primary-foreground/70">
        <span>&copy; 2026 Scedulai</span>
        <span aria-hidden>&middot;</span>
        <a href="#" className="transition-colors hover:text-primary-foreground">
          Privacy
        </a>
        <span aria-hidden>&middot;</span>
        <a href="#" className="transition-colors hover:text-primary-foreground">
          Terms
        </a>
      </div>
    </div>
  );
}
