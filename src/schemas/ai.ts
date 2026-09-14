import { z } from "zod";
import { createAiTraceRowSchema } from "@/db/types";

export const createAiTraceSchema = createAiTraceRowSchema.pick({
  task: true,
  model: true,
  promptVersion: true,
  userId: true,
  input: true,
  output: true,
  metadata: true,
  latencyMs: true,
  inputTokens: true,
  outputTokens: true,
});

export type CreateAiTraceInput = z.infer<typeof createAiTraceSchema>;
