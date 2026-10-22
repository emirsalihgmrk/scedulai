import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import {
  listeningDaysTable,
  programsTable,
  sectionProgressTable,
} from "@/db/schema";
import type {
  ListeningDay,
  ProgramDetail,
  ProgramListItem,
  Section,
  SectionListItem,
  SectionProgress,
  SectionProgressWithSection,
} from "@/schemas/program";

export async function getPrograms(): Promise<ProgramListItem[]> {
  return db.query.programsTable.findMany({
    columns: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      thumbnailUrl: true,
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
            columns: {
              title: true,
              durationSeconds: true,
              thumbnailUrl: true,
              cefrLevel: true,
            },
          },
          progress: {
            // "" never matches a better-auth user id → anonymous stays neutral.
            where: (progress, { eq }) => eq(progress.userId, userId ?? ""),
            columns: {
              quizCompletedAt: true,
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

export async function getSectionProgress(
  userId: string,
  sectionId: string,
): Promise<SectionProgress | undefined> {
  return db.query.sectionProgressTable.findFirst({
    where: and(
      eq(sectionProgressTable.userId, userId),
      eq(sectionProgressTable.sectionId, sectionId),
    ),
    columns: {
      quizCompletedAt: true,
      videoPositionSeconds: true,
      updatedAt: true,
    },
  });
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

// The section the learner touched most recently, to pick up where they left off.
export async function getLatestSectionProgress(
  userId: string,
): Promise<SectionProgressWithSection | undefined> {
  return db.query.sectionProgressTable.findFirst({
    where: eq(sectionProgressTable.userId, userId),
    columns: {
      quizCompletedAt: true,
      videoPositionSeconds: true,
      updatedAt: true,
    },
    with: {
      section: {
        columns: { title: true, order: true },
        with: {
          program: { columns: { slug: true, title: true } },
          video: { columns: { durationSeconds: true, thumbnailUrl: true } },
        },
      },
    },
    orderBy: (progress, { desc }) => desc(progress.updatedAt),
  });
}

export async function getCompletedSectionCount(
  userId: string,
): Promise<number> {
  return db.$count(
    sectionProgressTable,
    and(
      eq(sectionProgressTable.userId, userId),
      isNotNull(sectionProgressTable.quizCompletedAt),
    ),
  );
}

// Every day ever listened: one row per day keeps the full history small.
export async function getListeningDays(
  userId: string,
): Promise<ListeningDay[]> {
  return db.query.listeningDaysTable.findMany({
    where: eq(listeningDaysTable.userId, userId),
    columns: { day: true, seconds: true },
    orderBy: (days, { asc }) => asc(days.day),
  });
}
