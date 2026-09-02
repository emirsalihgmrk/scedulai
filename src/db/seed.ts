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
    title: "Alice in Wonderland",
    slug: "alice-in-wonderland",
    difficulty: "intermediate",
    shortDescription:
      "Follow Alice through a curious world of riddles, wordplay, and surprising encounters. Build listening confidence with vivid storytelling and memorable English expressions.",
    description:
      "Follow Alice as she tumbles into a strange and imaginative world filled with riddles, playful conversations, and unforgettable characters.\nStrengthen your listening comprehension through a classic story with clear narrative context and naturally recurring vocabulary.\nDiscover idioms, descriptive language, and literary expressions while enjoying one of English literature's most beloved adventures.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1642192328313-ee18ab51c84d?w=800&auto=format&fit=crop&q=80",
    referenceUrl:
      "https://www.youtube.com/playlist?list=PLcetZ6gSk96_Kh2b2K2O2uaI14lnp6w4h",
  },
];

// Duplicate 6Af6b_wyiwI removed from ted-talks (was listed twice)
const VIDEOS_SEED: {
  youtubeId: string;
  programSlug: string;
  sectionTitle: string;
}[] = [
  {
    youtubeId: "6Af6b_wyiwI",
    programSlug: "ted-talks",
    sectionTitle: "Global Health & Pandemics",
  },
  {
    youtubeId: "_QdPW8JrYzQ",
    programSlug: "ted-talks",
    sectionTitle: "Internet Humor & Spam Mail",
  },
  {
    youtubeId: "eIho2S0ZahI",
    programSlug: "ted-talks",
    sectionTitle: "Powerful Speaking & Listening",
  },
  {
    youtubeId: "DFjIi2hxxf0",
    programSlug: "ted-talks",
    sectionTitle: "Vocal Arts & Human Sound",
  },
  {
    youtubeId: "36m1o-tM05g",
    programSlug: "tedx-talks",
    sectionTitle: "Philosophy for a Happy Life",
  },
  {
    youtubeId: "LNHBMFCzznE",
    programSlug: "tedx-talks",
    sectionTitle: "Neuroplasticity & Brain Change",
  },
  {
    youtubeId: "5MgBikgcWnY",
    programSlug: "tedx-talks",
    sectionTitle: "Rapid Skill Acquisition (20 Hours)",
  },
  {
    youtubeId: "F4Zu5ZZAG7I",
    programSlug: "tedx-talks",
    sectionTitle: "The Art of Conversation & Mingling",
  },
  {
    youtubeId: "w-HYZv6HzAs",
    programSlug: "tedx-talks",
    sectionTitle: "Building Self-Confidence as a Skill",
  },
  {
    youtubeId: "xKxrkht7CpY",
    programSlug: "teded-talks",
    sectionTitle: "How Solar Energy Works",
  },
  {
    youtubeId: "N5vJSNXPEwA",
    programSlug: "teded-talks",
    sectionTitle: "Logic Puzzles & Problem Solving",
  },
  {
    youtubeId: "7SWvDHvWXok",
    programSlug: "teded-talks",
    sectionTitle: "Unsolved Mysteries of Science",
  },
  {
    youtubeId: "z-IR48Mb3W0",
    programSlug: "teded-talks",
    sectionTitle: "Understanding Mental Health",
  },
  {
    youtubeId: "Uj3_KqkI9Zo",
    programSlug: "teded-talks",
    sectionTitle: "Infinity & Mathematical Paradoxes",
  },
  {
    youtubeId: "xwseWCSXD3Y",
    programSlug: "6-minutes-english",
    sectionTitle: "Describing Smells & Senses",
  },
  {
    youtubeId: "SC_opiKLohg",
    programSlug: "6-minutes-english",
    sectionTitle: "Autonomous Tech & Driving",
  },
  {
    youtubeId: "D9jZMLm72a8",
    programSlug: "6-minutes-english",
    sectionTitle: "Household Chores & Equality",
  },
  {
    youtubeId: "sv9DItmJvlI",
    programSlug: "6-minutes-english",
    sectionTitle: "Climate Science & Predictions",
  },
  {
    youtubeId: "0XccoTXPu_c",
    programSlug: "6-minutes-english",
    sectionTitle: "Doping & Sports Ethics",
  },
  {
    youtubeId: "zl0dwwKhmuM",
    programSlug: "learning-english-from-the-news",
    sectionTitle: "AI Security & Cyber Threats",
  },
  {
    youtubeId: "8ip3fMwdhx0",
    programSlug: "learning-english-from-the-news",
    sectionTitle: "Social Media Regulation & Meta",
  },
  {
    youtubeId: "K8Dwy0u5pp8",
    programSlug: "learning-english-from-the-news",
    sectionTitle: "Astronomy: The Solar Eclipse",
  },
  {
    youtubeId: "MlHJCNLa__k",
    programSlug: "learning-english-from-the-news",
    sectionTitle: "Border Crises & Global Migration",
  },
  {
    youtubeId: "zXz72SmVg2E",
    programSlug: "learning-english-from-the-news",
    sectionTitle: "Gaming Industry & Digital Media",
  },
  {
    youtubeId: "BFJsSnEEGrI",
    programSlug: "really-easy-english",
    sectionTitle: "Coffee Culture & Phrasal Verbs",
  },
  {
    youtubeId: "qfQ61oYIbxY",
    programSlug: "really-easy-english",
    sectionTitle: "Moods, Feelings & Reactions",
  },
  {
    youtubeId: "ChYnYM0txRk",
    programSlug: "really-easy-english",
    sectionTitle: "Talking About Food & Spiciness",
  },
  {
    youtubeId: "bGxdYW_6rjQ",
    programSlug: "really-easy-english",
    sectionTitle: "Urban Living: Pros & Cons",
  },
  {
    youtubeId: "W_yFHgHafKM",
    programSlug: "really-easy-english",
    sectionTitle: "Family Tree & Relationships",
  },
  {
    youtubeId: "bwYEdYaXExw",
    programSlug: "the-english-we-speak",
    sectionTitle: "Body Part Idioms & Expressions",
  },
  {
    youtubeId: "S2Dyi7qf4k4",
    programSlug: "the-english-we-speak",
    sectionTitle: "Essential Daily Phrasal Verbs",
  },
  {
    youtubeId: "HblUS4Ha1io",
    programSlug: "the-english-we-speak",
    sectionTitle: "Two-Word Expressions: Part 1",
  },
  {
    youtubeId: "8D5Ag-TxErg",
    programSlug: "the-english-we-speak",
    sectionTitle: "Two-Word Expressions: Part 2",
  },
  {
    youtubeId: "WHCsOQvDkeQ",
    programSlug: "the-english-we-speak",
    sectionTitle: "Core Everyday Idiomatic English",
  },
  {
    youtubeId: "k188_aGDklQ",
    programSlug: "learning-english-for-work",
    sectionTitle: "Professional Email Etiquette",
  },
  {
    youtubeId: "m2UD0-IC7iY",
    programSlug: "learning-english-for-work",
    sectionTitle: "Running Effective Meetings",
  },
  {
    youtubeId: "7sDcsE_HsDw",
    programSlug: "learning-english-for-work",
    sectionTitle: "Following Up & Chasing People",
  },
  {
    youtubeId: "umVkjRE73sE",
    programSlug: "learning-english-for-work",
    sectionTitle: "Phone Calls & Quick Messaging",
  },
  {
    youtubeId: "o295dPuPNGo",
    programSlug: "learning-english-for-work",
    sectionTitle: "Managing & Resolving Mistakes",
  },
  //
  {
    youtubeId: "yZxlx7FegBM",
    programSlug: "alice-in-wonderland",
    sectionTitle: "Entering Wonderland & Fantasy",
  },
  {
    youtubeId: "_fpLGvoEiEg",
    programSlug: "alice-in-wonderland",
    sectionTitle: "Emotions, Crying & Body Size",
  },
  {
    youtubeId: "svI_6zz9yPk",
    programSlug: "alice-in-wonderland",
    sectionTitle: "Absurd Logic & Playful Riddles",
  },
  {
    youtubeId: "_H-zhw0YJh4",
    programSlug: "alice-in-wonderland",
    sectionTitle: "Curiosity, Rooms & Transformations",
  },
  {
    youtubeId: "h9-23pAqouo",
    programSlug: "alice-in-wonderland",
    sectionTitle: "Identity, Wisdom & Dialogue",
  },
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
    if (!meta)
      throw new Error(`No metadata for video: ${firstVideo.youtubeId}`);
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
        if (!thumbnailUrl)
          throw new Error(`No thumbnail for channel: ${handle}`);
        return {
          youtubeSlug: handle,
          title: channelTitleByHandle.get(handle)!,
          thumbnailUrl,
        };
      }),
    )
    .returning({
      id: channelsTable.id,
      youtubeSlug: channelsTable.youtubeSlug,
    });

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

  for (const { youtubeId, programSlug, sectionTitle } of VIDEOS_SEED) {
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
      title: sectionTitle,
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
