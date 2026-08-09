# Architectural Decisions

### [2026-07-31] Shifting from Vercel AI SDK Tools to Structured Outputs (`Output.object`)
- **Context:** `simulation.ts` used forced tool-calling (`toolChoice: 'reviewTranscriptTool'`) to generate 15 practice sentences.
- **Problem:** Tool-calling triggers an agentic loop, executing a redundant 2nd LLM call for a conversational response. This doubled response times.
- **Solution:** Switched to `generateText` with `Output.object()`. The model now generates the structured JSON array in a **single LLM turn**, reducing latency by ~50%.

### [2026-07-31] Renaming `object-tools` to `outputs`
- **Context:** Data extraction schemas were stored in `object-tools`.
- **Rationale:** The word "tool" is misleading since these schemas do not define executable actions. Renamed the directory to `outputs` to align with Vercel's `output` parameter and clarify their role as structured output templates.

### [2026-08-09] Fetching TED talk data via the GraphQL API instead of scraping `__NEXT_DATA__`
- **Context:** `fetchTedTalkData` scraped each talk page's HTML with Cheerio and parsed the `__NEXT_DATA__` blob to extract metadata and the transcript. (Talk discovery had already moved to TED's `/api/search` endpoint because `/talks` filtering is client-side, so the listing page's `__NEXT_DATA__` never held the filtered results.)
- **Problem:** HTML/`__NEXT_DATA__` scraping is brittle (breaks on any page-shell change), pulls a large payload just to reach a nested field, and left `cheerio` as a dependency solely for this one path.
- **Solution:** `fetchTedTalkData` now calls TED's public GraphQL API (`https://www.ted.com/graphql`, no auth) with two queries: `video(slug)` for metadata and `translation(videoId, language)` for the transcript (the transcript is modeled as a per-language "translation" of the talk's subtitles). Requests use GraphQL variables and Zod-validated responses. This removed all scraping code and the `cheerio` dependency, and made discovery + talk-detail consistently API-based. `.data/` samples were refreshed to the real GraphQL and `/api/search` responses so they stay useful as schema references. `ted.ts` was then split into `src/lib/ted/{queries,schemas,service,index}.ts`.
