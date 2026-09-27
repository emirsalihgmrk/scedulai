# ScedulAI

A language-learning app that turns YouTube content into structured, AI-generated
practice. Programs are broken into sections; each section pulls from real video
transcripts and generates quizzes tailored to your language pair on demand.

## Stack

- **Next.js 16** — App Router, React 19, React Compiler
- **Drizzle ORM** + **PostgreSQL**
- **better-auth** for authentication (+ **Resend** for email)
- **Vercel AI SDK** via **OpenRouter** for structured LLM output
- **Zod v4** · **react-hook-form**
- **Tailwind CSS v4** with shadcn / Radix / Base UI

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database
- API keys for OpenRouter, Resend, and the YouTube Data API

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (see below)
cp .env.example .env   # then fill in the values

# 3. Push the schema to your database
npm run db:push

# 4. Seed initial data (optional)
npm run db:seed

# 5. Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable              | Description                                  |
| --------------------- | -------------------------------------------- |
| `DATABASE_URL`        | Pooled Postgres connection string            |
| `DIRECT_URL`          | Direct Postgres connection (migrations)      |
| `BETTER_AUTH_SECRET`  | Secret for better-auth session signing       |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app                   |
| `OPENROUTER_API_KEY`  | OpenRouter key for LLM calls                 |
| `RESEND_API_KEY`      | Resend key for transactional email           |
| `RESEND_FROM_EMAIL`   | Verified sender address for Resend           |
| `YOUTUBE_API_KEY`     | YouTube Data API key                         |

## Scripts

```bash
npm run dev              # start dev server
npm run build            # production build
npm run start            # serve the production build
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit

npm run db:push          # push schema changes to DB (no migration file)
npm run db:generate      # generate migration SQL files
npm run db:migrate       # run migrations
npm run db:seed          # seed the DB
npm run db:reset         # wipe and recreate all tables
npm run db:warm-quizzes  # pre-generate quizzes
npm run ai:eval:score    # score AI evaluation cases
```

## Architecture

Layered, one-directional data flow:

```
src/
  app/          # Next.js pages and routes (App Router)
  actions/      # Server Actions — Client ↔ Service bridge
  services/     # Business logic + auth enforcement
  dal/          # Data Access Layer — raw Drizzle queries/mutations
  schemas/      # Zod DTOs — the public contract shared across layers
  constants/    # Value arrays + literal types; source of the DB enums
  ai/           # LLM layer (structured-output tasks over OpenRouter)
  lib/          # auth, action helpers, errors, utils
  db/           # schema, types, seed/reset
  components/   # Shared UI (components/ui/* = shadcn)
```

See the convention docs before writing code:

- [`docs/architecture/backend.md`](./docs/architecture/backend.md) — layer boundaries,
  naming, narrowed mutation schemas, return-type contracts.
- [`docs/architecture/frontend.md`](./docs/architecture/frontend.md) — `page.tsx`/`page-view`
  split, RSC/Client boundary, the preload pattern, `Suspense` rules.

Detailed guidance for contributors (and Claude Code) lives in [`CLAUDE.md`](./CLAUDE.md).
