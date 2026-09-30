"use server";

import { toActionFailure } from "@/lib/action";
import { completeOnboardingService } from "@/services/learning-profile";
import type { CompleteOnboardingInput } from "@/schemas/learning-profile";
import type { ActionResult } from "@/schemas/common";

export async function completeOnboardingAction(
  input: CompleteOnboardingInput,
): Promise<ActionResult<{ created: boolean }>> {
  try {
    const data = await completeOnboardingService(input);
    return { ok: true, data };
  } catch (error) {
    return toActionFailure(error);
  }
}
