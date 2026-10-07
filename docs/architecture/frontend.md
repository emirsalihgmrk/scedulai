# Frontend Conventions

Covers `app/` and `components/`. Cross-cutting naming and import rules are in
[`code-style.md`](./code-style.md). The design system (tokens, shadcn usage, mock data) is governed
by the `ui-design` skill. **(lint)** marks rules `npm run lint` enforces and **(build)** marks rules
`npm run build` enforces.

The app runs with **`cacheComponents`** (Partial Prerendering). Every route prerenders a static shell,
and request data streams into it through `Suspense`. Every rule below exists to keep that shell
static.

---

## 1. Route anatomy

Every route has exactly two tiers:

```
page.tsx            routing + layout   sync, never awaits, owns <main> and every Suspense boundary
└ <section>         data               async server component or client component with use()
```

### `page.tsx`

- **Synchronous and never awaits.** It owns the page's `<main>`, its layout grid, and the `Suspense`
  boundary around every async section.
- It passes `params` / `searchParams` down **as promises**; only the ones the page uses.
- Typed with Next's generated route helper:

```tsx
// app/(app)/programs/[programSlug]/page.tsx
export default function Page({ params }: PageProps<"/programs/[programSlug]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <Suspense fallback={<ProgramHeroFallback />}>
        <ProgramHero params={params} />
      </Suspense>
      <Suspense fallback={<SectionTimelineFallback />}>
        <SectionTimeline params={params} />
      </Suspense>
    </main>
  );
}
```

- **Initial data** a child needs is started here **without `await`** and passed down as a promise
  (client child unwraps it with `use()`). Anything that must be resolved before rendering (a lookup
  that can `notFound()`) belongs to a section; see "Page-wide blocking dependency" below.
- Static markup that grows beyond a few lines is extracted into a regular component in `_components/`
  (`login-intro.tsx`); `page.tsx` stays a composition.

### `layout.tsx`

- **Synchronous**, with no data access. It is typed with `LayoutProps<"/route">`.
- A per-request guard (e.g. "signed in but not onboarded → `/onboarding`") is a small async
  component rendered inside `<Suspense fallback={null}>`, so the layout's shell stays static:

```tsx
// app/(app)/layout.tsx
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <OnboardingRedirect />
      </Suspense>
      <Header />
      {children}
    </div>
  );
}
```

### Redirects

Unconditional redirects (`/` → `/programs`) live in `next.config.ts` → `redirects()`, never in a page.
Conditional redirects are guards (above) or live in the section that owns the check.

---

## 2. Sections (data)

A **section** is a visually distinct area of a page that loads its own data (`program-hero`,
`transcript-card`, `quiz-card`).

- It is either an **async Server Component** that awaits `params` and read services, or a **Client
  Component** that receives a promise and unwraps it with `use()`.
- **It is always wrapped in `<Suspense fallback={<NameFallback />}>` at its call site** **(build)**.
  The build fails when request data (`headers()`, `params`, `usePathname()` on a dynamic route, …) is
  read outside a boundary. The same applies to client components that read request-bound hooks: the
  header wraps `NavTabs` (it uses `usePathname`) in Suspense with a static fallback.
- **Page-wide blocking dependency:** when every section needs the result of one lookup (params →
  section id, with `notFound()`), that lookup becomes **one async section**, `content.tsx`, next to
  `page.tsx` (`Content` + `ContentFallback`). It resolves the dependency, starts its children's
  fetches, and renders them inside their own boundaries. `page.tsx` wraps it in a single
  `<Suspense fallback={<ContentFallback />}>`. Routes without such a dependency have no
  `content.tsx`; their sections await `params` themselves.
  `[sectionSlug]/content.tsx` is the reference:

```tsx
export default async function Content({ params }: ContentProps) {
  const { programSlug, sectionSlug } = await params;
  const [user, section] = await Promise.all([             // parallel, never sequential
    getCurrentUserService(),
    getSectionByOrderService(programSlug, order),
  ]);
  if (!section) notFound();

  const quizPromise = getQuizService(section.id);          // started, not awaited
  return (
    <Suspense fallback={<QuizCardFallback />}>
      <QuizCard quizPromise={quizPromise} … />
    </Suspense>
  );
}
```

- `notFound()` / `redirect()` inside a streamed section can no longer change the HTTP status. Next
  renders the not-found UI and adds `noindex`. This is the accepted trade-off for a static shell.

### Avoiding waterfalls

- Independent awaits run in `Promise.all`, never one after another.
- Start a child's fetch before any `await` it doesn't depend on. Either pass the promise down (for a
  client child using `use()`) or call the child's read service without awaiting it
  (`void getVideoService(id)`) so its later call hits `React.cache`.

---

## 3. Data rules

- **Server components read only through `get…Service` functions.** They never import `db`, the DAL
  or `ai` **(lint)**.
- **Client components never fetch.** No `authClient.useSession()`, no `fetch` in effects. Server data
  arrives as props or as a promise consumed with `use()`.
- **Client components write only through server actions** and handle the returned `ActionResult`.
  The only exception is sign-in via `authClient` (see backend.md → Auth).
- After a mutation that changes server state shown elsewhere, call `router.refresh()`. Use a full
  reload (`window.location.assign`) after sign-in, so the server re-reads the session.

---

## 4. Component files

- **One component per file**, exported as `export default function <Name>`.
  - `<Name>` is the file name in PascalCase: `program-hero.tsx` → `ProgramHero`.
  - A folder entry `index.tsx` is named after its folder: `quiz-card/index.tsx` → `QuizCard`.
  - Special files are named after their role: `page.tsx` → `Page`, `layout.tsx` → `Layout`,
    `content.tsx` → `Content`, `error.tsx` → `ErrorBoundary`.
- **A section's fallback** is a named export `<Name>Fallback` in the same entry file. It is the only
  other export allowed:

  ```tsx
  export default async function ProgramsGrid() { … }
  export function ProgramsGridFallback() { … }
  ```

- **Private sub-parts** (a card inside a grid, a shell shared by a component and its fallback) are
  non-exported functions in the same file.
- **Props** are a named `interface <Name>Props` above the component.
- **Non-component modules**, all with named exports:

  | File                 | Holds                                           |
  | -------------------- | ----------------------------------------------- |
  | `<name>-context.tsx` | a context's `<Name>Provider` + its `use…` hooks |
  | `use-<name>.ts`      | one hook                                        |
  | `reducer.ts`         | a component's reducer, state and action types   |
  | `<concept>.ts`       | pure helpers and static data (`utils.ts`, `options.ts`, `steps.ts`) |

### When to use a folder

A component stays a single file until **any** of these is true, and then it becomes
`<name>/index.tsx` plus sibling files:

1. It mixes Server and Client parts (`account-panel/`: server `index.tsx` + client
   `sign-out-button.tsx`).
2. The file would exceed **250 lines**.
3. It has sub-components or helpers of its own that no one else uses.

A folder **without** `index.tsx` is a plain grouping of sibling files, named
`<variant>-<role>.tsx`.

### Placement

- `_components/` sits in the closest route segment that uses the component.
- A component used by several routes moves to `components/shared/`.
- `components/ui/` is shadcn-generated and edited only through the shadcn CLI.

---

## 5. Styling

- Conditional or merged classes always go through `cn()` from `@/lib/utils`, never template
  literals.
- Class maps (variant → classes) are `SCREAMING_SNAKE` constants next to the component that uses
  them (`DIFFICULTY_CLASSES` in `difficulty-badge.tsx`), never in `constants/`.
- Images always use `next/image`. A new remote host is added to `images.remotePatterns` in
  `next.config.ts`.
- Use the semantic Tailwind tokens from `globals.css`, never raw colour values.

## 6. Custom components & accessibility

Prefer `@/components/ui/*`. When shadcn has no equivalent, build a custom component that:

- sets `data-slot="<component-name>"` on its root;
- accepts `className` and merges it with `cn()` (and spreads `...props` for primitives);
- uses `cva` + `VariantProps` when it has variants (match `button.tsx`);
- uses `lucide-react` icons.

Accessibility (WCAG 2.1 AA):

- Interactive elements have visible text or an `aria-label`.
- Every interactive element has a `focus-visible` ring.
- Everything works from the keyboard.
