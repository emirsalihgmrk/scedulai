//DEMO — Demo öncesi "ısıtma" scripti: tüm bölümler × tüm ana diller için quiz üretir.
// Quizler kullanıcıya değil (sectionId, nativeLanguage, targetLanguage)'e bağlı olduğundan
// auth/servis katmanına ihtiyaç yok; doğrudan DAL + AI task kullanır. Gerçek auth'a
// dönerken bu dosya + package.json'daki "db:warm-quizzes" komutu silinebilir.
//
// Çalıştırma:
//   npm run db:warm-quizzes
//   npm run db:warm-quizzes -- --langs=tr,de --limit=5 --concurrency=4
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { quizzesTable, transcriptsTable } from "@/db/schema";
import { createQuestions, createQuiz } from "@/dal/quiz/mutations";
import { generateSentences } from "@/ai/tasks/generate-sentences";
import {
  getNativeLanguageEnglishName,
  SUPPORTED_NATIVE_LANGUAGE_CODES,
  type SupportedNativeLanguageCode,
} from "@/constants/language";

const TARGET_LANGUAGE = "en" as const;
const QUESTION_COUNT = 5;
const DEFAULT_CONCURRENCY = 4;

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (name: string) =>
    args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

  const langsArg = get("langs");
  const langs = langsArg
    ? (langsArg
        .split(",")
        .filter((c) =>
          (SUPPORTED_NATIVE_LANGUAGE_CODES as readonly string[]).includes(c),
        ) as SupportedNativeLanguageCode[])
    : [...SUPPORTED_NATIVE_LANGUAGE_CODES];

  const limitArg = get("limit");
  const concurrencyArg = get("concurrency");

  return {
    langs,
    limit: limitArg ? Number(limitArg) : undefined,
    concurrency: concurrencyArg ? Number(concurrencyArg) : DEFAULT_CONCURRENCY,
  };
}

// Sabit boyutlu eşzamanlılık havuzu — OpenRouter'ı ve DB'yi boğmamak için.
async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  let cursor = 0;
  const runners = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length)) },
    async () => {
      while (cursor < items.length) {
        await worker(items[cursor++]);
      }
    },
  );
  await Promise.all(runners);
}

type Job = {
  sectionId: string;
  videoId: string;
  title: string;
  nativeLanguage: SupportedNativeLanguageCode;
};

async function main() {
  const { langs, limit, concurrency } = parseArgs();

  const sections = await db.query.sectionsTable.findMany({
    columns: { id: true, title: true },
    with: { video: { columns: { id: true } } },
    orderBy: (s, { asc }) => asc(s.order),
  });

  let usableSections = sections.filter((s) => s.video?.id);
  if (limit) usableSections = usableSections.slice(0, limit);

  console.log(
    `Bölüm: ${usableSections.length} • Dil: ${langs.length} • Hedef: ${TARGET_LANGUAGE} • Eşzamanlılık: ${concurrency}`,
  );

  // Transkript cache (videoId -> birleştirilmiş metin) — diller arası tekrar çekmez.
  const transcriptCache = new Map<string, string | null>();
  async function getTranscriptText(videoId: string): Promise<string | null> {
    const cached = transcriptCache.get(videoId);
    if (cached !== undefined) return cached;

    const row = await db.query.transcriptsTable.findFirst({
      where: and(
        eq(transcriptsTable.videoId, videoId),
        eq(transcriptsTable.language, TARGET_LANGUAGE),
      ),
      columns: { content: true },
    });
    const text = row ? row.content.map((line) => line.text).join("\n") : null;
    transcriptCache.set(videoId, text);
    return text;
  }

  const jobs: Job[] = [];
  for (const section of usableSections) {
    for (const nativeLanguage of langs) {
      jobs.push({
        sectionId: section.id,
        videoId: section.video!.id,
        title: section.title,
        nativeLanguage,
      });
    }
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let done = 0;

  await runPool(jobs, concurrency, async (job) => {
    const tag = `[${job.nativeLanguage}] ${job.title}`;
    try {
      const existing = await db.query.quizzesTable.findFirst({
        where: and(
          eq(quizzesTable.sectionId, job.sectionId),
          eq(quizzesTable.nativeLanguage, job.nativeLanguage),
          eq(quizzesTable.targetLanguage, TARGET_LANGUAGE),
        ),
        columns: { id: true },
      });
      if (existing) {
        skipped++;
        return;
      }

      const transcript = await getTranscriptText(job.videoId);
      if (!transcript) {
        skipped++;
        return;
      }

      const { sentences } = await generateSentences({
        transcript,
        nativeLanguage: getNativeLanguageEnglishName(job.nativeLanguage),
        count: QUESTION_COUNT,
      });

      await db.transaction(async (tx) => {
        const quiz = await createQuiz(
          job.sectionId,
          {
            nativeLanguage: job.nativeLanguage,
            targetLanguage: TARGET_LANGUAGE,
          },
          tx,
        );
        if (!quiz) return; // yarış: bu arada oluşmuş
        await createQuestions(
          quiz.id,
          sentences.map((sentence, index) => ({
            quizId: quiz.id,
            order: index,
            type: "translation" as const,
            payload: {
              type: "translation" as const,
              sourceSentence: sentence.native,
              expectedTranslation: sentence.english,
            },
          })),
          tx,
        );
      });
      generated++;
    } catch (err) {
      failed++;
      console.error(`✗ ${tag}:`, err instanceof Error ? err.message : err);
    } finally {
      done++;
      if (done % 10 === 0 || done === jobs.length) {
        console.log(
          `İlerleme ${done}/${jobs.length} • üretildi ${generated} • atlandı ${skipped} • hata ${failed}`,
        );
      }
    }
  });

  console.log(
    `\nBitti. Üretildi: ${generated} • Atlandı: ${skipped} • Hata: ${failed}`,
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Warm-up failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});