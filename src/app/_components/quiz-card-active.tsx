"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { activeQuiz } from "@/lib/data";

export function QuizCardActive() {
  const [value, setValue] = useState("");

  return (
    <Card className="relative gap-0 py-0 ring-2 ring-primary/25">
      {/* Active accent bar */}
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-primary to-chart-5" />

      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="gap-1.5 bg-primary/10 text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Question {activeQuiz.index} · To answer
            </Badge>
            <Badge className="bg-warning/15 font-semibold text-warning-foreground ring-1 ring-inset ring-warning/30">
              {activeQuiz.cefrLevel}
            </Badge>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Languages className="size-3.5" />
            {activeQuiz.sourceLang}
            <ArrowRight className="size-3" />
            {activeQuiz.targetLang}
          </span>
        </div>

        {/* AI generated source sentence */}
        <div className="rounded-xl bg-secondary/70 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" />
            AI-generated from transcript
          </div>
          <p className="text-pretty font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
            {activeQuiz.sentence}
          </p>
        </div>

        {/* Input */}
        <Field>
          <FieldLabel htmlFor="translation">Your translation</FieldLabel>
          <Textarea
            id="translation"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder="Type your English translation here..."
            className="resize-none"
          />
        </Field>

        {/* Submit */}
        <Button
          type="button"
          size="lg"
          disabled={value.trim().length === 0}
          className="h-12 w-full text-sm"
        >
          <Sparkles data-icon="inline-start" />
          Submit Translation
        </Button>
      </CardContent>
    </Card>
  );
}
