"use server";

import { saveVideoPositionService } from "@/services/program";
import { toActionFailure } from "@/lib/action";
import type { ActionResult } from "@/schemas/common";
import type { SaveVideoPositionInput } from "@/schemas/program";

export async function saveVideoPositionAction(
  sectionId: string,
  input: SaveVideoPositionInput,
): Promise<ActionResult> {
  try {
    await saveVideoPositionService(sectionId, input);
    return { ok: true, data: undefined };
  } catch (error) {
    return toActionFailure(error);
  }
}
