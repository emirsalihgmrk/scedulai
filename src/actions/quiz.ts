"use server";

import { AnswerResponse } from "@/schemas/quiz";
import { generateQuizByAiService, submitAnswerService } from "@/services/quiz";
import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/schemas/common";
import type { QuestionWithAnswer, QuizWithQuestions } from "@/schemas/quiz";

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

export async function generateQuizByAiAction(
  sectionId: string,
): Promise<ActionResult<QuizWithQuestions>> {
  try {
    const data = await generateQuizByAiService(sectionId);
    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}
