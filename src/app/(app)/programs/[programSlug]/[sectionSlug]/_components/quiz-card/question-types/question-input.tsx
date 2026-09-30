import type { QuestionWithAnswer } from "@/schemas/quiz";

import FillInTheBlankInput from "./fill-in-the-blank-input";
import TranslationInput from "./translation-input";

interface QuestionInputProps {
  question: QuestionWithAnswer;
  value: string;
  onChange: (value: string) => void;
  onGraded: (question: QuestionWithAnswer) => void;
}

// Dispatches on the question type. Adding a type to constants/question.ts
// breaks this switch until the new <type>-* components are wired in.
export default function QuestionInput({
  question,
  value,
  onChange,
  onGraded,
}: QuestionInputProps) {
  const { payload } = question;
  switch (payload.type) {
    case "translation":
      return (
        <TranslationInput
          question={question}
          payload={payload}
          value={value}
          onChange={onChange}
          onGraded={onGraded}
        />
      );
    case "fill-in-the-blank":
      return (
        <FillInTheBlankInput
          question={question}
          payload={payload}
          value={value}
          onChange={onChange}
          onGraded={onGraded}
        />
      );
  }
}
