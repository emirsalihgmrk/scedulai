// Stub: props are typed so the dispatchers stay type-safe, but go unused until
// the real UI lands.
import type {
  FillInTheBlankPayload,
  FillInTheBlankResult,
  QuestionWithAnswer,
} from "@/schemas/quiz";

import ComingSoon from "./coming-soon";

interface FillInTheBlankGradedProps {
  question: QuestionWithAnswer;
  payload: FillInTheBlankPayload;
  result: FillInTheBlankResult;
  accuracy: number;
}

export default function FillInTheBlankGraded(_: FillInTheBlankGradedProps) {
  return <ComingSoon />;
}
