import { db } from "@/db";
import { programsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Section } from "@/schemas/program";

export async function getFirstSection(
  programSlug: string,
): Promise<Section | undefined> {
  const row = await db.query.programsTable.findFirst({
    where: eq(programsTable.slug, programSlug),
    columns: {},
    with: {
      sections: {
        columns: { createdAt: false, updatedAt: false },
        orderBy: (sections, { asc }) => asc(sections.order),
        limit: 1,
      },
    },
  });

  return row?.sections[0];
}

export async function getSectionByOrder(
  programSlug: string,
  order: number,
): Promise<Section | undefined> {
  const row = await db.query.programsTable.findFirst({
    where: eq(programsTable.slug, programSlug),
    columns: {},
    with: {
      sections: {
        columns: { createdAt: false, updatedAt: false },
        where: (sections, { eq }) => eq(sections.order, order),
        limit: 1,
      },
    },
  });

  return row?.sections[0];
}
