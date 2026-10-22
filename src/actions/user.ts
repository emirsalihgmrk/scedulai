"use server";

import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/lib/action";
import type { SaveTimeZoneInput } from "@/schemas/user";
import { saveTimeZoneService } from "@/services/user";

export async function saveTimeZoneAction(
  input: SaveTimeZoneInput,
): Promise<ActionResult> {
  try {
    await saveTimeZoneService(input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
