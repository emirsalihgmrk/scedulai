// Stub: props are typed so the dispatchers stay type-safe, but go unused until
// the real UI lands.
import type {
  FillInTheBlankPayload,
  QuestionWithAnswer,
} from "@/schemas/quiz";

import ComingSoon from "./coming-soon";

interface FillInTheBlankInputProps {
  question: QuestionWithAnswer;
  payload: FillInTheBlankPayload;
  value: string;
  onChange: (value: string) => void;
  onGraded: (question: QuestionWithAnswer) => void;
}

export default function FillInTheBlankInput(_: FillInTheBlankInputProps) {
  return <ComingSoon />;
}
