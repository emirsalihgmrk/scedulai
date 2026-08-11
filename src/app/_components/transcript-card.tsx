"use client";

import { useState } from "react";
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
import { transcript as initialTranscript } from "@/lib/data";
import { cn } from "@/lib/utils";

export function TranscriptCard() {
  const [activeId, setActiveId] = useState(
    initialTranscript.find((r) => r.state === "active")?.id ?? 3,
  );

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

      <CardContent className="min-h-0 flex-1 px-0">
        <ScrollArea className="h-full max-h-105 px-2 py-2">
          <ol className="flex flex-col gap-0.5">
            {initialTranscript.map((row) => {
              const isActive = row.id === activeId;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(row.id)}
                    className={cn(
                      "group flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                      isActive ? "bg-primary/10" : "hover:bg-muted",
                    )}
                  >
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className="mt-0.5 tabular-nums"
                    >
                      {row.time}
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
                            : row.state === "past"
                              ? "text-muted-foreground"
                              : "text-foreground/80",
                        )}
                      >
                        {row.text}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
