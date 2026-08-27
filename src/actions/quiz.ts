"use server";

import { QuestionAnswer, QuestionPayload } from "@/schemas/quiz";
import { submitAnswerService } from "@/services/quiz";
import type { ActionResult } from "@/schemas/common";
import type { Question } from "@/schemas/quiz";

export async function submitAnswerAction(
  questionId: string,
  questionPayload: QuestionPayload,
  input: QuestionAnswer,
): Promise<ActionResult<Question>> {
  try {
    const data = await submitAnswerService(questionId, questionPayload, input);

    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
