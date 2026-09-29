import type { QuestionPayload, QuestionWithAnswer } from "@/schemas/quiz";
import {
  TranslationPrompt,
  TranslationInput,
  GradedTranslationQuestion,
} from "./translation";
import {
  FillInTheBlankPrompt,
  FillInTheBlankInput,
  GradedFillInTheBlankQuestion,
} from "./fill-in-the-blank";

export function QuestionPrompt({ question }: { question: QuestionWithAnswer }) {
  const { payload } = question;
  switch (payload.type) {
    case "translation":
      return <TranslationPrompt payload={payload} />;
    case "fill-in-the-blank":
      return <FillInTheBlankPrompt payload={payload} />;
  }
}

export function AnswerInput({
  question,
  value,
  onChange,
  onGraded,
}: {
  question: QuestionWithAnswer;
  value: string;
  onChange: (value: string) => void;
  onGraded: (question: QuestionWithAnswer) => void;
}) {
  switch (question.payload.type) {
    case "translation":
      return (
        <TranslationInput
          question={question}
          value={value}
          onChange={onChange}
          onGraded={onGraded}
        />
      );
    case "fill-in-the-blank":
      return (
        <FillInTheBlankInput
          question={question}
          value={value}
          onChange={onChange}
          onGraded={onGraded}
        />
      );
  }
}

export function GradedQuestion({ question }: { question: QuestionWithAnswer }) {
  const { answer, payload } = question;
  if (!answer) return null;

  const { result, accuracy } = answer;
  switch (result.type) {
    case "translation":
      if (payload.type !== "translation") return null;
      return (
        <GradedTranslationQuestion
          question={question}
          payload={payload}
          result={result}
          accuracy={accuracy}
        />
      );
    case "fill-in-the-blank":
      if (payload.type !== "fill-in-the-blank") return null;
      return (
        <GradedFillInTheBlankQuestion
          question={question}
          payload={payload}
          result={result}
          accuracy={accuracy}
        />
      );
  }
}

export function questionPreview(payload: QuestionPayload): string {
  switch (payload.type) {
    case "translation":
      return payload.sourceSentence;
    case "fill-in-the-blank":
      return payload.segments
        .map((segment) => (segment.kind === "text" ? segment.value : "___"))
        .join("");
  }
}
