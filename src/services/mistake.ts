import { cache } from "react";

import { RECENT_MISTAKE_DAYS } from "@/constants/mistake";
import { getMistakes, getRecentMistakes } from "@/dal/mistake/queries";
import type { MistakeListItem } from "@/schemas/mistake";
import { getCurrentUserService } from "@/services/auth";

const DAY_MS = 24 * 60 * 60 * 1000;

// Practice mistakes are left out: they are drilled again by the daily session
// itself and only kept for statistics.
export const getMistakesService = cache(
  async (): Promise<MistakeListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    return getMistakes(user.id, "section");
  },
);

// Every source counts here: a mistake made again in a daily set means the
// category is still weak.
export const getRecentMistakesService = cache(
  async (): Promise<MistakeListItem[]> => {
    const user = await getCurrentUserService();
    if (!user) return [];
    const since = new Date(Date.now() - RECENT_MISTAKE_DAYS * DAY_MS);
    return getRecentMistakes(user.id, since);
  },
);
