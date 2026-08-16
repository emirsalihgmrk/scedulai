import { db } from "@/db";
import {
  questionsTable,
  quizzesTable,
  transcriptsTable,
  usersTable,
  videosTable,
  watchedVideosTable,
} from "@/db/schema";

// ─── Seed ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Clearing database...");
  await db.delete(questionsTable);
  await db.delete(quizzesTable);
  await db.delete(watchedVideosTable);
  await db.delete(transcriptsTable);
  await db.delete(videosTable);
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

  // TODO: Seed videos + transcripts via the YouTube Data API.

  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});