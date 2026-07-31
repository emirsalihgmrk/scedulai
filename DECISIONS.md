# Architectural Decisions

### [2026-07-31] Shifting from Vercel AI SDK Tools to Structured Outputs (`Output.object`)
- **Context:** `simulation.ts` used forced tool-calling (`toolChoice: 'reviewTranscriptTool'`) to generate 15 practice sentences.
- **Problem:** Tool-calling triggers an agentic loop, executing a redundant 2nd LLM call for a conversational response. This doubled response times.
- **Solution:** Switched to `generateText` with `Output.object()`. The model now generates the structured JSON array in a **single LLM turn**, reducing latency by ~50%.

### [2026-07-31] Renaming `object-tools` to `outputs`
- **Context:** Data extraction schemas were stored in `object-tools`.
- **Rationale:** The word "tool" is misleading since these schemas do not define executable actions. Renamed the directory to `outputs` to align with Vercel's `output` parameter and clarify their role as structured output templates.
