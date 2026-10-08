import { Suspense } from "react";

import Content, { ContentFallback } from "./content";

export default function Page({ params }: PageProps<"/practice/[mistakeId]">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Suspense fallback={<ContentFallback />}>
        <Content params={params} />
      </Suspense>
    </main>
  );
}
