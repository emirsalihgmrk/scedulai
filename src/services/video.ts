import { db } from "@/db";
import { transcriptsTable, videosTable, watchedVideosTable } from "@/db/schema";
import { TranscriptLine, Video } from "@/types/video";
import { and, eq, inArray, not } from "drizzle-orm";

const tempUserId = "92a41e29-9ec6-4ed3-9c52-8ec9a5197ce1";

export async function getVideo(): Promise<Video & { transcript: TranscriptLine[] }> {
  const watched = await db
    .select({ videoId: watchedVideosTable.videoId })
    .from(watchedVideosTable)
    .where(eq(watchedVideosTable.userId, tempUserId));

  const watchedIds = watched.map((w) => w.videoId);

  const [row] = await db
    .select({
      id: videosTable.id,
      createdAt: videosTable.createdAt,
      updatedAt: videosTable.updatedAt,
      url: videosTable.url,
      title: videosTable.title,
      speaker: videosTable.speaker,
      publishedAt: videosTable.publishedAt,
      durationSeconds: videosTable.durationSeconds,
      thumbnailUrl: videosTable.thumbnailUrl,
      transcript: transcriptsTable.content,
    })
    .from(videosTable)
    .innerJoin(
      transcriptsTable,
      and(
        eq(transcriptsTable.videoId, videosTable.id),
        eq(transcriptsTable.language, "en"),
      ),
    )
    .where(watchedIds.length > 0 ? not(inArray(videosTable.id, watchedIds)) : undefined)
    .limit(1);

  if (!row) throw new Error("No unwatched videos with English transcripts available");

  return row;
}