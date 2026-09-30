# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Next.js)
npm run build        # production build (also enforces the Suspense rules)
npm run start        # serve the production build
npm run lint         # ESLint: naming, imports, layer boundaries
npm run typecheck    # next typegen + tsc --noEmit

npm run db:push      # push schema changes to DB (no migration file)
npm run db:generate  # generate migration SQL files
npm run db:migrate   # run migrations
npm run db:seed      # seed DB (tsx src/db/seed.ts)
npm run db:reset     # drop every table and enum in db/schema.ts (then run db:push)
```

A change is done when `lint`, `typecheck` and `build` all pass.

## Stack

Next.js 16 (App Router, React 19, React Compiler, `cacheComponents`) · Drizzle ORM · PostgreSQL ·
better-auth (+ Resend for email) · Vercel AI SDK via OpenRouter · Zod v4 · react-hook-form ·
Tailwind CSS v4 with shadcn / Radix / Base UI.

## Conventions

Every file follows written rules; read the relevant doc before writing code:

- [`docs/architecture/code-style.md`](./docs/architecture/code-style.md): naming, types, imports,
  exports and comments (all of `src/`).
- [`docs/architecture/backend.md`](./docs/architecture/backend.md): layers and modules, `db/`,
  schemas, DAL, services, actions, auth and the AI layer.
- [`docs/architecture/frontend.md`](./docs/architecture/frontend.md): route anatomy
  (`page.tsx` → `page-view.tsx` → sections), Suspense, data rules, component files and styling. The
  design system itself is governed by the `ui-design` skill.

```
src/
  app/          # routes: page.tsx → _components/page-view.tsx → sections
  actions/      # server actions: one per mutation service
  services/     # module public API: auth, business rules, cached reads
  dal/          # raw Drizzle, per module: {queries,mutations}.ts
  schemas/      # Zod DTOs per module; column-types.ts = JSONB shapes (below db/)
  constants/    # value arrays + literal types; source of the DB enums
  ai/           # LLM tasks and output schemas
  lib/          # auth.ts, auth-client.ts, action.ts (ActionResult), errors.ts (AppError), utils.ts, youtube.ts
  db/           # schema.ts, rows.ts (generated row types/schemas), index.ts (db, Transaction), seed/reset
  components/   # shared/ (app-wide) and ui/ (shadcn)
```

### Data model

Auth tables (`user`, `session`, `account`, `verification`) are owned by better-auth. Domain tables:
`programs` → `sections`, with `channels` → `videos` → `transcripts` on the content side, and
`quizzes` → `questions` → `answers` on the exercise side. `section_progress` tracks per-user
progress. Quizzes are keyed per user language pair, so questions can be generated on demand.

`user.nativeLanguage` is a property of the person; everything about *what* they learn (target
language, CEFR level, goal, daily minutes) lives in `learning_profiles`, one row per
(user, target language). Having a profile **is** "onboarded"; there is no flag. Signed-in users
without one are redirected to `/onboarding` by the `(app)` layout's guard; guests never are.

Auth is passwordless (email OTP). Onboarding (`/onboarding`) is also sign-up: its last step is
email → code, then `completeOnboardingAction` writes the profile.

## Environment variables

`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `OPENROUTER_API_KEY`,
`RESEND_API_KEY`, `RESEND_FROM_EMAIL` (sign-in codes; in dev the code is also logged to the server
console), `YOUTUBE_API_KEY`.
