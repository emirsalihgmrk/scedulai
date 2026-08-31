import type { SectionListItem } from "@/schemas/program";

// UI status is derived from per-user progress, not stored on the section:
// a section is "completed" once its quiz is passed, and "current" is the
// section the user most recently touched (max updatedAt).

export function isSectionCompleted(section: SectionListItem): boolean {
  return section.progress?.quizStatus === "passed";
}

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