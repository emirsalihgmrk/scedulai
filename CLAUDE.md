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
  (`page.tsx` → sections), Suspense, data rules, component files and styling. The
  design system itself is governed by the `ui-design` skill.

```
src/
  app/          # routes: page.tsx → _components/ sections
  actions/      # server actions: one per mutation service
  services/     # module public API: auth, business rules, cached reads
  dal/          # raw Drizzle, per module: {queries,mutations}.ts
  schemas/      # Zod DTOs per module; column-types.ts = JSONB shapes (below db/)
  constants/    # value arrays + literal types; source of the DB enums
  ai/           # LLM tasks and output schemas
  lib/          # auth.ts, auth-client.ts, action.ts (ActionResult), errors.ts (AppError), utils.ts, youtube.ts, fsrs.ts
  db/           # schema.ts, rows.ts (generated row types/schemas), index.ts (db, Transaction), seed/reset
  components/   # shared/ (app-wide) and ui/ (shadcn)
```

### Data model

Auth tables (`user`, `session`, `account`, `verification`) are owned by better-auth. Domain tables:
`programs` → `sections`, with `channels` → `videos` → `transcripts` on the content side, and
`quizzes` / `practices` → `questions` on the exercise side. `section_progress` tracks per-user progress
(video position, `quizCompletedAt`). Quizzes are keyed per native language, so questions can be
generated on demand. Answers are graded but never stored: the quiz card re-queues a wrong answer at
the end and the quiz is complete once every question is answered correctly. The mistakes found in
each graded answer are stored, though: one `mistakes` row per mistake per attempt (categorized by the
AI, with the sentence and answer snapshotted).

Mistakes are not practiced one by one. `/practice` lists section mistakes read-only, grouped by
category (the mistake notebook), and `/practice/session` is the daily session: the due and new
words first, then a `practices` row, one learner's daily set of 5 AI-generated `questions` drilling
their weakest category (graded like the quiz, `completedAt` once finished). "Today" is a 20-hour
window until the learner's time zone is known: a set created within it is today's, and none is made
again. A category is as weak as its mistakes made since its last finished set was created (within
30 days if it was never drilled), so a set answered without a mistake moves the session on and an
abandoned one changes nothing; `other` is never drilled. The
set is written around that category's most recent distinct mistakes. A question belongs to exactly
one owner, a section quiz (shared) or a practice (one user's); a check constraint enforces it. Each
mistake records its `source` (`section` | `practice`); both count towards weakness, but only section
mistakes are listed.

Saved words live in `vocabulary_items` (one per user and phrase, listed on `/vocabulary`): `phrase`
is English in dictionary form, `meaning` is in the learner's native language and `context` is the
English sentence it came from. A phrase picked from a transcript line is defined by the AI and keeps
the video and the line's timestamp; saving it again from a transcript replaces its context. A quiz
or practice gloss already carries its translation (no AI call), keeps the section's video (quiz
only) and never replaces an existing item. `contextPhrase` is the phrase as the context sentence
says it ("gave up" for "give up"), null when it can't be located.

Saved words are reviewed with spaced repetition (FSRS via `ts-fsrs`) in the daily session: the card
shows the meaning and the context with the phrase masked, the learner types the English and the
answer is checked on the client (a miss is `again`, a hit or an overruled miss is `good`). A word's
schedule lives in `vocabulary_cards`, created by its first review; having no card **is** "new".
Scheduling is long-term only (one review per word per session); a miss is re-asked at the end of
the session without another review. Every review is logged in `vocabulary_reviews` (rating and the
state before it, never the answer).

The learned language is always English; there is no target-language setting anywhere.
`user.nativeLanguage` is a property of the person; how they learn (CEFR level, goal, daily minutes)
lives in `learning_profiles`, one row per user. Having a profile **is** "onboarded"; there is no flag. Signed-in users
without one are redirected to `/onboarding` by the `(app)` layout's guard; guests never are.

Auth is passwordless (email OTP). Onboarding (`/onboarding`) is also sign-up: its last step is
email → code, then `completeOnboardingAction` writes the profile.

## Environment variables

`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `OPENROUTER_API_KEY`,
`RESEND_API_KEY`, `RESEND_FROM_EMAIL` (sign-in codes; in dev the code is also logged to the server
console), `YOUTUBE_API_KEY`.
