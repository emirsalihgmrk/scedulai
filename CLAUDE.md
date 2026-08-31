# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript check (run before committing)
npm run lint         # ESLint

npm run db:push      # Push schema changes (no migration file)
npm run db:generate  # Generate migration file
npm run db:migrate   # Apply pending migrations
npm run db:seed      # Seed database
npm run db:reset     # Wipe and re-seed
```

## Architecture

ScedulAI is a language learning platform: it extracts sentences from YouTube video transcripts, has users translate them, and evaluates translations with an LLM.

### Three-layer data flow

```
src/actions/   →  src/services/  →  src/dal/
Server Actions    Business logic    Drizzle queries
```

- **DAL** (`src/dal/`) — raw Drizzle queries, split into `queries.ts` (reads) and `mutations.ts` (writes). No business logic.
- **Services** (`src/services/`) — orchestrate DAL calls, LLM calls, and error handling.
- **Actions** (`src/actions/`) — Next.js Server Actions; call services and return `ActionResult<T>`.
- **AI** (`src/ai/`) — OpenRouter provider + Vercel AI SDK. Tasks live in `src/ai/tasks/`, their Zod output schemas in `src/ai/outputs/`.

### Types and validation

All shared types and Zod schemas live in `src/schemas/`. Tables are defined in `src/db/schema.ts`; inferred Drizzle types feed into leaner DTO types in `schemas/`. There is no `src/types/` directory.

### Auth

better-auth v1 with Drizzle adapter and Resend email delivery. Server-side: `src/lib/auth.ts`. Client-side: `src/lib/auth-client.ts`. API route: `src/app/api/auth/`.

### Key patterns

- **ActionResult**: every Server Action returns `{ ok: true, data: T } | { ok: false, error: AppError }`. Use `toActionFailure` from `src/lib/action.ts` for error wrapping.
- **CommonFields**: all tables share `id` (UUID), `createdAt`, `updatedAt` via a shared helper in `src/db/schema.ts`.
- **Idempotent mutations**: `onConflictDoNothing()` / `onConflictDoUpdate()` — e.g., quiz creation is race-safe.
- **Language narrowing**: `userLanguages()` in services maps DB enum values to supported language codes before passing to AI tasks.
- **Promise drilling + Suspense**: pages start service calls without `await` and pass the promises down to page-local components; the component unwraps with React's `use()` (or `await` in an async component) and is wrapped in `<Suspense>` by the page. Each such component exports its own `*Fallback` from the **same file** (e.g. `ProgramHero` / `ProgramHeroFallback` in `program-hero.tsx`). Only data needed for routing (e.g. `notFound()`) is awaited/unwrapped early. See `src/app/programs/[programSlug]/`.

## Conventions

- File names: **kebab-case** (`.ts`, `.tsx`)
- Functions / variables: **camelCase**; types / components: **PascalCase**
- Path alias: `@/*` → `src/*`
- Page-local components go in `src/app/…/_components/` co-located with the page.
- Mock data used during development lives in `src/app/…/mock-data.ts` and is replaced once the real DAL query exists.

## Database

- Drizzle ORM over Supabase (PostgreSQL).
- `DATABASE_URL` for pooled connections; `DIRECT_URL` for migrations (drizzle.config.ts).
- Schema file: `src/db/schema.ts` — all tables and relations in one file.
- Enums defined in Postgres: `plan`, `difficulty`, `question_type`, `question_direction`, `native_language`, `target_language`, `quiz_status`.
