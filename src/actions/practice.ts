"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type { PracticeWithQuestions } from "@/schemas/practice";
import {
  completePracticeService,
  generatePracticeByAiService,
} from "@/services/practice";

export async function generatePracticeByAiAction(
  mistakeId: string,
): Promise<ActionResult<PracticeWithQuestions>> {
  try {
    const data = await generatePracticeByAiService(mistakeId);
    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function completePracticeAction(
  mistakeId: string,
): Promise<ActionResult> {
  try {
    await completePracticeService(mistakeId);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
