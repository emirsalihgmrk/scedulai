import { cache } from "react";

import {
  upsertListeningDay,
  upsertSectionProgress,
} from "@/dal/program/mutations";
import {
  getCompletedSectionCount,
  getLatestSectionProgress,
  getListeningDays,
  getProgram,
  getPrograms,
  getSectionByOrder,
  getSectionProgress,
  getSections,
} from "@/dal/program/queries";
import { db } from "@/db";
import { getLocalDay } from "@/lib/time-zone";
import { saveVideoPositionSchema } from "@/schemas/program";
import type {
  ListeningDay,
  ProgramDetail,
  ProgramListItem,
  SaveVideoPositionInput,
  Section,
  SectionListItem,
  SectionProgress,
  SectionProgressWithSection,
} from "@/schemas/program";
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

export const getLatestSectionProgressService = cache(
  async (): Promise<SectionProgressWithSection | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const progress = await getLatestSectionProgress(user.id);
    return progress ?? null;
  },
);

export const getCompletedSectionCountService = cache(
  async (): Promise<number> => {
    const user = await getCurrentUserService();
    if (!user) return 0;
    return getCompletedSectionCount(user.id);
  },
);

export const getListeningDaysService = cache(
  async (): Promise<ListeningDay[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getListeningDays(user.id);
  },
);

// Guests can watch videos too; their position is simply not saved. The time
// played is added to the learner's current local day.
export async function saveVideoPositionService(
  sectionId: string,
  input: SaveVideoPositionInput,
): Promise<void> {
  const user = await getCurrentUserService();
  if (!user) return;

  const { videoPositionSeconds, listenedSeconds } =
    saveVideoPositionSchema.parse(input);

  if (listenedSeconds === 0) {
    await upsertSectionProgress(user.id, sectionId, { videoPositionSeconds });
    return;
  }

  const day = getLocalDay(new Date(), user.timeZone);
  await db.transaction(async (tx) => {
    await upsertSectionProgress(
      user.id,
      sectionId,
      { videoPositionSeconds },
      tx,
    );
    await upsertListeningDay(user.id, day, { seconds: listenedSeconds }, tx);
  });
}
