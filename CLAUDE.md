# ScedulAI Contributor Guide

## Project purpose

ScedulAI is a personalized language-learning platform. It turns TED.com/TEDx transcripts into Turkish practice sentences, evaluates English translations, and will use each learner's error and vocabulary history to tailor later sessions. The durable product value is the learner profile and its accumulated learning data—not a particular LLM.

## Current implementation

This is an early MVP. The implemented end-to-end experiment is:

`TED.com/TEDx URL -> talk metadata validation -> transcript -> OpenRouter structured output -> 15 Turkish practice sentences`

- `src/schedule/15-sentences-per-day-with-tedx/simulation.ts` is the executable MVP workflow.
- `src/lib/ted.ts` owns TED.com URL validation, TEDx detection, metadata lookup, and transcript retrieval.
- `src/ai/index.ts` is the central LLM abstraction. Keep model/provider calls here rather than adding direct calls in pages, routes, or workflows.
- `src/ai/outputs/` holds Zod schemas used with AI SDK `Output.object`; these are structured-output definitions, not executable tools.
- `src/db/` is configured for Drizzle/Postgres, but `schema.ts` has not yet been implemented.
- `src/app/page.tsx` is only a placeholder UI; do not infer that planned app routes already exist.

Read `ROADMAP.md` for the longer-term product architecture and `DECISIONS.md` before changing an established technical decision.

## Commands

```bash
npm run dev                         # start the Next.js dev server
npm run lint                        # run ESLint
npx tsc --noEmit                    # type-check
npm run build                       # production build
npm run simulate [ted-url]          # run the transcript-to-sentences workflow
npx drizzle-kit push                # apply schema changes to the configured database
npx drizzle-kit studio              # open the Drizzle database UI
```

`simulate` requires the local environment configuration, including `OPENROUTER_API_KEY`. Never read, print, commit, or expose `.env*` files or their values.

## Engineering conventions

- TypeScript is strict; retain explicit types at module boundaries and use the `@/` path alias for `src` imports.
- In `src`, use kebab-case filenames, camelCase variables/parameters, PascalCase types and React component functions, and UPPER_SNAKE_CASE only where a constant benefits from being visually distinct.
- Keep user-facing learning content and feedback in the learner's configured native language; the current MVP uses Turkish.
- Use Zod schemas for LLM responses. Validate exact shape and count at the boundary instead of trusting free-form model text.
- Prefer `generateText` with `Output.object` for one-shot structured extraction. Do not reintroduce forced tool calling unless the task needs an actual multi-step agent loop; see `DECISIONS.md`.
- Keep provider/model selection configurable through `src/ai/index.ts`. Do not couple UI code to OpenRouter or a model identifier.
- Treat external inputs as untrusted: validate TED.com URLs and handle unavailable metadata/transcripts with useful errors.
- When database work begins, make learner history append-friendly and preserve the distinction between attempts, errors, vocabulary exposure, and mastery. The planned `errors` and `vocabulary` data are central to personalization.

## Validation and change scope

- For TypeScript or UI changes, run `npx tsc --noEmit` and `npm run lint`; run `npm run build` when route, configuration, or production behavior could be affected.
- For AI workflow changes, run `npm run simulate` with a suitable TEDx URL only when the required credentials and network access are available. Do not replace automated checks with a live LLM call.
- Keep changes focused. Do not modify generated directories (`.next/`, `node_modules/`) or secrets.
- Update `DECISIONS.md` when making a durable architectural choice, and update `ROADMAP.md` or `todo.md` when materially changing delivery scope.
