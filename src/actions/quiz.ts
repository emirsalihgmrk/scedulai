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
  gradePracticeTranslationService,
  gradeQuizTranslationService,
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

export async function gradeQuizTranslationAction(
  sectionId: string,
  questionId: string,
  input: GradeTranslationInput,
): Promise<ActionResult<TranslationGrade>> {
  try {
    const data = await gradeQuizTranslationService(
      sectionId,
      questionId,
      input,
    );
    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function gradePracticeTranslationAction(
  questionId: string,
  input: GradeTranslationInput,
): Promise<ActionResult<TranslationGrade>> {
  try {
    const data = await gradePracticeTranslationService(questionId, input);
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
