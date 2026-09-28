// Stub file: props are typed to keep the dispatch switches type-safe but go
// unused until the real UI lands (see TODO below).
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Construction } from "lucide-react";
import { QuestionTypeMap, QuestionWithAnswer } from "@/schemas/quiz";

// ---------------------------------------------------------------------------
// TODO(fill-in-the-blank): implement UI.
//
// The type exists in QuestionTypeMap (db/schema.ts) but is not generated or
// rendered yet. These stubs keep the dispatch switches in ./index.tsx
// exhaustive; the real prompt / input / result UI drops in here without
// touching the dispatch layer.
//
// Note: the shared draft state is translation-shaped — the reducer stores
// `answers: Record<string, string>` and the question-step header shows a
// source→target language direction. Both need revisiting when the real
// fill-in-the-blank input (word pool → string[]) lands.
// ---------------------------------------------------------------------------

type FillInTheBlankPayload = QuestionTypeMap["fill-in-the-blank"]["payload"];
type FillInTheBlankResult = {
  response: QuestionTypeMap["fill-in-the-blank"]["response"];
  analysis: QuestionTypeMap["fill-in-the-blank"]["analysis"];
};

function ComingSoon() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
      <Construction className="size-6" />
      <p className="text-sm">Fill-in-the-blank questions are coming soon.</p>
    </div>
  );
}

export function FillInTheBlankPrompt(_: { payload: FillInTheBlankPayload }) {
  return <ComingSoon />;
}

export function FillInTheBlankInput(_: {
  question: QuestionWithAnswer;
  value: string;
  onChange: (value: string) => void;
  onGraded: (question: QuestionWithAnswer) => void;
}) {
  return <ComingSoon />;
}

export function GradedFillInTheBlankQuestion(_: {
  question: QuestionWithAnswer;
  payload: FillInTheBlankPayload;
  result: FillInTheBlankResult;
  accuracy: number;
}) {
  return <ComingSoon />;
}
