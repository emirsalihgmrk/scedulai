# Architectural Decisions

### [2026-07-31] Shifting from Vercel AI SDK Tools to Structured Outputs (`Output.object`)
- **Context:** `simulation.ts` used forced tool-calling (`toolChoice: 'reviewTranscriptTool'`) to generate 15 practice sentences.
- **Problem:** Tool-calling triggers an agentic loop, executing a redundant 2nd LLM call for a conversational response. This doubled response times.
- **Solution:** Switched to `generateText` with `Output.object()`. The model now generates the structured JSON array in a **single LLM turn**, reducing latency by ~50%.

### [2026-07-31] Renaming `object-tools` to `outputs`
- **Context:** Data extraction schemas were stored in `object-tools`.
- **Rationale:** The word "tool" is misleading since these schemas do not define executable actions. Renamed the directory to `outputs` to align with Vercel's `output` parameter and clarify their role as structured output templates.

### [2026-08-09] Fetching TED talk data via the GraphQL API instead of scraping `__NEXT_DATA__`
> **Superseded by [2026-08-16] — TED.com dropped entirely.**
- **Context:** `fetchTedTalkData` scraped each talk page's HTML with Cheerio and parsed the `__NEXT_DATA__` blob to extract metadata and the transcript. (Talk discovery had already moved to TED's `/api/search` endpoint because `/talks` filtering is client-side, so the listing page's `__NEXT_DATA__` never held the filtered results.)
- **Problem:** HTML/`__NEXT_DATA__` scraping is brittle (breaks on any page-shell change), pulls a large payload just to reach a nested field, and left `cheerio` as a dependency solely for this one path.
- **Solution:** `fetchTedTalkData` now calls TED's public GraphQL API (`https://www.ted.com/graphql`, no auth) with two queries: `video(slug)` for metadata and `translation(videoId, language)` for the transcript (the transcript is modeled as a per-language "translation" of the talk's subtitles). Requests use GraphQL variables and Zod-validated responses. This removed all scraping code and the `cheerio` dependency, and made discovery + talk-detail consistently API-based. `.data/` samples were refreshed to the real GraphQL and `/api/search` responses so they stay useful as schema references. `ted.ts` was then split into `src/lib/ted/{queries,schemas,service,index}.ts`.

### [2026-08-16] Dropping TED.com in favor of the YouTube Data API
- **Context:** Video/transcript sourcing was built entirely on TED — a GraphQL client (`src/lib/ted/*`), an `/api/ted` route, `viewedCount`-ranked catalog discovery, and simulation scripts under `src/schedule/*`.
- **Problem:** TED's public endpoints proved unreliable and unsupported for this use: the `/api/search` discovery endpoint started returning `403 Forbidden` (automated access blocked), and the GraphQL schema shifts under us (e.g. `Paragraph.startTime` moved to `Cue`). TED also has no popularity sort, forcing a full-catalog scan. This is brittle to build a product on, and the ToS posture is unclear.
- **Solution:** Drop TED.com entirely. All TED-specific code was removed (`src/lib/ted/*`, `src/app/api/ted/route.ts`, the `src/schedule/*` simulations and `cli.ts` helper, the `simulate` npm script). `src/db/seed.ts` was reduced to seeding users only, with video/transcript seeding left as a TODO. Video sourcing will be rebuilt on the official **YouTube Data API**, which offers documented, stable, quota-based access to videos and captions. The generic `videos`/`transcripts` schema is provider-agnostic and stays as-is.
