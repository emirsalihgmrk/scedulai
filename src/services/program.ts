import { cache } from "react";

import {
  getFirstSection,
  getProgram,
  getPrograms,
  getSectionByOrder,
  getSectionProgress,
  getSections,
} from "@/dal/program/queries";
import { upsertSectionProgress } from "@/dal/program/mutations";
import { getCurrentUser } from "@/services/auth";
import { AppError } from "@/lib/errors";
import {
  ProgramDetail,
  ProgramListItem,
  Section,
  SectionListItem,
  SectionProgress,
  SaveVideoPositionInput,
  saveVideoPositionSchema,
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
  async (programSlug: string): Promise<SectionListItem[]> => {
    const user = await getCurrentUser();
    return getSections(programSlug, user?.id ?? null);
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

export async function saveVideoPositionService(
  sectionId: string,
  input: SaveVideoPositionInput,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return; // anonim → no-op

  const parsedResult = saveVideoPositionSchema.safeParse(input);
  if (!parsedResult.success) throw new AppError("Invalid data");

  await upsertSectionProgress(user.id, sectionId, parsedResult.data);
}
