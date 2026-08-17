import { db } from "@/db";
import { channelsTable, transcriptsTable, videosTable } from "@/db/schema";
import { TranscriptLine, Video } from "@/types/video";
import { and, eq } from "drizzle-orm";

/* const tempUserId = "92a41e29-9ec6-4ed3-9c52-8ec9a5197ce1";
 */
export async function getVideo(): Promise<Video> {
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
    .from(videosTable)
    .innerJoin(channelsTable, eq(videosTable.channelId, channelsTable.id))
    .limit(1);

  if (!row)
    throw new Error("No unwatched videos with English transcripts available");

  return row;
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
