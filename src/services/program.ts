import { getFirstSection, getSectionByOrder } from "@/dal/program/queries";
import { Section } from "@/types/section";

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
