# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Next.js)
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit

npm run db:push      # push schema changes to DB (no migration file)
npm run db:generate  # generate migration SQL files
npm run db:migrate   # run migrations
npm run db:seed      # seed DB with programs/videos/transcripts
npm run db:reset     # wipe and recreate all tables
```

## Architecture

**Stack:** Next.js 16 (App Router) · Drizzle ORM · PostgreSQL · better-auth · Vercel AI SDK via OpenRouter · Tailwind CSS v4 · Zod v4

### Layer model

```
src/
  app/          # Next.js pages and API routes (App Router)
  actions/      # Server Actions — thin: validate input, call service, return ActionResult
  services/     # Business logic — orchestrate DAL + AI calls, enforce auth
  dal/          # Data Access Layer — raw DB queries via Drizzle, no business logic
  ai/
    index.ts    # getAIObjectResponse() — single LLM call wrapper (OpenRouter, structured output)
    outputs/    # Zod schemas for AI structured outputs
    tasks/      # AI task functions (generate-sentences, analyze-sentence)
  schemas/      # Zod DTOs shared between layers (never import from db/schema directly in UI)
  constants/    # Enums used in both DB enums and application logic
  lib/          # Utilities: auth.ts, action.ts (toActionFailure), errors.ts (AppError), utils.ts
  db/
    schema.ts   # Single Drizzle schema file — all tables and relations
    seed.ts     # Seed script (run with tsx)
```

### Key conventions

- **Services call DAL, not the other way around.** Pages/actions call services.
- **Auth boundary is in services** via `getCurrentUser()` from `src/services/auth.ts`. Server Actions throw `AppError("Unauthorized")`; `toActionFailure()` in `lib/action.ts` normalizes errors into `ActionResult<T>`.
- **Schemas (`src/schemas/`) are the public DTO contract.** DAL query results are mapped to schema types before being returned upward. Never import raw Drizzle table types in UI components.
- **AI tasks use structured output** (`Output.object()` from Vercel AI SDK) via `getAIObjectResponse()` — no tool-calling loops. Default model is `google/gemini-2.5-flash` via OpenRouter.
- **`src/constants/` drives DB enums.** Enum values in `schema.ts` are sourced from constants arrays (`DIFFICULTIES`, `PLANS`, etc.) so TypeScript and the DB stay in sync.
- **React `cache()`** wraps service functions that are called from multiple RSC subtrees in the same request (e.g. `getSectionByOrderService`).

### Data model highlights

Core tables: `programs` → `sections` → `quizzes` → `questions` → `answers`. Each `section` has one optional `video`; a `quiz` is keyed by `(sectionId, nativeLanguage, targetLanguage)` so it's user-language-specific. `section_progress` tracks per-user video position and quiz completion status. Auth tables (`user`, `session`, `account`, `verification`) are managed by better-auth.

### Section page structure

`/programs/[programSlug]/[section]` (e.g. `section-1`) renders a two-column layout: `VideoPanel` (left) + `QuizPanel` (right). Both are async RSCs wrapped in `<Suspense>`. `QuizPanel` calls `getOrCreateQuizService` which lazily generates questions via AI if no quiz exists yet for the user's language pair.

### Environment variables required

`DATABASE_URL`, `OPENROUTER_API_KEY`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`