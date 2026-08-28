import type { programsTable, sectionsTable } from "@/db/schema";

// db types
export type ProgramSelect = typeof programsTable.$inferSelect;
export type SectionSelect = typeof sectionsTable.$inferSelect;

// query types
export type Program = Omit<ProgramSelect, "createdAt" | "updatedAt">;
export type Section = Omit<SectionSelect, "createdAt" | "updatedAt">;

export type ProgramListItem = Pick<
  ProgramSelect,
  | "id"
  | "slug"
  | "title"
  | "shortDescription"
  | "thumbnailUrl"
  | "cefrLevel"
  | "referenceUrl"
>;
