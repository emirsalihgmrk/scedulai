# Backend Layer Conventions

> **Note:** The module and method names in the examples below (`Document`, `Project`, etc.)
> are illustrative and do not reflect the project's actual modules.

Data flows in one direction:

```
db/schema.ts · db/types.ts  →  schemas/  →  dal/  →  services/  →  actions/  →  client
```

- **DAL never calls a Service.** The direction is Pages/Actions → Services → DAL.
- **Auth and business logic live only in the Service layer.** DAL and Actions contain neither.

---

## Core Database Files

- **`db/schema.ts`** — Drizzle ORM tables and relations.
- **`db/types.ts`** — Generated **raw** types and schemas only; no narrowing or business logic:
  - Raw row types via `$inferSelect`: `<Module>Row` (e.g. `QuizRow`).
  - Raw insert/update schemas via `drizzle-zod`: `create<Module>RowSchema` / `update<Module>RowSchema`.

---

## 1. Schemas (`src/schemas/<module>.ts`)

This is the public DTO contract. Upper layers (especially the UI) **never import** `db/schema` or
`db/types` directly; they take their types from here.

### Query Types

- Derived from the raw `<Module>Row` types in `db/types.ts` via `Pick`/`Omit` and relation composition.
- **Naming:** Free-form, as long as it is **prefixed** with the module name.
  View/purpose-specific DTOs may be `<Module>ListItem` / `<Module>Detail`, relation composites
  `<Module>With<Relation>`.
  e.g. `Question`, `ProgramDetail`, `SectionListItem`, `QuizWithQuestions`.

### Mutation Schemas & Types

- Raw `create<Module>RowSchema` / `update<Module>RowSchema` schemas are **narrowed** as needed with
  `.pick()` / `.omit()` / `.partial()`.
  > This is *field narrowing*; do not confuse it with Zod's `.refine()` method (custom validation).
- Narrowed schemas combine into the **widest** form of the operation for the DAL layer:
  ```ts
  // archiveDocumentSchema + publishDocumentSchema → updateDocumentSchema
  const updateDocumentSchema = z.object({
    ...publishDocumentSchema.shape,
    ...archiveDocumentSchema.shape,
  });
  ```
- Every schema yields a TypeScript type via `z.infer`.

### Naming

Suffixes are mandatory; the name should reflect operation + module (part order is not strict).

- **Schema:** `Schema` suffix, camelCase (e.g. `updateDocumentSchema`).
- **Type:** `Input` suffix, PascalCase; derived from the schema via `z.infer` (e.g. `UpdateDocumentInput`).

---

## 2. Data Access Layer (`src/dal/<module>/{queries,mutations}.ts`)

Raw Drizzle queries. Contains **no** business logic and **no** auth.

### Shared Rules (`queries.ts` + `mutations.ts`)

- **Naming:** Method names are generic — the DAL states "which operation on which table", not "what for".
  - ❌ `getDocumentInfo`, `submitDocumentInfo`
  - ✅ `getDocument`, `createDocument`, `updateDocument`
- **Variables:** If a query result is assigned to a variable, use `row` for a single row, `rows` for an array.
- **Body:** Runs exactly **one** DB operation; no business logic.
- **"Not found" return:** `undefined` (Drizzle-native). `null` is **not used** — queries and mutations
  are consistent across the DAL.

### `queries.ts`

- **Parameters:** Only the ones strictly required for the query.
- **Return type:** The relevant query type from `schemas/<module>.ts`:
  - Single row → `<QueryType> | undefined` (e.g. `ProjectWithDocuments | undefined`)
  - Array → `<QueryType>[]` (e.g. `ProjectWithDocuments[]`)
- If the raw result doesn't exactly match the query type, only data **mapping** is allowed — no other logic.

### `mutations.ts`

- **Operation:** The body is a single `create` / `update` / `delete` / `upsert`.
- **Parameters:**
  - A single `input` parameter for the operation's payload.
  - Relation fields (`id`, `slug`, etc.) are **not** included in `input`; they are passed as separate parameters.
  - The `input` type is the **widest** type formed by the union of the narrowed schemas (e.g. `UpdateDocumentInput`).
  - Methods that must run inside a transaction take an optional `tx?` parameter. The DAL **never** starts
    its own transaction; when needed the Service opens `db.transaction` and passes `tx` to the methods.
- **Return type:**
  - Single → `<Type> | undefined` (e.g. `{ id: string } | undefined`), Array → `<Type>[]`, or `void` when appropriate.
  - ⚠️ `onConflictDoNothing` + a destructured `returning()` yields an empty array on conflict → the value is
    `undefined`. Type the return accordingly (`| undefined`).

---

## 3. Service Layer (`src/services/<module>.ts`)

Business logic and auth are enforced here. It calls the DAL; Pages/Actions call the Service.

### Naming

- `<verb><Module>[<Qualifier>]Service` — the name must **fully** reflect the work done; add a qualifier
  when it makes the work concrete.
  e.g. `getQuizService`, `submitAnswerService`, `generateQuizByAiService`.
- When the DAL uses a generic verb, the Service makes it semantically concrete:
  DAL `updateDocument` → Service `publishDocumentService` / `archiveDocumentService`.

### Return Type (queries and mutations alike)

- Single object → `<SchemaType> | null`
- Array → `<SchemaType>[]`
- Or `void`.

> Layer-boundary rule: the DAL uses `undefined` internally; the Service maps it to `null` at the outward
> DTO contract via `?? null`. This makes the `undefined`/`null` split principled — it tracks the layer
> boundary, not an arbitrary choice.
> When auth is required, throw `AppError` instead of returning `null` (see the flow below).

### Body Flow (both queries and mutations)

1. **User check** (`getCurrentUser` — `@/services/auth`):
   - Open to both registered and anonymous users (when user info is needed):
     ```ts
     const user = await getCurrentUser();
     ```
   - Registered users only:
     ```ts
     const user = await getCurrentUser();
     if (!user) throw new AppError("Unauthorized");
     ```
2. **Business logic** — apply rules if any.
3. **Validation** — untrusted user input is validated against the relevant (narrowed) schema
   (`safeParse` → throw `AppError` on failure).
4. **DAL call.**

- For mutations, the `input` type passed to the Service is not the DAL's wide type; it is the type
  **narrowed** to that specific operation.
- Multi-step writes run inside `db.transaction(async (tx) => …)`; `tx` is passed to the relevant DAL methods.

---

## 4. Server Actions (`src/actions/<module>.ts`)

- `"use server"` at the top of the file.
- **Naming:** `Action` suffix; the name reflects operation + module (e.g. `submitAnswerAction`).
- **Purpose:** Client ↔ Service bridge. Contains **no** business logic.
- **Behavior:** Calls the Service with the same parameters inside a `try/catch`:
  - Success → `{ ok: true, data }`
  - Error → `toActionFailure(error)` (`@/lib/action`)
  - The result is a standard `ActionResult<T>` object.

### Exception: Auth (better-auth)

Because better-auth is a thin wrapper, identity operations are an **exception** to these layer rules:

- The `signUpUser` / `signInUser` / `signOutUser` actions may perform validation (`schema.parse`) and call
  `auth.api.*` directly, without going through a separate service; a dedicated auth mutation service and
  the `Action` suffix are not required.
- `getCurrentUser` still lives in `services/auth.ts` and is used by other services as the auth boundary.

---

## Naming Quick Reference

| Layer             | Query                         | Mutation                                    |
| ----------------- | ----------------------------- | ------------------------------------------- |
| `db/types.ts`     | `QuizRow`                     | `createQuizRowSchema` / `updateQuizRowSchema` |
| `schemas/`        | `QuizWithQuestions`           | `updateDocumentSchema` / `UpdateDocumentInput` |
| `dal/`            | `getQuiz` → `… \| undefined`   | `createQuiz` → `… \| undefined`              |
| `services/`       | `getQuizService` → `… \| null` | `publishDocumentService` → `… \| null`       |
| `actions/`        | —                             | `submitAnswerAction` → `ActionResult<T>`     |