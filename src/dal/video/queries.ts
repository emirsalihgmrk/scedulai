import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sectionsTable, transcriptsTable } from "@/db/schema";
import type { Transcript, Video } from "@/schemas/video";

export async function getVideo(sectionId: string): Promise<Video | undefined> {
  const row = await db.query.sectionsTable.findFirst({
    where: eq(sectionsTable.id, sectionId),
    columns: {},
    with: {
      video: {
        columns: {
          id: true,
          youtubeId: true,
          url: true,
          title: true,
          publishedAt: true,
          durationSeconds: true,
          thumbnailUrl: true,
        },
        with: {
          channel: {
            columns: { title: true, thumbnailUrl: true },
          },
        },
      },
    },
  });

  const video = row?.video;
  if (!video?.channel) return undefined;

  return { ...video, channel: video.channel };
}

export async function getTranscript(
  videoId: string,
): Promise<Transcript | undefined> {
  return db.query.transcriptsTable.findFirst({
    where: eq(transcriptsTable.videoId, videoId),
    columns: { content: true },
  });
}
