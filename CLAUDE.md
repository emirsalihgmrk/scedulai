# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run simulate     # Run the 15-sentences workflow simulation (tsx)
npm run simulate <ted-url>  # Run simulation with a specific TED.com talk URL
```

Type-checking (no dedicated script — use the allowed form):
```bash
npx tsc --noEmit
```

Database migrations are generated with Drizzle Kit:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

After every file edit, the PostToolUse hook automatically runs `npm run typecheck && npm run lint`.

## Architecture

**ScedulAI** is a language-learning platform built on Next.js 16 (App Router). Its first feature is a "15 sentences per day" program where users translate sentences derived from TED talk transcripts.

### Key layers

| Layer | Path | Purpose |
|---|---|---|
| AI provider | `src/ai/index.ts` | OpenRouter wrapper (`getAIObjectResponse`), default model `google/gemini-2.5-flash` |
| AI tasks | `src/ai/tasks/` | One file per task; each calls `getAIObjectResponse` with a Zod output schema |
| AI output schemas | `src/ai/outputs/` | Zod schemas and descriptions for structured AI responses |
| TED scraper | `src/lib/ted.ts` | Scrapes `ted.com` via Cheerio, parses `__NEXT_DATA__` to extract talk metadata and transcript |
| API route | `src/app/api/ted/route.ts` | `GET /api/ted?url=<ted-url>` — returns `TedTalkData` JSON |
| DB | `src/db/` | Drizzle ORM + Postgres (`DATABASE_URL`); schema in `src/db/schema.ts` (currently empty) |
| CLI util | `src/lib/cli.ts` | Colored terminal output helpers used by simulations |
| Simulations | `src/schedule/*/simulation.ts` | Standalone scripts run via `tsx` to prototype/test workflows outside the browser |
| Workflow docs | `src/schedule/*/workflow.md` | Product/design specs for each learning schedule |

### Data flow (simulate command)

1. `simulation.ts` fetches a TED talk URL → `fetchTedTalkData` scrapes `ted.com` HTML and returns `TedTalkData` (title, speaker, transcript, etc.)
2. `reviewTranscript` sends the transcript to the AI and receives exactly 15 practice sentences in the user's native language (Turkish by default)
3. Output is printed via `cli` helpers

### Environment variables

- `OPENROUTER_API_KEY` — required for all AI calls
- `DATABASE_URL` — Postgres connection string
- `NEXT_PUBLIC_APP_URL` — used as `HTTP-Referer` header in OpenRouter requests

## Naming conventions (enforced by ESLint)

- All `.ts`/`.tsx` and `.md` files under `src/` must use **kebab-case** filenames
- Variables/parameters: `camelCase`; `const` variables may also be `UPPER_CASE`
- Functions: `camelCase` or `PascalCase` (React components)
- Types/interfaces/enums: `PascalCase`; enum members: `PascalCase`