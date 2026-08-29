import { Difficulty } from "@/constants/difficulty";
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
  getVideoDetails,
} from "@/lib/youtube";

const PROGRAMS_SEED: {
  channelHandle: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  referenceUrl: string;
}[] = [
  {
    channelHandle: "@TED",
    title: "TED Talks",
    slug: "ted-talks",
    difficulty: "intermediate",
    shortDescription:
      "Inspiring talks from the world's leading thinkers, scientists, and leaders. Sharpen your intermediate listening with diverse accents and rich, real-world vocabulary.",
    description:
      "Discover inspiring talks from the world's leading thinkers, scientists, and leaders.\nImprove your intermediate listening skills with diverse accents and rich vocabulary.\nPractice English through talks on global ideas, technology, psychology, and culture.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80&auto=format&fit=crop",
    referenceUrl: "https://www.youtube.com/@TED",
  },
  {
    channelHandle: "@TEDx",
    title: "TEDx Talks",
    slug: "tedx-talks",
    difficulty: "advanced",
    shortDescription:
      "Independent, authentic stories from local communities around the world. Push past the language barrier with advanced terms, abstract ideas, and fluent delivery.",
    description:
      "Listen to independent, authentic, and eye-opening stories from local communities.\nOvercome the language barrier with advanced academic terms, abstract concepts, and fluent delivery.\nStrengthen your comprehension and discussion skills by following innovative projects in various fields.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80&auto=format&fit=crop",
    referenceUrl: "https://www.youtube.com/@TEDx",
  },
  {
    channelHandle: "@TEDEd",
    title: "TED-Ed Talks",
    slug: "teded-talks",
    difficulty: "intermediate",
    shortDescription:
      "Explore science and history through stunning animations and engaging stories. Reinforce your comprehension with clear, well-structured, and easy-to-follow narration.",
    description:
      "Explore science and history accompanied by stunning animations and engaging stories.\nReinforce your listening comprehension with clear, understandable, and well-structured narratives.\nEnrich your vocabulary through intriguing philosophical and scientific questions.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80&auto=format&fit=crop",
    referenceUrl: "https://www.youtube.com/@TEDEd",
  },
  {
    channelHandle: "@bbclearningenglish",
    title: "6 Minute English",
    slug: "6-minutes-english",
    difficulty: "beginner",
    shortDescription:
      "Everyday topics explored through entertaining 6-minute conversations. Learn the key vocabulary in context and get used to the natural British accent and rhythm.",
    description:
      "Explore current everyday topics through entertaining 6-minute conversations.\nPractically learn the key vocabulary and example usages presented in each episode.\nEasily get accustomed to the British accent and rhythm thanks to the natural dialogues of BBC presenters.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop",
    referenceUrl:
      "https://www.youtube.com/playlist?list=PLcetZ6gSk96-FECmH9l7Vlx5VDigvgZpt",
  },
  {
    channelHandle: "@bbclearningenglish",
    title: "Learning English From The News",
    slug: "learning-english-from-the-news",
    difficulty: "beginner",
    shortDescription:
      "Build your skills by following the biggest headlines on the world agenda. Learn the vocabulary and phrases most common in media, while boosting your general knowledge.",
    description:
      "Improve your language skills by following the hottest news headlines on the world agenda.\nLearn the vocabulary patterns and phrases frequently used in media and news language.\nBoost both your general knowledge and reading-listening skills through real-world events.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80&auto=format&fit=crop",
    referenceUrl:
      "https://www.youtube.com/playlist?list=PLcetZ6gSk96-8vlsfui2jrM0CAJ4MfrMT",
  },
  {
    channelHandle: "@bbclearningenglish",
    title: "Really Easy English",
    slug: "really-easy-english",
    difficulty: "beginner",
    shortDescription:
      "Basic grammar and everyday phrases tailored for absolute beginners. Grasp the fundamentals through short, clear, step-by-step explanations that build real confidence.",
    description:
      "Basic grammar and everyday phrases tailored for absolute beginners in English.\nEasily grasp fundamental speaking rules through short, clear, and step-by-step explanations.\nBuild the solid foundations needed to communicate in English with confidence.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop",
    referenceUrl:
      "https://www.youtube.com/playlist?list=PLcetZ6gSk96_IQnT7zKUjp7GtQeeGDI1a",
  },
  {
    channelHandle: "@bbclearningenglish",
    title: "The English We Speak",
    slug: "the-english-we-speak",
    difficulty: "beginner",
    shortDescription:
      "Discover the idioms and slang native speakers use in daily life. Pick up the real, street-level English and popular expressions you won't find in textbooks.",
    description:
      "Discover the idioms and slang phrases frequently used by native English speakers in daily life.\nLearn the real street English and popular expressions not found in textbooks.\nGain a more natural and fluent expression in spoken language with short and fun dialogues.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80&auto=format&fit=crop",
    referenceUrl:
      "https://www.youtube.com/playlist?list=PLcetZ6gSk9692J5Mq2pY4siPVbMCu4v6c",
  },
  {
    channelHandle: "@bbclearningenglish",
    title: "Learning English For Work",
    slug: "learning-english-for-work",
    difficulty: "beginner",
    shortDescription:
      "Practical English for the business world, interviews, and professional emails. Master phrases for running meetings, giving presentations, and writing with confidence.",
    description:
      "Practical English you will need in the business world, job interviews, and professional correspondence.\nMaster specific phrases for scenarios like managing meetings, writing emails, and giving presentations.\nGain the ability to express yourself professionally in a global business environment.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop",
    referenceUrl:
      "https://www.youtube.com/playlist?list=PLcetZ6gSk96-PF8EvW5280NI79fUWilWD",
  },
  {
    channelHandle: "@bbclearningenglish",
    title: "6 Minute Vocabulary",
    slug: "6-minutes-vocabulary",
    difficulty: "beginner",
    shortDescription:
      "Expand your vocabulary and learn to use words in the right context. Grasp prefixes, suffixes, synonyms, and antonyms with fast, effective 6-minute lessons.",
    description:
      "Content designed to expand your vocabulary and help you use words in the correct contexts.\nGrasp the logic of language structures such as prefixes, suffixes, synonyms, and antonyms.\nEnrich your vocabulary step-by-step with fast and effective 6-minute lessons.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80&auto=format&fit=crop",
    referenceUrl:
      "https://www.youtube.com/playlist?list=PLcetZ6gSk96-GbYhcN0KkFtIL8LJPOG5x",
  },
];

// Duplicate 6Af6b_wyiwI removed from ted-talks (was listed twice)
const VIDEOS_SEED: { youtubeId: string; programSlug: string }[] = [
  { youtubeId: "6Af6b_wyiwI", programSlug: "ted-talks" },
  { youtubeId: "_QdPW8JrYzQ", programSlug: "ted-talks" },
  { youtubeId: "eIho2S0ZahI", programSlug: "ted-talks" },
  { youtubeId: "DFjIi2hxxf0", programSlug: "ted-talks" },
  { youtubeId: "36m1o-tM05g", programSlug: "tedx-talks" },
  { youtubeId: "LNHBMFCzznE", programSlug: "tedx-talks" },
  { youtubeId: "5MgBikgcWnY", programSlug: "tedx-talks" },
  { youtubeId: "F4Zu5ZZAG7I", programSlug: "tedx-talks" },
  { youtubeId: "w-HYZv6HzAs", programSlug: "tedx-talks" },
  { youtubeId: "xKxrkht7CpY", programSlug: "teded-talks" },
  { youtubeId: "N5vJSNXPEwA", programSlug: "teded-talks" },
  { youtubeId: "7SWvDHvWXok", programSlug: "teded-talks" },
  { youtubeId: "z-IR48Mb3W0", programSlug: "teded-talks" },
  { youtubeId: "Uj3_KqkI9Zo", programSlug: "teded-talks" },
  { youtubeId: "xwseWCSXD3Y", programSlug: "6-minutes-english" },
  { youtubeId: "SC_opiKLohg", programSlug: "6-minutes-english" },
  { youtubeId: "D9jZMLm72a8", programSlug: "6-minutes-english" },
  { youtubeId: "sv9DItmJvlI", programSlug: "6-minutes-english" },
  { youtubeId: "0XccoTXPu_c", programSlug: "6-minutes-english" },
  { youtubeId: "zl0dwwKhmuM", programSlug: "learning-english-from-the-news" },
  { youtubeId: "8ip3fMwdhx0", programSlug: "learning-english-from-the-news" },
  { youtubeId: "K8Dwy0u5pp8", programSlug: "learning-english-from-the-news" },
  { youtubeId: "MlHJCNLa__k", programSlug: "learning-english-from-the-news" },
  { youtubeId: "zXz72SmVg2E", programSlug: "learning-english-from-the-news" },
  { youtubeId: "BFJsSnEEGrI", programSlug: "really-easy-english" },
  { youtubeId: "qfQ61oYIbxY", programSlug: "really-easy-english" },
  { youtubeId: "ChYnYM0txRk", programSlug: "really-easy-english" },
  { youtubeId: "bGxdYW_6rjQ", programSlug: "really-easy-english" },
  { youtubeId: "W_yFHgHafKM", programSlug: "really-easy-english" },
  { youtubeId: "bwYEdYaXExw", programSlug: "the-english-we-speak" },
  { youtubeId: "S2Dyi7qf4k4", programSlug: "the-english-we-speak" },
  { youtubeId: "HblUS4Ha1io", programSlug: "the-english-we-speak" },
  { youtubeId: "8D5Ag-TxErg", programSlug: "the-english-we-speak" },
  { youtubeId: "WHCsOQvDkeQ", programSlug: "the-english-we-speak" },
  { youtubeId: "k188_aGDklQ", programSlug: "learning-english-for-work" },
  { youtubeId: "m2UD0-IC7iY", programSlug: "learning-english-for-work" },
  { youtubeId: "7sDcsE_HsDw", programSlug: "learning-english-for-work" },
  { youtubeId: "umVkjRE73sE", programSlug: "learning-english-for-work" },
  { youtubeId: "o295dPuPNGo", programSlug: "learning-english-for-work" },
  { youtubeId: "j2YsroEPH5M", programSlug: "6-minutes-vocabulary" },
  { youtubeId: "bdczLkc4Dns", programSlug: "6-minutes-vocabulary" },
  { youtubeId: "c49E-dLNkkE", programSlug: "6-minutes-vocabulary" },
  { youtubeId: "DsWM3eJW9IM", programSlug: "6-minutes-vocabulary" },
  { youtubeId: "Pu_3OgQxe2s", programSlug: "6-minutes-vocabulary" },
];

async function seed() {
  console.log("Clearing database...");
  await db.delete(questionsTable);
  await db.delete(quizzesTable);
  await db.delete(sectionsTable);
  await db.delete(transcriptsTable);
  await db.delete(videosTable);
  await db.delete(programsTable);
  await db.delete(channelsTable);

  console.log(`Fetching metadata for ${VIDEOS_SEED.length} videos...`);
  const allVideoYoutubeIds = VIDEOS_SEED.map((v) => v.youtubeId);
  const metas = await getVideoDetails(allVideoYoutubeIds);
  const metaById = new Map(metas.map((m) => [m.videoId, m]));

  // Derive real YouTube channel IDs from video metadata (only needed for thumbnail fetching)
  const handleToChannelYoutubeId = new Map<string, string>();
  const channelTitleByHandle = new Map<string, string>();
  for (const prog of PROGRAMS_SEED) {
    if (handleToChannelYoutubeId.has(prog.channelHandle)) continue;
    const firstVideo = VIDEOS_SEED.find((v) => v.programSlug === prog.slug);
    if (!firstVideo) throw new Error(`No videos for program: ${prog.slug}`);
    const meta = metaById.get(firstVideo.youtubeId);
    if (!meta) throw new Error(`No metadata for video: ${firstVideo.youtubeId}`);
    handleToChannelYoutubeId.set(prog.channelHandle, meta.channelId);
    channelTitleByHandle.set(prog.channelHandle, meta.channelTitle);
  }

  const channelThumbnails = await getChannelThumbnails([
    ...new Set(handleToChannelYoutubeId.values()),
  ]);

  const uniqueHandles = [...new Set(PROGRAMS_SEED.map((p) => p.channelHandle))];

  const insertedChannels = await db
    .insert(channelsTable)
    .values(
      uniqueHandles.map((handle) => {
        const channelYoutubeId = handleToChannelYoutubeId.get(handle)!;
        const thumbnailUrl = channelThumbnails.get(channelYoutubeId);
        if (!thumbnailUrl) throw new Error(`No thumbnail for channel: ${handle}`);
        return {
          youtubeSlug: handle,
          title: channelTitleByHandle.get(handle)!,
          thumbnailUrl,
        };
      }),
    )
    .returning({ id: channelsTable.id, youtubeSlug: channelsTable.youtubeSlug });

  const channelDbIdBySlug = new Map(
    insertedChannels.map((c) => [c.youtubeSlug, c.id]),
  );

  console.log(`  ✓ ${insertedChannels.length} channels inserted`);

  const insertedPrograms = await db
    .insert(programsTable)
    .values(
      PROGRAMS_SEED.map((prog) => ({
        title: prog.title,
        slug: prog.slug,
        description: prog.description,
        shortDescription: prog.shortDescription,
        channelId: channelDbIdBySlug.get(prog.channelHandle)!,
        thumbnailUrl: prog.thumbnailUrl,
        difficulty: prog.difficulty,
        referenceUrl: prog.referenceUrl,
      })),
    )
    .returning({ id: programsTable.id, slug: programsTable.slug });

  const programDbIdBySlug = new Map(
    insertedPrograms.map((p) => [p.slug, p.id]),
  );

  // Build programSlug → channelHandle for video insertion
  const channelHandleByProgramSlug = new Map(
    PROGRAMS_SEED.map((p) => [p.slug, p.channelHandle]),
  );

  console.log(`  ✓ ${insertedPrograms.length} programs inserted`);
  console.log("Fetching transcripts and inserting videos...");

  const sectionOrderByProgramSlug = new Map<string, number>();
  let skipped = 0;
  let videoCount = 0;

  for (const { youtubeId, programSlug } of VIDEOS_SEED) {
    const meta = metaById.get(youtubeId);
    if (!meta) {
      console.warn(`  ⵜ No metadata, skipping: ${youtubeId}`);
      skipped++;
      continue;
    }

    const transcript = await fetchEnglishTranscript(
      meta.videoId,
      meta.durationSeconds,
    );
    if (!transcript) {
      console.warn(`  ⵜ No English transcript, skipping: ${meta.title}`);
      skipped++;
      continue;
    }

    const channelHandle = channelHandleByProgramSlug.get(programSlug)!;
    const channelDbId = channelDbIdBySlug.get(channelHandle)!;

    const [video] = await db
      .insert(videosTable)
      .values({
        channelId: channelDbId,
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

    const order = (sectionOrderByProgramSlug.get(programSlug) ?? 0) + 1;
    sectionOrderByProgramSlug.set(programSlug, order);

    await db.insert(sectionsTable).values({
      programId: programDbIdBySlug.get(programSlug)!,
      videoId: video.id,
      title: meta.title,
      order,
    });

    console.log(`  ✓ [${programSlug}] ${meta.title}`);
    videoCount++;
  }

  console.log(`Done. ${videoCount} video inserted, ${skipped} skipped.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
