import { cache } from "react";

import { getMistake, getMistakes } from "@/dal/mistake/queries";
import type { Mistake, MistakeListItem } from "@/schemas/mistake";
import { getCurrentUserService } from "@/services/auth";

// Only section mistakes are listed; practice mistakes are re-asked by the
// practice queue itself and kept for statistics.
export const getMistakesService = cache(
  async (): Promise<MistakeListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getMistakes(user.id, "section");
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
