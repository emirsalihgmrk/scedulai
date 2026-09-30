# Code Style

Rules that apply to every file in `src/`. Layer rules live in [`backend.md`](./backend.md) and
[`frontend.md`](./frontend.md). Anything marked **(lint)** is enforced by `npm run lint`; everything
else is enforced in review.

---

## Language

- Code, comments, commit headers and docs are written in **English**.
- The product name is spelled **ScedulAI** in all user-facing copy.

## Files & folders

- File names are `kebab-case` **(lint)**.
- Folder names are `kebab-case`, plus the Next.js forms `(group)`, `[param]`, `[...param]` and
  `_private` **(lint)**.
- Dynamic segments are camelCase and name what they hold: `[programSlug]`, `[sectionSlug]`.
- A component file is named after its component: `difficulty-badge.tsx` → `DifficultyBadge`. A `.ts`
  module is named after the concept it holds: `section-progress.ts`, `question-preview.ts`.

## Identifiers

| Kind                                   | Case                  | Example                                     |
| -------------------------------------- | --------------------- | ------------------------------------------- |
| Variables, functions, parameters       | `camelCase`           | `sectionId`, `getQuizService`               |
| Components, types, interfaces          | `PascalCase`          | `QuizCard`, `QuizWithQuestions`             |
| Module-level constants and lookup maps | `SCREAMING_SNAKE`     | `QUESTION_COUNT`, `DIFFICULTY_CLASSES`      |
| Zod schemas                            | `camelCase` + suffix  | `upsertAnswerSchema`                        |

**Acronyms are written as words:** `AiTrace`, `aiTrace`, `AI_TASKS`, `SendOtpInput`,
`thumbnailUrl`, `useYoutubePlayer`. Never `AITrace`, `OTP`, `URL`, `YouTube` inside identifiers.

**Naming by role:**

- Functions start with a verb: `getCurrentSectionId`, `getQuestionPreview`, `buildSteps`.
- Booleans start with `is` / `has` / `can` / `should`: `isPending`, `hasRequestedRef`,
  `canContinue`, `shouldPrime`. This applies to state too: `const [isFlipped, setIsFlipped]`.
- Event handlers defined in a component are `handle<Event>`; callback props are `on<Event>`:
  `onClick={handleRetry}`, `onGraded={…}`.
- Refs end in `Ref`: `containerRef`, `lastEvaluatedRef`.

## Types

- Object shapes are `interface`; unions, aliases and derived types (`Pick`, `Omit`, `&`, `z.infer`)
  are `type` **(lint)**.
- Component props are always a named `interface <Component>Props` declared above the component,
  never an inline object type.
- Type-only imports use a top-level `import type { … }`, never inline `type` specifiers **(lint)**.
  A module that supplies both values and types is imported twice:

  ```ts
  import { cn } from "@/lib/utils";
  import type { QuizStatus } from "@/constants/progress";
  ```

## Imports

- Always import through the `@/` alias **(lint)**.
- Relative imports (`./`, `../`) are allowed **only inside `src/app`**, where a route imports its own
  `_components` **(lint)**.
- Import order is fixed **(lint, auto-fixable)**:
  1. packages
  2. `@/…`
  3. relative

  The groups are separated by one blank line and alphabetised within each group.

## Exports

- Backend folders (`actions`, `ai`, `constants`, `dal`, `db`, `lib`, `schemas`, `services`) use
  **named exports only** **(lint)**.
- React components use a default export. See [`frontend.md` → Component files](./frontend.md#4-component-files).
- Nothing is exported "just in case". An export with no importer is deleted.

## Comments

- Explain **why**, not what. Explain a decision, a constraint, or a non-obvious trade-off. Code that
  reads clearly gets no comment.
- Section dividers inside a file use `// ── Title ──`.

## Tooling

```bash
npm run lint       # ESLint: naming, imports, layer boundaries, type style
npm run typecheck  # next typegen (route types) + tsc --noEmit
npm run build      # also enforces the Suspense rules (cacheComponents)
```

All three must pass before a change is done.
