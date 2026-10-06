import { eq, inArray } from "drizzle-orm";

import { generateQuiz } from "@/ai/tasks/generate-quiz";
import { SUPPORTED_NATIVE_LANGUAGES } from "@/constants/language";
import type { CefrLevel } from "@/constants/learning";
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

// Dev-only seed. It owns exactly the programs listed in PROGRAMS_SEED: re-running
// replaces those programs (and their videos, quizzes and learner answers) and
// never touches any other program or channel already in the database.

const PROGRAMS_SEED: {
  channelHandle: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  referenceUrl: string;
}[] = [
  {
    channelHandle: "@bbclearningenglish",
    title: "Really Easy English",
    slug: "really-easy-english",
    shortDescription:
      "Basic grammar and everyday phrases tailored for absolute beginners. Grasp the fundamentals through short, clear, step-by-step explanations that build real confidence.",
    description:
      "Basic grammar and everyday phrases tailored for absolute beginners in English.\nEasily grasp fundamental speaking rules through short, clear, and step-by-step explanations.\nBuild the solid foundations needed to communicate in English with confidence.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop",
    referenceUrl:
      "https://www.youtube.com/playlist?list=PLcetZ6gSk96_IQnT7zKUjp7GtQeeGDI1a",
  },
];

// Duplicate 6Af6b_wyiwI removed from ted-talks (was listed twice)
const VIDEOS_SEED: {
  youtubeId: string;
  programSlug: string;
  sectionTitle: string;
  cefrLevel: CefrLevel;
}[] = [
  {
    youtubeId: "BFJsSnEEGrI",
    programSlug: "really-easy-english",
    sectionTitle: "Coffee Culture & Phrasal Verbs",
    cefrLevel: "A2",
  },
  {
    youtubeId: "qfQ61oYIbxY",
    programSlug: "really-easy-english",
    sectionTitle: "Moods, Feelings & Reactions",
    cefrLevel: "A2",
  },
  {
    youtubeId: "ChYnYM0txRk",
    programSlug: "really-easy-english",
    sectionTitle: "Talking About Food & Spiciness",
    cefrLevel: "A1",
  },
  {
    youtubeId: "bGxdYW_6rjQ",
    programSlug: "really-easy-english",
    sectionTitle: "Urban Living: Pros & Cons",
    cefrLevel: "A2",
  },
  {
    youtubeId: "W_yFHgHafKM",
    programSlug: "really-easy-english",
    sectionTitle: "Family Tree & Relationships",
    cefrLevel: "A1",
  },
];

// Quizzes are pre-generated per native language, because they are keyed by the
// learner's language pair. Languages without a seeded quiz still fall back to
// on-demand generation in the app.
const QUIZ_TARGET_LANGUAGE = "en";
const QUIZ_NATIVE_LANGUAGES = SUPPORTED_NATIVE_LANGUAGES.filter(
  (language) => language.code !== QUIZ_TARGET_LANGUAGE,
);
const QUIZ_TRANSLATION_COUNT = 3;
const QUIZ_FILL_IN_THE_BLANK_COUNT = 2;
const QUIZ_BATCH_SIZE = 6;

async function removeSeededPrograms() {
  // Cascades to sections, quizzes, questions, answers and progress.
  await db
    .delete(programsTable)
    .where(inArray(programsTable.slug, PROGRAMS_SEED.map((p) => p.slug)));
  // Cascades to transcripts.
  await db
    .delete(videosTable)
    .where(
      inArray(
        videosTable.youtubeId,
        VIDEOS_SEED.map((v) => v.youtubeId),
      ),
    );
}

async function seedQuizzes(sectionId: string, transcript: string) {
  for (let i = 0; i < QUIZ_NATIVE_LANGUAGES.length; i += QUIZ_BATCH_SIZE) {
    const batch = QUIZ_NATIVE_LANGUAGES.slice(i, i + QUIZ_BATCH_SIZE);
    await Promise.all(
      batch.map(async (language) => {
        try {
          const payloads = await generateQuiz({
            transcript,
            nativeLanguage: language.englishName,
            translationCount: QUIZ_TRANSLATION_COUNT,
            fillInTheBlankCount: QUIZ_FILL_IN_THE_BLANK_COUNT,
          });
          await db.transaction(async (tx) => {
            const [quiz] = await tx
              .insert(quizzesTable)
              .values({
                sectionId,
                nativeLanguage: language.code,
                targetLanguage: QUIZ_TARGET_LANGUAGE,
              })
              .returning({ id: quizzesTable.id });
            await tx.insert(questionsTable).values(
              payloads.map((payload, order) => ({
                quizId: quiz.id,
                order,
                type: payload.type,
                payload,
              })),
            );
          });
        } catch (err) {
          console.warn(
            `    ⵜ Quiz failed [${language.code}]:`,
            err instanceof Error ? err.message : err,
          );
        }
      }),
    );
  }
}

async function seed() {
  console.log("Removing previously seeded programs...");
  await removeSeededPrograms();

  console.log(`Fetching metadata for ${VIDEOS_SEED.length} videos...`);
  const metas = await getVideoDetails(VIDEOS_SEED.map((v) => v.youtubeId));
  const metaById = new Map(metas.map((m) => [m.videoId, m]));

  // Channels can be shared with programs that are not seeded here, so an
  // existing one is reused and only a missing one is created.
  const channelDbIdBySlug = new Map<string, string>();
  for (const handle of new Set(PROGRAMS_SEED.map((p) => p.channelHandle))) {
    const [existing] = await db
      .select({ id: channelsTable.id })
      .from(channelsTable)
      .where(eq(channelsTable.youtubeSlug, handle));
    if (existing) {
      channelDbIdBySlug.set(handle, existing.id);
      continue;
    }

    const firstProgram = PROGRAMS_SEED.find((p) => p.channelHandle === handle)!;
    const firstVideo = VIDEOS_SEED.find(
      (v) => v.programSlug === firstProgram.slug,
    );
    const meta = firstVideo && metaById.get(firstVideo.youtubeId);
    if (!meta) throw new Error(`No metadata for channel: ${handle}`);
    const thumbnails = await getChannelThumbnails([meta.channelId]);
    const thumbnailUrl = thumbnails.get(meta.channelId);
    if (!thumbnailUrl) throw new Error(`No thumbnail for channel: ${handle}`);

    const [channel] = await db
      .insert(channelsTable)
      .values({
        youtubeSlug: handle,
        title: meta.channelTitle,
        thumbnailUrl,
      })
      .returning({ id: channelsTable.id });
    channelDbIdBySlug.set(handle, channel.id);
  }

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
        referenceUrl: prog.referenceUrl,
      })),
    )
    .returning({ id: programsTable.id, slug: programsTable.slug });

  const programDbIdBySlug = new Map(
    insertedPrograms.map((p) => [p.slug, p.id]),
  );
  const channelHandleByProgramSlug = new Map(
    PROGRAMS_SEED.map((p) => [p.slug, p.channelHandle]),
  );

  console.log(`  ✓ ${insertedPrograms.length} programs inserted`);
  console.log(
    "Fetching transcripts, inserting videos and generating quizzes...",
  );

  const sectionOrderByProgramSlug = new Map<string, number>();
  let skipped = 0;
  let videoCount = 0;

  for (const {
    youtubeId,
    programSlug,
    sectionTitle,
    cefrLevel,
  } of VIDEOS_SEED) {
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

    const channelDbId = channelDbIdBySlug.get(
      channelHandleByProgramSlug.get(programSlug)!,
    )!;

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
        cefrLevel,
      })
      .returning({ id: videosTable.id });

    await db.insert(transcriptsTable).values({
      videoId: video.id,
      language: "en",
      content: transcript,
    });

    const order = (sectionOrderByProgramSlug.get(programSlug) ?? 0) + 1;
    sectionOrderByProgramSlug.set(programSlug, order);

    const [section] = await db
      .insert(sectionsTable)
      .values({
        programId: programDbIdBySlug.get(programSlug)!,
        videoId: video.id,
        title: sectionTitle,
        order,
      })
      .returning({ id: sectionsTable.id });

    await seedQuizzes(
      section.id,
      transcript.map((line) => line.text).join("\n"),
    );

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
