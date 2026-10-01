import { Suspense } from "react";

import SectionWorkspace, { SectionWorkspaceFallback } from "./_components/section-workspace";

export default function Page({
  params,
}: PageProps<"/programs/[programSlug]/[sectionSlug]">) {
  return (
    <main className="px-4 py-6 sm:px-6">
      <Suspense fallback={<SectionWorkspaceFallback />}>
        <SectionWorkspace params={params} />
      </Suspense>
    </main>
  );
}
