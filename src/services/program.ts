import {
  getFirstSection,
  getProgram,
  getPrograms,
  getSectionByOrder,
  getSections,
} from "@/dal/program/queries";
import {
  ProgramDetail,
  ProgramListItem,
  Section,
  SectionListItem,
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

export async function getSectionsService(
  programSlug: string,
  userId: string | null,
): Promise<SectionListItem[]> {
  return getSections(programSlug, userId);
}

export async function getFirstSectionService(
  programSlug: string,
): Promise<Section | null> {
  const section = await getFirstSection(programSlug);
  return section ?? null;
}

export async function getSectionByOrderService(
  programSlug: string,
  order: number,
): Promise<Section | null> {
  const section = await getSectionByOrder(programSlug, order);
  return section ?? null;
}
