import { db } from "@/db";
import { programsTable, sectionsTable } from "@/db/schema";
import { Section } from "@/types/section";
import { and, asc, eq } from "drizzle-orm";

export async function findSection(
  programSlug: string,
  order: "first" | number,
): Promise<Section | null> {
  let query = db
    .select({
      id: sectionsTable.id,
      createdAt: sectionsTable.createdAt,
      updatedAt: sectionsTable.updatedAt,
      programId: sectionsTable.programId,
      videoId: sectionsTable.videoId,
      title: sectionsTable.title,
      order: sectionsTable.order,
    })
    .from(sectionsTable)
    .innerJoin(programsTable, eq(sectionsTable.programId, programsTable.id))
    .$dynamic();

  if (order === "first") {
    query = query
      .where(eq(programsTable.slug, programSlug))
      .orderBy(asc(sectionsTable.order));
  } else {
    query = query.where(
      and(eq(programsTable.slug, programSlug), eq(sectionsTable.order, order)),
    );
  }
  query = query.limit(1);
  const [row] = await query;

  return row ?? null;
}
