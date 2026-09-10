# Frontend Architecture & Component Conventions

This document defines the component conventions used to standardize data flow, clarify the
server/client boundary, and prevent waterfall (sequentially blocking) API calls.

---

## 1. `page.tsx` (Route Entry Point)

`page.tsx` files are used solely for route definition and parameter forwarding. The page shell is
kept as lean as possible.

- **No data fetching:** Contains no direct API calls, database queries, or data-fetching logic.
- **Synchronous:** The component must **not** be `async`.
- **Parameter forwarding:** `params` and `searchParams` are not resolved here; they are passed as
  **Promises** to the child components that need them.
- **Single responsibility:** Renders only the `PageView` (or main page container) that orchestrates
  the page.

```tsx
// app/courses/[id]/page.tsx
import CoursePageView from "./_components/course-page-view";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function CoursePage({ params, searchParams }: PageProps) {
  return <CoursePageView params={params} searchParams={searchParams} />;
}
```

---

## 2. `page-view.tsx` (Page Orchestration)

The orchestration layer that manages the page's actual layout, data coordination, and lifecycle.

- **Purpose:** The page-wide data coordination, preload triggers, and child-component initialization
  that are forbidden in `page.tsx` are carried out here.
- **Lifecycle & side effects:** Side effects that must run on mount/unmount, or page-level layout
  logic, are set up in this layer.
- **Suspense management:** The `Suspense` boundaries for independently data-fetching children are
  defined inside `page-view`.

---

## 3. Subcomponents & Modular Structure

- **Visual sectioning scope:** Each subcomponent represents an independent, visually distinct
  section/area of the page layout (e.g. `video-section`, `transcript-card`, `quiz-card`).
- **File standards:** Each component file must have a single `default export`. Its internal parts
  and its `fallback` (loading skeleton), if any, are defined in the same scope.
- **When to switch to a folder:** Components are kept as a single `.tsx` file by default. Switch to
  a folder structure in either of these two cases:
  1. **Mixed structure:** The component contains both Server and Client subparts.
  2. **Complexity:** The file exceeds **250 lines**.

### Example folder model:

```text
video-section/
├── index.tsx          # Component entry point
├── video-player.tsx   # Client component ("use client")
├── video-metadata.tsx # Server component
└── fallback.tsx       # Loading / Skeleton UI
```

> **Note:** If `index.tsx` is a Client Component that resolves a Promise via `React.use()`, create a
> separate `fallback.tsx` component.

---

## 4. Data Flow & Async Management Rules

### A. Consuming Data Inside a Client Component (`React.use`)

- If a Client Component needs async data, it does not run the data-fetching method directly.
- It receives an unresolved **Promise** as a prop from a parent Server Component and consumes it with
  `React.use()`.

```tsx
"use client";

import { use } from "react";

interface Transcript {
  id: string;
  text: string;
}

interface TranscriptCardProps {
  transcriptPromise: Promise<Transcript[]>;
}

export default function TranscriptCard({
  transcriptPromise,
}: TranscriptCardProps) {
  const transcript = use(transcriptPromise);

  return (
    <div>
      {transcript.map((item) => (
        <p key={item.id}>{item.text}</p>
      ))}
    </div>
  );
}
```

---

### B. Preventing Waterfalls with the Preload Pattern (Server Components)

If a parent component has a blocking operation (e.g. layout validation, `notFound()`, authorization
check), apply the **Preload Pattern** so the child's data fetch is not delayed.

- **React Cache:** The data-fetching service function must be wrapped with `React.cache`, so
  duplicate calls within the same render pass are served from the cache.
- **Preload function:** The request is kicked off in parallel (`void getService()`), so the parent's
  `await` does not block the child.

```tsx
// lib/services/video.ts
import { cache } from "react";

export const getVideoService = cache(async (sectionId: string) => {
  // Data-fetching logic
  return await db.query.videos.findFirst({
    where: eq(videos.sectionId, sectionId),
  });
});
```

```tsx
// components/video-section/video-section.tsx
import { getVideoService } from "@/lib/services/video";

export const preloadVideoSection = (sectionId: string) => {
  void getVideoService(sectionId);
};

export default async function VideoSection({
  sectionId,
}: {
  sectionId: string;
}) {
  const video = await getVideoService(sectionId);
  return <div>{video.title}</div>;
}
```

```tsx
// components/section/section-view.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import VideoSection, { preloadVideoSection } from "../video-section/video-section";
import VideoSectionFallback from "../video-section/fallback";

export default async function SectionView({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;

  // 1. Trigger the child's data early so it doesn't get stuck in a waterfall:
  preloadVideoSection(sectionId);

  // 2. This component's own blocking check:
  const section = await getSection(sectionId);
  if (!section) notFound();

  return (
    <main>
      <Suspense fallback={<VideoSectionFallback />}>
        <VideoSection sectionId={sectionId} />
      </Suspense>
    </main>
  );
}
```

---

### C. Suspense Boundaries

- Every component that consumes async data (whether a Server Component using `async/await` or a
  Client Component using `React.use()`) must be wrapped at its call site in a
  `<Suspense fallback={<Skeleton />}>` boundary.
- Blocking the entire page while data loads must be avoided; component-level independent loading
  states (streaming) must be provided.

---

## 5. Custom Components & Accessibility

Prefer `@/components/ui/*` (shadcn) components; the `ui-design` skill governs when to add a new one.
Build a custom component only when shadcn has no equivalent. When you do, follow these conventions:

- Use `cva` + `VariantProps` for variant management (match the `button.tsx` pattern).
- Set `data-slot="<component-name>"` on the root element.
- Use `cn()` from `@/lib/utils` for className merging.
- Accept `className` and spread `...props` onto the root element.
- Use Lucide icons from `lucide-react` (or Radix icons) for iconography.

### Accessibility (WCAG 2.1 AA)

- Interactive elements need `aria-*` labels or visible text.
- Provide `focus-visible` rings on all interactive elements.
- Ensure full keyboard operability.