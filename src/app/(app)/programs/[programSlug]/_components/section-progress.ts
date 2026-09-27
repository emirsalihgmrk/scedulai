import type { SectionListItem } from "@/schemas/program";

export function currentSectionId(sections: SectionListItem[]): string | null {
  let current: SectionListItem | null = null;

  for (const section of sections) {
    if (!section.progress) continue;
    if (
      !current?.progress ||
      section.progress.updatedAt > current.progress.updatedAt
    ) {
      current = section;
    }
  }

  return current?.id ?? null;
}
