import { cache } from "react";

import { getTranscript, getVideo } from "@/dal/video/queries";
import { TranscriptLine, Video } from "@/schemas/video";

export const getVideoService = cache(
  async (sectionId: string): Promise<Video | null> => {
    const video = await getVideo(sectionId);
    return video ?? null;
  },
);

export const getTranscriptService = cache(
  async (videoId: string): Promise<TranscriptLine[]> => {
    const transcript = await getTranscript(videoId);
    if (!transcript) return [];
    return transcript;
  },
);