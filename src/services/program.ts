import { cache } from "react";

import { upsertSectionProgress } from "@/dal/program/mutations";
import {
  getProgram,
  getPrograms,
  getSectionByOrder,
  getSectionProgress,
  getSections,
} from "@/dal/program/queries";
import {
  saveVideoPositionSchema
  
  
  
  
  
  
} from "@/schemas/program";
import type {ProgramDetail, ProgramListItem, SaveVideoPositionInput, Section, SectionListItem, SectionProgress} from "@/schemas/program";
import { getCurrentUserService } from "@/services/auth";

export const getProgramsService = cache(
  async (): Promise<ProgramListItem[]> => {
    return getPrograms();
  },
);

export const getProgramService = cache(
  async (slug: string): Promise<ProgramDetail | null> => {
    const program = await getProgram(slug);
    return program ?? null;
  },
);

export const getSectionsService = cache(
  async (programSlug: string): Promise<SectionListItem[]> => {
    const user = await getCurrentUserService();
    return getSections(programSlug, user?.id ?? null);
  },
);

export const getSectionByOrderService = cache(
  async (programSlug: string, order: number): Promise<Section | null> => {
    const section = await getSectionByOrder(programSlug, order);
    return section ?? null;
  },
);

export const getSectionProgressService = cache(
  async (sectionId: string): Promise<SectionProgress | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const progress = await getSectionProgress(user.id, sectionId);
    return progress ?? null;
  },
);

// Guests can watch videos too; their position is simply not saved.
export async function saveVideoPositionService(
  sectionId: string,
  input: SaveVideoPositionInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) return;

  const data = saveVideoPositionSchema.parse(input);

  await upsertSectionProgress(user.id, sectionId, data);
}
