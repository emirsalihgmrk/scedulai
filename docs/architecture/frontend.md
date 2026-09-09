# Frontend Layer Conventions

> **Scope:** This document covers the frontend's **architecture and data flow** (RSC/Client boundary,
> data fetching, action consumption, forms, error/empty states, file layout).
>
> The **design system** (semantic color tokens, typography, radius, component-selection priority,
> `cva`/`data-slot`, accessibility, `page.tsx` architecture) lives separately in
> [`.claude/skills/ui-design/SKILL.md`](../../.claude/skills/ui-design/SKILL.md) — it is referenced
> here, not repeated.

The frontend is the consumer at the opposite end of the backend flow:

```
schemas/ (DTO)  →  services/ (from RSC)  ·  actions/ (from Client)  →  UI components
```

- **UI components consume only `schemas/` types.** Never import `db/schema` or `db/types`, and never
  call the DAL directly.
- **RSC calls `services/`; Client calls `actions/`.** Client components never call a service directly.

---

## 1. Server (RSC) vs Client Components

- **Default: Server Component.** It may be `async` and `await get…Service(...)` directly. Do **not** add `"use client"`.
- **Add `"use client"` only when required:** state/effects/event handlers/browser APIs
  (`useState`, `useTransition`, `useForm`, a video player, etc.).
- **Push `"use client"` to the leaf.** The data-fetching parent stays an RSC; only the interactive child
  becomes a client component. (e.g. `QuizPanel` is RSC → `QuizCard` is client.)
- **Client components receive data via `props`** (serializable `schemas/` DTOs); they do not fetch inside.

---

## 2. Files & Naming

- **File names:** kebab-case (`quiz-panel.tsx`, `program-hero.tsx`, `section-progress.ts`).
- **Component names:** PascalCase (`QuizPanel`, `ProgramCard`).
- **`page.tsx`:** the exported function is **always `Page`** and a **default export** (Next.js requirement);
  it is a lean orchestrator — composes child components under `<Suspense>` and holds no other logic. It
  stays **synchronous**: it does not `await` its `params` / `searchParams` (see below).
  - **`page.tsx` never contains an API call** — no service/DAL/`fetch` calls. Data fetching happens inside
    the child components it composes (any of them may query the database), so each can stream independently
    under its own `<Suspense>`.
  - **`page.tsx` never resolves its `params`.** `params` (and `searchParams`) arrive as a Promise; pass that
    promise **straight down** to the child components and let each resolve it itself (`await params` in an RSC
    child, `use(params)` in a client child). Awaiting `params` in the page makes `Page` `async` and blocks the
    whole `<Suspense>` shell — including every fallback — until it resolves; passing the promise keeps the
    shell instant and lets each subtree stream on its own.
    ```tsx
    export default function Page({
      params,
    }: {
      params: Promise<{ programSlug: string }>;
    }) {
      return (
        <Suspense fallback={<ProgramHeroFallback />}>
          <ProgramHero params={params} /> {/* the child awaits params itself */}
        </Suspense>
      );
    }
    ```
- **Export style:** Next.js special files (`page`/`layout`/`error`/`loading`/`not-found`) use default
  exports; other components use **named exports**. A file's single primary component may be default-exported,
  with its paired fallback as a **named** `XFallback` export.
- **Placement:**
  - `src/app/**/_components/` — UI blocks **private** to that route segment.
  - `src/components/shared/` — components shared across routes (`Header`, `EmptyState`).
  - `src/components/ui/` — shadcn-**generated** primitives; prefer `npx shadcn@latest add` over heavy manual
    editing (see ui-design skill).
  - A panel's sub-components and helpers are colocated (`video-player.tsx`, `utils.ts`, `_mock.ts`).

---

## 3. Data Fetching & Streaming (RSC)

- Data is fetched inside an `async` RSC via the **`…Service`** functions from `src/services`.
- Each independently-loading subtree is wrapped in `<Suspense fallback={<XFallback />}>`.
- The **fallback is colocated** with its component and exported as `XFallback`
  (e.g. `QuizPanel` + `QuizPanelFallback`, `PageView` + `PageViewFallback`).
- Use `notFound()` (`next/navigation`) when route data is missing.
- Use `after(() => …Service())` (`next/server`) for fire-and-forget writes — e.g.
  `createSectionProgressService` runs without blocking render.
- Services read by multiple RSC subtrees in the same request are wrapped in `cache()` (see backend.md §3).

### Preloading child subtrees behind a sequential parent await

When a parent RSC has its **own** sequential `await` chain before it can render its children, the
children's independent fetches would otherwise not start until the parent finishes *every* await and
React renders down to them — serializing round-trips that could run in parallel. **Kick off each
child's fetch the moment its dependency is known, before the parent's remaining `await`s.**

- Each preloadable child exports a **`preloadX(deps)`** helper colocated with the component. It is a
  plain (non-`async`) function that calls the child's `cache()`-wrapped service with **`void`** —
  fire-and-forget, never awaited:
  ```tsx
  export const preloadQuizPanel = (sectionId: string) => {
    void getQuizService(sectionId);
  };
  ```
- The parent calls every `preloadX(...)` **synchronously, right after the shared dependency resolves
  and before any further `await`**, so the child fetches run concurrently with the parent's remaining
  work:
  ```tsx
  const currentSection = await getSectionByOrderService(programSlug, sectionOrder);
  if (!currentSection) notFound();

  preloadVideoSection(currentSection.id); // fire child fetches now…
  preloadQuizPanel(currentSection.id);

  const progress = await getSectionProgressService(currentSection.id); // …while this await runs
  ```
- **Requires `cache()` on the child service** (backend.md §3): the fire-and-forget `void` call and the
  child RSC's later `await` must dedupe to one in-flight request — otherwise `preloadX` just doubles the
  work. Don't preload a service that isn't `cache()`-wrapped.
- Preloading is an optimization only: never `await` a `preloadX`, and never rely on its result — the
  child still fetches (and handles missing/`AppError` data) exactly as if it ran alone.

---

## 4. Server Action Consumption (Client)

- Import the action from `src/actions` and call it inside a **`useTransition`** (`startTransition`) or an
  RHF submit handler.
- The return is always handled as `ActionResult<T>`:
  ```tsx
  startTransition(async () => {
    try {
      const result = await submitAnswerAction(question.id, input);
      if (result.ok) onGraded(result.data);
      else setError(result.error);
    } catch {
      setError("Evaluation failed, please try again.");
    }
  });
  ```
- **Never call a service directly from a client component** — always go through an action.

---

## 5. Forms

- **`react-hook-form` + `zodResolver`**, validated with the **shared schema** from `src/schemas`
  (e.g. `signInSchema`) — the **same** contract the action validates. Do not redefine field schemas in
  the component.
- Use the `Field` / `FieldGroup` / `FieldError` / `FieldLabel` primitives; set `aria-invalid={!!errors.x}`
  on inputs.
- Navigate on success; on `!result.ok`, show an `Alert` (`variant="destructive"`) with `result.error`.

---

## 6. Error & Empty States

- **Domain errors:** the service throws `AppError`; the RSC catches it and renders `EmptyState`
  (icon + title + description). Non-`AppError` errors are re-thrown.
  ```tsx
  } catch (error) {
    if (error instanceof AppError) return <EmptyState … description={error.message} />;
    throw error;
  }
  ```
- **Route-level unexpected errors:** `src/app/error.tsx` (a client component, with `reset`).
- **Empty lists / unauthorized / missing data:** `EmptyState` from `@/components/shared/empty-state`.

---

## 7. Styling (summary — details: ui-design skill)

- Semantic tokens only (`bg-background`, `text-muted-foreground`, …); no hex, `gray-*`, or `slate-*`.
- Always merge classNames with `cn()` (`@/lib/utils`).
- Icon position via `data-icon="inline-start" | "inline-end"` (`button.tsx` manages the spacing).
- Headings/display text use `font-display`; body/UI text uses `font-sans`.
- Icons from `lucide-react`.

---

## Quick Reference

| Topic | Rule |
| --- | --- |
| Default component | Server Component (`async`, `await`s a service) |
| `"use client"` | Only on the **leaf** with state/effects/events/browser APIs |
| Data source | RSC → `…Service`; Client → `…Action` |
| Type source | `@/schemas/*` (never `db/schema` · `db/types`) |
| `page.tsx` params | Pass the `params`/`searchParams` promise to children; never `await` it in the page |
| Loading | `<Suspense fallback={<XFallback />}>` + colocated `XFallback` export |
| Preload | `preloadX(deps)` → `void cachedService(deps)`, called before the parent's next `await` |
| Missing data | `notFound()` |
| Action result | `ActionResult<T>` → `result.ok ? data : error` |
| Form | `react-hook-form` + `zodResolver(shared schema)` |
| Error display | `AppError` → `EmptyState`; route → `error.tsx`; form → `Alert` |
