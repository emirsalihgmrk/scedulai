import { db } from "@/db";
import {
  channelsTable,
  programsTable,
  questionsTable,
  quizzesTable,
  sectionsTable,
  transcriptsTable,
  videosTable,
} from "@/db/schema";
import {
  fetchEnglishTranscript,
  getChannelThumbnails,
  getUploadsPlaylistId,
  getVideoDetails,
  listVideoIds,
} from "@/lib/youtube";

const YOUTUBE_CHANNEL = "@TED";
const VIDEO_LIMIT = 10;

async function seed() {
  console.log("Clearing database...");
  await db.delete(questionsTable);
  await db.delete(quizzesTable);
  await db.delete(sectionsTable);
  await db.delete(transcriptsTable);
  await db.delete(videosTable);
  await db.delete(programsTable);
  await db.delete(channelsTable);

  console.log(
    `Fetching up to ${VIDEO_LIMIT} videos from ${YOUTUBE_CHANNEL}...`,
  );
  const uploadsPlaylistId = await getUploadsPlaylistId(YOUTUBE_CHANNEL);
  const videoIds = await listVideoIds(uploadsPlaylistId, VIDEO_LIMIT);
  const metas = await getVideoDetails(videoIds);

  metas.sort((a, b) => Number(b.hasCaptions) - Number(a.hasCaptions));

  const uniqueChannelIds = [...new Set(metas.map((m) => m.channelId))];
  const channelThumbnails = await getChannelThumbnails(uniqueChannelIds);

  const channelValues = uniqueChannelIds.map((youtubeId) => {
    const meta = metas.find((m) => m.channelId === youtubeId)!;
    const thumbnailUrl = channelThumbnails.get(youtubeId);
    if (!thumbnailUrl) throw new Error(`No thumbnail found for channel ${youtubeId}`);
    return { youtubeId, title: meta.channelTitle, thumbnailUrl };
  });

  const insertedChannels = await db
    .insert(channelsTable)
    .values(channelValues)
    .returning({ id: channelsTable.id, youtubeId: channelsTable.youtubeId });

  const channelDbIdByYoutubeId = new Map(
    insertedChannels.map((c) => [c.youtubeId, c.id]),
  );

  let skipped = 0;
  const seededVideos: { id: string; title: string }[] = [];

  for (const meta of metas) {
    const transcript = await fetchEnglishTranscript(
      meta.videoId,
      meta.durationSeconds,
    );

    if (!transcript) {
      skipped++;
      console.warn(`  ⵜ İngilizce transkript yok, atlanıyor: ${meta.title}`);
      continue;
    }

    const [video] = await db
      .insert(videosTable)
      .values({
        channelId: channelDbIdByYoutubeId.get(meta.channelId)!,
        youtubeId: meta.videoId,
        url: meta.url,
        title: meta.title,
        publishedAt: meta.publishedAt,
        durationSeconds: meta.durationSeconds,
        thumbnailUrl: meta.thumbnailUrl,
      })
      .returning({ id: videosTable.id });

    await db.insert(transcriptsTable).values({
      videoId: video.id,
      language: "en",
      content: transcript,
    });

    seededVideos.push({ id: video.id, title: meta.title });
    console.log(`  ✓ ${meta.title}`);
  }

  // Build a program whose ordered sections each point to a seeded video, so the
  // section-based UI/services have real data to work with end-to-end.
  let sectionCount = 0;
  if (seededVideos.length > 0) {
    const firstChannel = insertedChannels[0];
    const programThumbnailUrl = channelThumbnails.get(firstChannel.youtubeId)!;

    const [program] = await db
      .insert(programsTable)
      .values({
        title: "TED ile İngilizce",
        slug: "ted-ile-ingilizce",
        description:
          "TED konuşmalarının transkriptlerinden üretilen çeviri alıştırmaları.",
        channelId: firstChannel.id,
        thumbnailUrl: programThumbnailUrl,
        cefrLevel: "A2",
      })
      .returning({ id: programsTable.id });

    await db.insert(sectionsTable).values(
      seededVideos.map((video, index) => ({
        programId: program.id,
        videoId: video.id,
        title: video.title,
        order: index + 1,
      })),
    );
    sectionCount = seededVideos.length;
  }

  console.log(
    `Done. ${seededVideos.length} video eklendi, ${skipped} atlandı, ${sectionCount} section oluşturuldu.`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});