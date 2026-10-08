import { cache } from "react";

import { getMistake, getMistakes } from "@/dal/mistake/queries";
import type { Mistake, MistakeListItem } from "@/schemas/mistake";
import { getCurrentUserService } from "@/services/auth";

export const getMistakesService = cache(
  async (): Promise<MistakeListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getMistakes(user.id);
  },
);

export const getMistakeService = cache(
  async (mistakeId: string): Promise<Mistake | null> => {
    const user = await getCurrentUserService();
    if (!user) return null;
    const mistake = await getMistake(mistakeId, user.id);
    return mistake ?? null;
  },
);
