import { db } from "@/db";
import {
  channelsTable,
  sectionsTable,
  transcriptsTable,
  videosTable,
} from "@/db/schema";
import { TranscriptLine, Video } from "@/types/video";
import { and, eq } from "drizzle-orm";

export async function findVideo(sectionId: string): Promise<Video | null> {
  const [row] = await db
    .select({
      id: videosTable.id,
      youtubeId: videosTable.youtubeId,
      url: videosTable.url,
      title: videosTable.title,
      channelTitle: channelsTable.title,
      channelThumbnailUrl: channelsTable.thumbnailUrl,
      publishedAt: videosTable.publishedAt,
      durationSeconds: videosTable.durationSeconds,
      thumbnailUrl: videosTable.thumbnailUrl,
    })
    .from(sectionsTable)
    .innerJoin(videosTable, eq(sectionsTable.videoId, videosTable.id))
    .innerJoin(channelsTable, eq(videosTable.channelId, channelsTable.id))
    .where(eq(sectionsTable.id, sectionId))
    .limit(1);

  return row ?? null;
}

export async function getTranscript(
  videoId: string,
): Promise<TranscriptLine[]> {
  const [row] = await db
    .select({ content: transcriptsTable.content })
    .from(transcriptsTable)
    .where(
      and(
        eq(transcriptsTable.videoId, videoId),
        eq(transcriptsTable.language, "en"),
      ),
    )
    .limit(1);

  if (!row) throw new Error(`No English transcript found for video ${videoId}`);

  return row.content;
}
