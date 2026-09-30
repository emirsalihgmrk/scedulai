# Backend Conventions

Covers `constants/`, `db/`, `schemas/`, `dal/`, `services/`, `actions/`, `ai/` and `lib/`.
Cross-cutting naming and import rules are in [`code-style.md`](./code-style.md). **(lint)** marks rules
that `npm run lint` enforces.

---

## 1. Layers

```
constants/ ─┐
            ├→ db/ → schemas/ → dal/ → services/ → actions/ → client components
column-types┘                          ↑    ↑
                                      ai/  (server components call services)
```

Each layer may import only from the layers listed for it. Every upward or skipping edge is a lint
error **(lint)**:

| Layer                      | May import                                                          |
| -------------------------- | ------------------------------------------------------------------- |
| `constants/`               | other constants                                                     |
| `schemas/column-types.ts`  | `zod`, constants                                                    |
| `db/`                      | constants, `column-types`, `lib/` (seed scripts only)               |
| `schemas/`                 | `db/rows`, other schemas, constants                                 |
| `dal/`                     | `db`, schemas, constants                                            |
| `ai/`                      | schemas, constants                                                  |
| `services/`                | its own module's `dal/*/queries`, any `dal/*/mutations`, `ai/`, other services, schemas, constants, `lib/` |
| `actions/`                 | services, schemas, constants, `lib/action`                          |
| `app/`, `components/`      | services, actions, schemas, constants, `lib/utils`, `lib/auth-client` |
| `lib/`                     | `db`, schemas, constants (infrastructure, never feature layers)     |

- **Auth and business logic live only in services.** The DAL and actions contain neither.
- **Nothing calls upward.** The DAL never calls a service; a service never calls an action.

## 2. Modules

A module is one domain concept. Its name is **identical in every layer it has**. A module has only
the layers it needs, e.g. `user` has no service and `auth` has no DAL.

| Module             | Owns tables                                 | Layers                                   |
| ------------------ | ------------------------------------------- | ---------------------------------------- |
| `auth`             | `session`, `account`, `verification`        | schemas, services, actions (better-auth) |
| `user`             | `user`                                      | schemas, dal                             |
| `learning-profile` | `learning_profiles`                         | schemas, dal, services, actions          |
| `program`          | `programs`, `sections`, `section_progress`  | schemas, dal, services, actions          |
| `video`            | `channels`, `videos`, `transcripts`         | schemas, dal, services                   |
| `quiz`             | `quizzes`, `questions`, `answers`           | schemas, dal, services, actions          |
| `ai`               | `ai_traces`                                 | schemas, dal                             |

A module's DAL **writes only its own tables**. Reads may follow relations into other modules' tables
(e.g. `getSections` includes each section's `video` and `progress`).

---

## 3. `constants/` and `db/`

- **`constants/<concept>.ts`** holds value arrays, the literal types derived from them, and pure
  lookups over those values:

  ```ts
  export const QUIZ_STATUSES = ["in_progress", "passed", "failed"] as const;
  export type QuizStatus = (typeof QUIZ_STATUSES)[number];
  ```

  It never holds UI: no class names, icons or JSX.
- **DB enums** in `db/schema.ts` are always built from a `constants/` array
  (`pgEnum("quiz_status", QUIZ_STATUSES)`). New enum values are added in `constants/`.
- **`db/schema.ts`** holds tables, relations and enums. It defines no domain types. JSONB columns take
  their shape with `import type` + `$type<>()` from `schemas/column-types.ts`.
- **`db/index.ts`** exports `db` and the `Transaction` type.
- **`db/rows.ts`** holds generated shapes only, with no narrowing:

  | Export                    | For                                         | Source                   |
  | ------------------------- | ------------------------------------------- | ------------------------ |
  | `<Entity>Row`             | every table                                 | `$inferSelect`           |
  | `<entity>RowSchema`       | only where a read is parsed at runtime      | `createSelectSchema`     |
  | `create<Entity>RowSchema` | only tables the app writes                  | `createInsertSchema`     |

  There are **no update row schemas**. Update and upsert inputs derive from the create schema with
  `.partial()` (§4).

  ⚠️ drizzle-zod only *types* `$type<>()` columns. At runtime it emits a generic JSON validator, so
  every typed jsonb column must be refined with its real schema:
  `createInsertSchema(questionsTable, { payload: questionPayloadSchema })`.
- **`db/reset.ts`** drops every table and enum exported by `db/schema.ts` (the list is derived, never
  hand-written). Recreate the schema afterwards with `npm run db:push`.

### JSONB shapes (`schemas/column-types.ts`)

Every JSONB shape is defined once, as a Zod schema, in this one file. It is the single exception to
one-file-per-module, because these shapes must sit *below* `db/schema.ts`.

- **Leaf:** it imports only `zod` and `@/constants/*` **(lint)**.
- **Internal:** only `db/` and `schemas/` import it. Each module re-exports its own shapes
  (`schemas/quiz.ts` → question/answer shapes, `schemas/video.ts` → `TranscriptLine`), and every
  other layer imports from the module **(lint)**.
- **Discriminant:** only the object stored at a column's root carries `type` (`questions.payload`,
  `answers.result`). Nested parts (`response`, `analysis`) do not.
- **Per question type** there are four schemas: `<type>PayloadSchema`, `<type>ResponseSchema`,
  `<type>AnalysisSchema` and `<type>ResultSchema`. The column unions are `questionPayloadSchema` and
  `answerResultSchema`. A type added to `constants/question.ts` fails to compile until it is added here.

---

## 4. Schemas (`schemas/<module>.ts`)

The public DTO contract. Layers above the DAL take their types from here, never from `db/`.

Every file uses the same section order. Sections a module doesn't need are left out. Later sections
derive from earlier ones.

```ts
// ── Re-exports ──          jsonb shapes owned by this module
// ── Query types ──         what the DAL returns
// ── DAL input schemas ──   what the DAL accepts
// ── Service input schemas ── what callers send to a service
```

### Query types

- Plain TS types derived from `<Entity>Row` with `Pick` / `Omit` plus relation composition.
- Names: `<Entity>`, `<Entity>ListItem`, `<Entity>Detail`, `<Entity>With<Relation>`
  (`Question`, `ProgramListItem`, `ProgramDetail`, `QuizWithQuestions`).
- Relations stay nested under their relation name (`video.channel.title`), never flattened.
- Exception: when a read is parsed at runtime because it comes from outside the DAL (the better-auth
  session), declare `<entity>Schema = <entity>RowSchema.pick(…)` and infer the type from it
  (`userSchema` / `User`).

### DAL input schemas

- **Named after the DAL function they feed:** `upsertAnswer` → `upsertAnswerSchema` /
  `UpsertAnswerInput`. The verb is one of `create`, `update`, `upsert`, `delete`. A bulk function
  takes an array of the singular input (`createQuestions(quizId, CreateQuestionInput[])`).
- **Derived from `create<Entity>RowSchema`:**
  - `create…` → `.pick(…)`
  - `update…` / `upsert…` → `.pick(…).partial()`
- **Never include relation fields** (`userId`, `quizId`, …). Those are separate DAL parameters.
- **Value rules live here** (allowed sets, trimming, lengths, user-facing messages), so every write
  is valid regardless of the caller:

  ```ts
  export const updateUserSchema = createUserRowSchema
    .pick({ name: true, nativeLanguage: true })
    .extend({ name: z.string().trim().min(1, "Tell us what to call you").max(60) })
    .partial();
  ```

### Service input schemas

- **Named after the service without the `Service` suffix:** `completeOnboardingService` →
  `completeOnboardingSchema` / `CompleteOnboardingInput`.
- **Derived only by narrowing** the DAL input schema(s): `.pick`, `.omit`, `.required`, `.extend`
  with another module's shape.
- **Never include fields the server derives** (`levelSource`, `quizStatus`).
- A service input over a JSONB shape is an **alias**, never a re-declaration:
  `submitTranslationAnswerSchema = translationResponseSchema`.

Every schema exports its `z.infer` type: `<Name>Schema` → `<Name>Input`.

---

## 5. DAL (`dal/<module>/{queries,mutations}.ts`)

Raw Drizzle, one statement per function, no business logic, no auth.

- **Names** say which operation on which table, never what for:
  `get|create|update|upsert|delete<Entity>[s]`. ❌ `getQuizForPage` ✅ `getQuiz`.
- **Queries**
  - Use relational `db.query.*` and project only the columns the query type needs.
  - Take only the parameters the query needs; an optional user id is `string | null`.
  - Return the query type: single → `<Type> | undefined`, list → `<Type>[]`.
  - Return the Drizzle call directly. Assign `row` / `rows` only when the result needs mapping.
- **Mutations**
  - Signature is `(relationIds…, input, tx?)` and **every mutation accepts `tx?: Transaction`** as
    its last parameter:

    ```ts
    export async function upsertAnswer(
      userId: string,
      questionId: string,
      input: UpsertAnswerInput,
      tx?: Transaction,
    ): Promise<Answer> {
      const executor = tx ?? db;
      const [row] = await executor.insert(answersTable)…;
      return row;
    }
    ```

  - The DAL **never opens a transaction**; services do.
  - Return a query type, `{ id: string }` (when the caller needs the new id), or `void`.
  - `onConflictDoNothing()` + `returning()` yields nothing on conflict, so type the result
    `| undefined` and say so in a comment.
- **"Not found" is `undefined`** everywhere in the DAL (Drizzle-native). `null` is not used here.

---

## 6. Services (`services/<module>.ts`)

The module's public API. Pages call its read services; actions call its mutation services.

### Naming

- `<verb><Entity>[Qualifier]Service`, where the name states the whole use case: `getQuizService`,
  `saveVideoPositionService`, `generateQuizByAiService`.
- **Read services mirror the DAL 1:1:** `getX` → `getXService`. The current user is always implicit
  (a service resolves it itself), so names never say "Current": `getLearningProfileService()`.
- Where the DAL verb is generic, the service verb is concrete: DAL `upsertSectionProgress` →
  `saveVideoPositionService`, `evaluateQuizService`.
- Private helpers are not exported and have no suffix (`getLearnerLanguages`).

### Reads go through services, writes go through the DAL

- **Every DAL query is called by exactly one function: its `get…Service`.** Any other read of that
  data, in the same module or another one, calls the service. That way auth scoping, `null` mapping
  and `cache()` apply every time. Importing another module's `dal/*/queries` is a lint error; the
  same-module case is checked in review.
- **Writes call DAL mutations directly, from any module**, because they must be composed into one
  transaction (`retryQuizService` → `deleteAnswers` + `upsertSectionProgress`).

### Read services

```ts
export const getQuizService = cache(
  async (sectionId: string): Promise<QuizWithQuestions | null> => {
    const learner = await getLearnerLanguages();
    if (!learner) return null;
    const quiz = await getQuiz(sectionId, …);
    return quiz ?? null;
  },
);
```

- Always wrapped in `React.cache` (dedupes calls within a request, which the preload pattern relies on).
- Guests get `null` / `[]`, never an error.

### Mutation services

```ts
export async function completeOnboardingService(
  input: CompleteOnboardingInput,
): Promise<void> {
  const user = await getCurrentUserService();              // 1. auth
  if (!user) throw new AppError("Unauthorized");

  const data = completeOnboardingSchema.parse(input);      // 2. validate

  const profile = await getLearningProfileService();       // 3. reads + rules
  if (profile) return;

  await db.transaction(async (tx) => { … });                // 4. writes
}
```

1. **Auth:** `getCurrentUserService()`. Throw `AppError("Unauthorized")` when a user is required.
   A mutation that is deliberately open to guests returns early (no-op) and says so in a comment.
2. **Validate** untrusted input with `schema.parse(input)`. A `ZodError` reaches the client as its
   first issue message through `toActionFailure`.
3. **Reads and business rules**, via read services.
4. **Writes** via DAL mutations. More than one write runs in `db.transaction(async (tx) => …)`, with
   `tx` passed to each.

- Side effects that must not slow down or fail the request (AI traces) run in `after()`.

### Return types

- Single → `<Type> | null`, list → `<Type>[]`, or `void`.
- `<Type>` is always a named type from `schemas/` or `constants/`, never an inline object type.
- `undefined` from the DAL becomes `null` at this boundary (`?? null`), so `undefined` means "DAL"
  and `null` means "public contract".

### Errors

Expected failures throw `AppError` with a short, user-safe sentence ("Not found", "This section has
no video"). Anything else is treated as an internal error and never shown to the user.

---

## 7. Actions (`actions/<module>.ts`)

- `"use server"` at the top.
- **One action per mutation service the client calls, named after it:** `retryQuizService` →
  `retryQuizAction`, with the same parameters.
- **No logic.** Every action has exactly this shape:

  ```ts
  export async function retryQuizAction(
    sectionId: string,
  ): Promise<ActionResult> {
    try {
      await retryQuizService(sectionId);
      return { ok: true, data: undefined };
    } catch (error) {
      return toActionFailure(error);
    }
  }
  ```

- `ActionResult<T>` and `toActionFailure` come from `@/lib/action`.

## 8. Auth (better-auth)

- better-auth owns the auth tables and the identity fields on `user`. The app writes only
  `user.name` and `user.nativeLanguage`, through `dal/user`.
- `services/auth.ts` wraps better-auth's API instead of a DAL: `getCurrentUserService`,
  `signOutService`. `lib/auth.ts` (server config) is imported only by services, `lib/`, the auth
  route handler and `proxy.ts`.
- Sign-in (email OTP) is the one client-side call that skips actions. It goes through `authClient`
  so better-auth's `/api/auth` rate limits apply.

## 9. AI layer (`ai/`)

- `ai/index.ts`: `getAiObjectResponse()`, a single structured-output call over OpenRouter with retry
  and backoff.
- `ai/tasks/<task>.ts`: one exported function per task. Each task pins its model in a
  `<TASK>_MODEL` constant (`ANALYZE_SENTENCE_MODEL`, `GENERATE_SENTENCES_MODEL`).
- `ai/outputs/<task>.ts`: the Zod schema of a task's structured output.
  - When the output is **persisted**, the domain schema owns the shape and the output only
    `.extend()`s it with `.describe()` metadata. The task is typed with the domain type
    (`TranslationAnalysis`); there is no `<Task>Output` alias.
  - A **non-persisted** output keeps its own `<Task>Output` type in `ai/`.
- AI tasks are pure: they never touch `db/` or the DAL **(lint)**. Services call them and persist the
  results.

---

## Quick reference

| Layer         | Query                                   | Mutation                                               |
| ------------- | --------------------------------------- | ------------------------------------------------------ |
| `db/rows.ts`  | `QuizRow`, `userRowSchema`              | `createQuizRowSchema` (no update row schemas)          |
| `schemas/`    | `QuizWithQuestions`                     | DAL `upsertAnswerSchema` · service `saveVideoPositionSchema` |
| `dal/`        | `getQuiz` → `… \| undefined`            | `upsertAnswer(userId, questionId, input, tx?)`         |
| `services/`   | `getQuizService` → `… \| null` (cached) | `retryQuizService` → `void \| <Type> \| null`          |
| `actions/`    | —                                       | `retryQuizAction` → `ActionResult<T>`                  |
