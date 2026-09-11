"use server";

import { AnswerResponse } from "@/schemas/quiz";
import {
  evaluateQuizService,
  generateQuizByAiService,
  retryQuizService,
  submitAnswerService,
} from "@/services/quiz";
import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/schemas/common";
import type { QuestionWithAnswer, QuizWithQuestions } from "@/schemas/quiz";
import type { QuizStatus } from "@/constants/progress";

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

export async function evaluateQuizAction(
  sectionId: string,
): Promise<ActionResult<QuizStatus | null>> {
  try {
    const data = await evaluateQuizService(sectionId);
    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function retryQuizAction(
  sectionId: string,
): Promise<ActionResult> {
  try {
    await retryQuizService(sectionId);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
