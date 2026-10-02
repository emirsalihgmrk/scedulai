"use client";

import { useState } from "react";

import { Progress } from "@/components/ui/progress";
import type { SupportedTargetLanguageCode } from "@/constants/language";
import { PLACEMENT_QUESTIONS } from "@/constants/placement";

import ChoiceList from "./choice-list";
import type { Draft } from "./steps";

const UNKNOWN_VALUE = "unknown";

interface PlacementTestProps {
  targetLanguage: SupportedTargetLanguageCode;
  answers: Draft["placementAnswers"];
  onAnswersChange: (answers: Draft["placementAnswers"]) => void;
}

// One question at a time; picking an answer records it and moves on. The
// wizard's Continue unlocks once every question has an answer (or a skip).
export default function PlacementTest({
  targetLanguage,
  answers,
  onAnswersChange,
}: PlacementTestProps) {
  const questions = PLACEMENT_QUESTIONS[targetLanguage];
  const [index, setIndex] = useState(() => {
    const firstOpen = questions.findIndex((question) => !(question.id in answers));
    return firstOpen === -1 ? questions.length - 1 : firstOpen;
  });
  const question = questions[index];
  const current = answers[question.id];

  const handleChange = (value: string) => {
    const optionIndex = value === UNKNOWN_VALUE ? null : Number(value);
    onAnswersChange({ ...answers, [question.id]: optionIndex });
    if (index < questions.length - 1) setIndex(index + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Progress
          value={(Object.keys(answers).length / questions.length) * 100}
          aria-label="Placement test progress"
        />
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {index + 1}/{questions.length}
        </span>
      </div>

      <p className="font-display text-xl font-semibold text-foreground">
        {question.prompt}
      </p>

      <ChoiceList
        // Remount per question so the radio group never keeps the old selection.
        key={question.id}
        name={`placement-${question.id}`}
        label={question.prompt}
        value={
          question.id in answers
            ? current === null
              ? UNKNOWN_VALUE
              : String(current)
            : undefined
        }
        onValueChange={handleChange}
        options={[
          ...question.options.map((title, optionIndex) => ({
            value: String(optionIndex),
            title,
          })),
          { value: UNKNOWN_VALUE, title: "I don't know" },
        ]}
      />

      {index > 0 && (
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          className="self-start text-sm text-muted-foreground hover:text-foreground"
        >
          Previous question
        </button>
      )}
    </div>
  );
}
