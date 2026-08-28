import { LibraryBig } from "lucide-react";

import { getProgramsService } from "@/services/program";
import { EmptyState } from "@/app/programs/[programSlug]/[section]/_components/empty-state";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProgramCard } from "./program-card";

export async function ProgramsGrid() {
  const programs = await getProgramsService();

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={LibraryBig}
        title="Henüz program yok"
        description="Şu an listelenecek bir program bulunmuyor. Veritabanını seed'ledikten sonra programlar burada görünecek."
      />
    );
  }

  return (
    <section aria-label="Available programs" className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{programs.length}</span>{" "}
        programs available
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </section>
  );
}

function ProgramCardFallback() {
  return (
    <Card>
      {/* Thumbnail placeholder — first child so Card rounds the top corners */}
      <div className="aspect-video w-full animate-pulse bg-muted" />

      <CardContent className="flex flex-col gap-3">
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded-md bg-muted" />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
      </CardFooter>
    </Card>
  );
}

export function ProgramsGridFallback() {
  return (
    <section
      aria-label="Loading programs"
      aria-busy
      className="flex flex-col gap-5"
    >
      <div className="h-4 w-36 animate-pulse rounded-md bg-muted" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProgramCardFallback key={i} />
        ))}
      </div>
    </section>
  );
}
