"use server";

import { AnswerResponse } from "@/schemas/quiz";
import { submitAnswerService } from "@/services/quiz";
import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/schemas/common";
import type { QuestionWithAnswer } from "@/schemas/quiz";

export async function submitAnswerAction(
  questionId: string,
  input: AnswerResponse,
): Promise<ActionResult<QuestionWithAnswer>> {
  try {
    const data = await submitAnswerService(questionId, input);

    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}
