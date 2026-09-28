import { QuestionPayload, QuestionWithAnswer } from "@/schemas/quiz";
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

// ---------------------------------------------------------------------------
// Dispatch layer.
//
// `payload.type`, `answer.result.type` and `question.type` are always in sync
// (see QuestionTypeMap in db/schema.ts). This is the single place where that
// discriminant is switched on; every type-specific component below receives an
// already-narrowed payload / result and never re-checks the type itself.
// ---------------------------------------------------------------------------

// The prompt box shown above both the input and graded views.
export function QuestionPrompt({ question }: { question: QuestionWithAnswer }) {
  const { payload } = question;
  switch (payload.type) {
    case "translation":
      return <TranslationPrompt payload={payload} />;
    case "fill-in-the-blank":
      return <FillInTheBlankPrompt payload={payload} />;
  }
}

// Ungraded question input.
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

// Graded question result.
export function GradedQuestion({ question }: { question: QuestionWithAnswer }) {
  const { answer, payload } = question;
  if (!answer) return null;

  const { result, accuracy } = answer;
  switch (result.type) {
    case "translation":
      // The only payload/result correlation guard in the whole card — payload
      // is always translation when result is, but TS can't infer that across
      // separate fields.
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

// Short preview text for the overview question list.
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
