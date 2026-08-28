import {
  getFirstSection,
  getPrograms,
  getSectionByOrder,
} from "@/dal/program/queries";
import { ProgramListItem, Section } from "@/schemas/program";

export async function getProgramsService(): Promise<ProgramListItem[]> {
  const programs = await getPrograms();

  //PERMISSION
  //

  return programs;
}

export async function getFirstSectionService(
  programSlug: string,
): Promise<Section | null> {
  const section = await getFirstSection(programSlug);
  if (!section) return null;

  //PERMISSION
  //

  return section;
}

export async function getSectionByOrderService(
  programSlug: string,
  order: number,
) {
  const section = await getSectionByOrder(programSlug, order);
  if (!section) return null;

  //PERMISSION
  //

  return section;
}
