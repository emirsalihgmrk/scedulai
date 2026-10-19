"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type { PracticeWithQuestions } from "@/schemas/practice";
import {
  completePracticeService,
  generatePracticeByAiService,
} from "@/services/practice";

export async function generatePracticeByAiAction(): Promise<
  ActionResult<PracticeWithQuestions>
> {
  try {
    const data = await generatePracticeByAiService();
    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function completePracticeAction(): Promise<ActionResult> {
  try {
    await completePracticeService();
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
