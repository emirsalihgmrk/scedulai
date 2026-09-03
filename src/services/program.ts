import { cache } from "react";

import {
  getFirstSection,
  getProgram,
  getPrograms,
  getSectionByOrder,
  getSectionProgress,
  getSections,
} from "@/dal/program/queries";
import { createSectionProgress } from "@/dal/program/mutations";
import { getCurrentUser } from "@/services/auth";
import {
  ProgramDetail,
  ProgramListItem,
  Section,
  SectionListItem,
  SectionProgress,
} from "@/schemas/program";

export async function getProgramsService(): Promise<ProgramListItem[]> {
  return getPrograms();
}

export async function getProgramService(
  slug: string,
): Promise<ProgramDetail | null> {
  const program = await getProgram(slug);
  return program ?? null;
}

export const getSectionsService = cache(
  async (
    programSlug: string,
    userId: string | null,
  ): Promise<SectionListItem[]> => {
    return getSections(programSlug, userId);
  },
);

export async function getFirstSectionService(
  programSlug: string,
): Promise<Section | null> {
  const section = await getFirstSection(programSlug);
  return section ?? null;
}

export const getSectionByOrderService = cache(
  async (programSlug: string, order: number): Promise<Section | null> => {
    const section = await getSectionByOrder(programSlug, order);
    return section ?? null;
  },
);

export const getSectionProgressService = cache(
  async (sectionId: string): Promise<SectionProgress | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const progress = await getSectionProgress(user.id, sectionId);
    return progress ?? null;
  },
);

export async function createSectionProgressService(
  sectionId: string,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return; // anonim → no-op

  await createSectionProgress(user.id, sectionId);
}
