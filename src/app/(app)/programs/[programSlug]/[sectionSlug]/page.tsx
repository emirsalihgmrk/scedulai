import { Suspense } from "react";

import Content, { ContentFallback } from "./content";

export default function Page({
  params,
}: PageProps<"/programs/[programSlug]/[sectionSlug]">) {
  return (
    <main className="px-4 py-6 sm:px-6">
      <Suspense fallback={<ContentFallback />}>
        <Content params={params} />
      </Suspense>
    </main>
  );
}
