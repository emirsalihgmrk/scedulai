"use server";

import { toActionFailure  } from "@/lib/action";
import type {ActionResult} from "@/lib/action";
import type {
  GradeTranslationInput,
  QuizWithQuestions,
  TranslationGrade,
} from "@/schemas/quiz";
import {
  completeQuizService,
  generateQuizByAiService,
  gradeTranslationService,
} from "@/services/quiz";

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

export async function gradeTranslationAction(
  questionId: string,
  input: GradeTranslationInput,
): Promise<ActionResult<TranslationGrade>> {
  try {
    const data = await gradeTranslationService(questionId, input);
    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function completeQuizAction(
  sectionId: string,
): Promise<ActionResult> {
  try {
    await completeQuizService(sectionId);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
