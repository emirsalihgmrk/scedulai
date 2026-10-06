import type { QuestionWithAnswer } from "@/schemas/quiz";

import FillInTheBlankGraded from "./fill-in-the-blank-graded";
import TranslationGraded from "./translation-graded";

interface QuestionGradedProps {
  question: QuestionWithAnswer;
}

// Dispatches on the question type. Adding a type to constants/question.ts
// breaks this switch until the new <type>-* components are wired in.
export default function QuestionGraded({ question }: QuestionGradedProps) {
  const { answer, payload } = question;
  if (!answer) return null;

  const { result } = answer;
  switch (result.type) {
    case "translation":
      if (payload.type !== "translation") return null;
      return (
        <TranslationGraded
          question={question}
          payload={payload}
          result={result}
        />
      );
    case "fill-in-the-blank":
      if (payload.type !== "fill-in-the-blank") return null;
      return (
        <FillInTheBlankGraded
          question={question}
          payload={payload}
          result={result}
        />
      );
  }
}
