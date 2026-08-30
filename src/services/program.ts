import {
  getFirstSection,
  getPrograms,
  getSectionByOrder,
} from "@/dal/program/queries";
import { ProgramListItem, Section } from "@/schemas/program";

export async function getProgramsService(): Promise<ProgramListItem[]> {
  return getPrograms();
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
