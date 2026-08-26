import { db } from "@/db";
import { programsTable, sectionsTable } from "@/db/schema";
import { and, asc, eq, getTableColumns } from "drizzle-orm";

export async function getFirstSection(programSlug: string) {
  const [row] = await db
    .select(getTableColumns(sectionsTable))
    .from(sectionsTable)
    .innerJoin(programsTable, eq(sectionsTable.programId, programsTable.id))
    .where(eq(programsTable.slug, programSlug))
    .orderBy(asc(sectionsTable.order))
    .limit(1);

  return row;
}

export async function getSectionByOrder(programSlug: string, order: number) {
  const [row] = await db
    .select(getTableColumns(sectionsTable))
    .from(sectionsTable)
    .innerJoin(programsTable, eq(sectionsTable.programId, programsTable.id))
    .where(
      and(eq(programsTable.slug, programSlug), eq(sectionsTable.order, order)),
    )
    .limit(1);

  return row;
}
