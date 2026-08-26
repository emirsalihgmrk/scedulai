import { programsTable, sectionsTable } from "@/db/schema";

export type Program = typeof programsTable.$inferSelect;
export type Section = typeof sectionsTable.$inferSelect;
