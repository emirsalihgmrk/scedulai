"use server";

import { toActionFailure  } from "@/lib/action";
import type {ActionResult} from "@/lib/action";
import type { CompleteOnboardingInput } from "@/schemas/learning-profile";
import { completeOnboardingService } from "@/services/learning-profile";

export async function completeOnboardingAction(
  input: CompleteOnboardingInput,
): Promise<ActionResult> {
  try {
    await completeOnboardingService(input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
