import { APIError } from "better-auth/api";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import type { ActionResult } from "@/schemas/common";

// Normalize a thrown error into a typed action failure. Only messages from
// expected error types (validation, auth, deliberate service errors) are
// surfaced; anything else is an unexpected internal error and is returned as a
// generic message so implementation details never leak to the client.
export function toActionFailure(
  error: unknown,
): Extract<ActionResult, { ok: false }> {
  if (error instanceof z.ZodError) {
    return { ok: false, error: error.issues[0]?.message ?? "Invalid input" };
  }
  if (error instanceof APIError || error instanceof AppError) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "Something went wrong" };
}