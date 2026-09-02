"use client";

import { use, useState } from "react";
import { Captions } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TranscriptLine } from "@/schemas/video";
import { cn } from "@/lib/utils";

export function TranscriptCard({
  transcriptPromise,
}: {
  transcriptPromise: Promise<TranscriptLine[]>;
}) {
  const lines = use(transcriptPromise);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TranscriptCardShell>
      <ScrollArea className="h-full max-h-105 px-2 py-2">
        <ol className="flex flex-col gap-0.5">
          {lines.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "group flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                    isActive ? "bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="mt-0.5 tabular-nums"
                  >
                    {line.time}
                  </Badge>
                  <span className="flex-1">
                    {isActive && (
                      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                        Now playing
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-[15px] leading-relaxed",
                        isActive
                          ? "font-medium text-foreground"
                          : isPast
                            ? "text-muted-foreground"
                            : "text-foreground/80",
                      )}
                    >
                      {line.text}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </ScrollArea>
    </TranscriptCardShell>
  );
}

function TranscriptCardShell({ children }: { children: React.ReactNode }) {
  return (
    <Card
      aria-label="Interactive video transcript"
      className="flex min-h-0 flex-1 flex-col gap-0 py-0"
    >
      <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-3 border-b py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Captions className="size-4" />
        </span>
        <div>
          <CardTitle className="font-display">Transcript</CardTitle>
          <CardDescription className="text-xs">
            Tap a line to jump
          </CardDescription>
        </div>
        <CardAction className="row-span-1 self-center">
          <Badge variant="secondary">English · Auto</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 px-0">{children}</CardContent>
    </Card>
  );
}

export function TranscriptCardFallback() {
  return (
    <TranscriptCardShell>
      <div className="flex flex-col gap-0.5 px-2 py-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex gap-3 px-3 py-3">
            <div className="mt-0.5 h-5 w-12 shrink-0 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </TranscriptCardShell>
  );
}
