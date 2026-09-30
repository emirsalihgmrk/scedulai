import type { z } from "zod";

import { createAiTraceRowSchema } from "@/db/rows";

// ── DAL input schemas ──

export const createAiTraceSchema = createAiTraceRowSchema.pick({
  task: true,
  model: true,
  promptVersion: true,
  input: true,
  output: true,
  metadata: true,
  latencyMs: true,
  inputTokens: true,
  outputTokens: true,
});
export type CreateAiTraceInput = z.infer<typeof createAiTraceSchema>;
