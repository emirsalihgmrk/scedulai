// Stub file: props are typed to keep the dispatch switches type-safe but go
// unused until the real UI lands (see TODO below).
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Construction } from "lucide-react";
import type {
  FillInTheBlankPayload,
  FillInTheBlankResult,
  QuestionWithAnswer,
} from "@/schemas/quiz";

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
