import { db } from "@/db";
import { programsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type {
  ProgramDetail,
  ProgramListItem,
  Section,
  SectionListItem,
} from "@/schemas/program";

export async function getPrograms(): Promise<ProgramListItem[]> {
  return db.query.programsTable.findMany({
    columns: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      thumbnailUrl: true,
      difficulty: true,
      referenceUrl: true,
    },
    orderBy: (programs, { asc }) => asc(programs.title),
  });
}

export async function getProgram(
  slug: string,
): Promise<ProgramDetail | undefined> {
  return db.query.programsTable.findFirst({
    where: eq(programsTable.slug, slug),
    columns: {
      id: true,
      slug: true,
      title: true,
      description: true,
      shortDescription: true,
      thumbnailUrl: true,
      difficulty: true,
      referenceUrl: true,
    },
    with: {
      channel: {
        columns: { title: true, thumbnailUrl: true },
      },
    },
  });
}

export async function getSections(
  programSlug: string,
  userId: string | null,
): Promise<SectionListItem[]> {
  const row = await db.query.programsTable.findFirst({
    where: eq(programsTable.slug, programSlug),
    columns: {},
    with: {
      sections: {
        columns: { id: true, title: true, order: true },
        orderBy: (sections, { asc }) => asc(sections.order),
        with: {
          video: {
            columns: { title: true, durationSeconds: true, thumbnailUrl: true },
          },
          progress: {
            // "" never matches a better-auth user id → anonymous stays neutral.
            where: (progress, { eq }) => eq(progress.userId, userId ?? ""),
            columns: {
              quizStatus: true,
              videoPositionSeconds: true,
              updatedAt: true,
            },
            limit: 1, // unique(userId, sectionId)
          },
        },
      },
    },
  });

  return (row?.sections ?? []).map(({ progress, ...section }) => ({
    ...section,
    progress: progress[0] ?? null,
  }));
}

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
