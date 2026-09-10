# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Next.js)
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit

npm run db:push      # push schema changes to DB (no migration file)
npm run db:generate  # generate migration SQL files
npm run db:migrate   # run migrations
npm run db:seed      # seed DB (tsx src/db/seed.ts)
npm run db:reset     # wipe and recreate all tables (tsx src/db/reset.ts)
```

## Stack

Next.js 16 (App Router, React 19, React Compiler) · Drizzle ORM · PostgreSQL · better-auth
(+ Resend for email) · Vercel AI SDK via OpenRouter · Zod v4 · react-hook-form · Tailwind CSS v4
with shadcn / Radix / Base UI.

## Architecture

Layered, one-directional data flow. See the per-side convention docs before writing code:

- **Backend** (`schemas/`, `dal/`, `services/`, `actions/`, `db/`) →
  [`docs/architecture/backend.md`](./docs/architecture/backend.md) — layer boundaries, naming,
  narrowed mutation schemas, return-type contracts (`undefined` vs `null`), and the better-auth
  exception.
- **Frontend** (`app/`, `components/`) →
  [`docs/architecture/frontend.md`](./docs/architecture/frontend.md) — `page.tsx`/`page-view`
  split, RSC/Client boundary, the preload pattern, `Suspense` rules, and custom-component /
  accessibility conventions. The design system itself is governed by the `ui-design` skill.

```
src/
  app/          # Next.js pages and routes (App Router)
  actions/      # Server Actions — Client ↔ Service bridge
  services/     # Business logic + auth enforcement
  dal/          # Data Access Layer — raw Drizzle queries/mutations, per module: {queries,mutations}.ts
  schemas/      # Zod DTOs — the public contract shared across layers
  constants/    # Value arrays + literal types; source of the DB enums
  ai/           # LLM layer (see below)
  lib/          # auth.ts, auth-client.ts, action.ts, errors.ts (AppError), utils.ts, youtube.ts
  db/           # schema.ts (tables/relations/enums), types.ts (raw $inferSelect + drizzle-zod), seed/reset
  components/   # Shared UI (components/ui/* = shadcn)
```

### AI layer (`src/ai/`)

Not covered by the architecture docs — the conventions live here.

- `index.ts` — `getAIObjectResponse()`, a single structured-output LLM call (no tool-calling loop)
  over OpenRouter with retry/backoff. `DEFAULT_MODEL` is `google/gemini-2.5-flash`.
- `outputs/` — Zod schemas describing each task's structured output.
- `tasks/` — one function per AI task (e.g. `generate-sentences`, `analyze-sentence`).
- AI calls are orchestrated from the **service** layer, never from the DAL or actions.

### Enums

DB enum values in `db/schema.ts` are sourced from the arrays in `src/constants/` (e.g.
`constants/language.ts`, `constants/question.ts`) so TypeScript literals and the database stay in
sync. Add or change enum values in `constants/`, not inline in the schema.

### Data model

Auth tables (`user`, `session`, `account`, `verification`) are owned by better-auth. Domain tables:
`programs` → `sections`, with `channels` → `videos` → `transcripts` on the content side, and
`quizzes` → `questions` → `answers` on the exercise side. `section_progress` tracks per-user
progress. Quizzes are keyed per user language pair, so questions can be generated on demand.

## Environment variables

`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `OPENROUTER_API_KEY`,
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `YOUTUBE_API_KEY`.