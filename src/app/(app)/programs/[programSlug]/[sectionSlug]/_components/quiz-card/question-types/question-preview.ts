import type { QuestionPayload } from "@/schemas/quiz";

// One-line text shown for a question in the quiz overview list.
export function getQuestionPreview(payload: QuestionPayload): string {
  switch (payload.type) {
    case "translation":
      return payload.sourceSentence;
  }
}
