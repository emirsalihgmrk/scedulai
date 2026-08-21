import { sql } from "drizzle-orm";
import { db } from "@/db";

async function reset() {
  await db.execute(sql`
    DROP TABLE IF EXISTS account CASCADE;
    DROP TABLE IF EXISTS channels CASCADE;
    DROP TABLE IF EXISTS programs CASCADE;
    DROP TABLE IF EXISTS questions CASCADE;
    DROP TABLE IF EXISTS quizzes CASCADE;
    DROP TABLE IF EXISTS sections CASCADE;
    DROP TABLE IF EXISTS session CASCADE;
    DROP TABLE IF EXISTS transcripts CASCADE;
    DROP TABLE IF EXISTS user CASCADE;
    DROP TABLE IF EXISTS verification CASCADE;
    DROP TABLE IF EXISTS videos CASCADE;
  `);
  console.log("Database reset complete.");
  process.exit(0);
}

reset().catch((err) => {
  console.error("Reset failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
