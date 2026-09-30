"use server";

import { toActionFailure  } from "@/lib/action";
import type {ActionResult} from "@/lib/action";
import type { SaveVideoPositionInput } from "@/schemas/program";
import { saveVideoPositionService } from "@/services/program";

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
