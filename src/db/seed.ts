import { db } from "@/db";
import {
  channelsTable,
  questionsTable,
  quizzesTable,
  transcriptsTable,
  usersTable,
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
  await db.delete(transcriptsTable);
  await db.delete(videosTable);
  await db.delete(channelsTable);
  await db.delete(usersTable);

  await db.insert(usersTable).values([
    {
      fullName: "Ada Kaya",
      email: "ada@example.com",
      plan: "premium",
      nativeLanguage: "tr",
      targetLanguage: "en",
    },
    {
      fullName: "Yeni Kullanıcı",
      email: "newcomer@example.com",
      plan: "free",
      nativeLanguage: "tr",
      targetLanguage: "en",
    },
  ]);

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

  let inserted = 0;
  let skipped = 0;

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

    inserted++;
    console.log(`  ✓ ${meta.title}`);
  }

  console.log(`Done. ${inserted} video eklendi, ${skipped} atlandı.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});