# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:seed      # Seed the database (tsx)
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

**ScedulAI** is a language-learning platform built on Next.js 16 (App Router). Its first feature is a "15 sentences per day" program where users translate sentences derived from video transcripts.

### Key layers

| Layer | Path | Purpose |
|---|---|---|
| AI provider | `src/ai/index.ts` | OpenRouter wrapper (`getAIObjectResponse`), default model `google/gemini-2.5-flash` |
| AI tasks | `src/ai/tasks/` | One file per task; each calls `getAIObjectResponse` with a Zod output schema |
| AI output schemas | `src/ai/outputs/` | Zod schemas and descriptions for structured AI responses |
| Video service | `src/services/video.ts` | Selects an unwatched video + its transcript for a user |
| DB | `src/db/` | Drizzle ORM + Postgres (`DATABASE_URL`); schema in `src/db/schema.ts` |
| Seed | `src/db/seed.ts` | Seeds users; video/transcript seeding (via the YouTube Data API) is TODO |

> **Note:** Video sourcing is being migrated to the YouTube Data API. The previous TED.com integration (client, API route, discovery, simulations) has been removed.

### Environment variables

- `OPENROUTER_API_KEY` — required for all AI calls
- `DATABASE_URL` — Postgres connection string
- `NEXT_PUBLIC_APP_URL` — used as `HTTP-Referer` header in OpenRouter requests

## Naming conventions (enforced by ESLint)

- All `.ts`/`.tsx` and `.md` files under `src/` must use **kebab-case** filenames
- Variables/parameters: `camelCase`; `const` variables may also be `UPPER_CASE`
- Functions: `camelCase` or `PascalCase` (React components)
- Types/interfaces/enums: `PascalCase`; enum members: `PascalCase`