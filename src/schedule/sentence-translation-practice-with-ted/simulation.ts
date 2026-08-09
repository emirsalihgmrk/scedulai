import { analyzeSentence, generateSentences } from "@/ai/tasks";
import { db } from "@/db";
import { watchedTalks } from "@/db/schema";
import { cli } from "@/lib/cli";
import { discoverTedTalk, fetchTedTalkData, hasTranscript } from "@/lib/ted";

async function simulate(): Promise<void> {
  const startTime = Date.now();

  const args = process.argv.slice(2);
  const flags = Object.fromEntries(
    args
      .filter((a) => a.startsWith("--"))
      .map((a) => a.slice(2).split("=") as [string, string]),
  );
  const manualUrl = args.find((a) => !a.startsWith("--"));

  const cefrFlag = flags["level"] ?? process.env.npm_config_level ?? "B1";
  const cefrLevel = (
    ["A1", "A2", "B1", "B2", "C1", "C2"].includes(cefrFlag.toUpperCase())
      ? cefrFlag.toUpperCase()
      : "B1"
  ) as "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

  const countRaw = flags["count"] ?? process.env.npm_config_count ?? "15";
  const countArg = parseInt(countRaw, 10);
  const count = isNaN(countArg) || countArg < 1 ? 15 : countArg;

  let talkData;

  if (manualUrl) {
    cli.title("TED Talk Simulation (Manual URL)");
    cli.info(`Fetching talk from: ${manualUrl}`);
    cli.info(`Level: ${cefrLevel} | Sentences: ${count}`);
    talkData = await fetchTedTalkData(manualUrl);
    if (!hasTranscript(talkData)) {
      cli.error("The provided talk has no transcript. Exiting.");
      process.exit(1);
    }
  } else {
    cli.title("TED Talk Simulation");
    cli.info("Discovering a new TED talk from the database...");

    const watched = await db.select().from(watchedTalks);
    const watchedUrls = watched.map((t) => t.url);

    talkData = await discoverTedTalk(watchedUrls);
    if (!talkData) {
      cli.error("Could not discover a new TED talk. Exiting.");
      process.exit(1);
    }

    await db.insert(watchedTalks).values({
      url: talkData.url,
      title: talkData.title,
    });
  }

  cli.detail("Title", talkData.title);
  cli.detail("Speaker", talkData.speaker);
  cli.detail(
    "Duration",
    `${Math.round(talkData.durationSeconds / 60)} minutes`,
  );

  cli.info(`Generating ${count} practice sentences...`);
  const { sentences } = await generateSentences({
    transcript: talkData.transcript,
    nativeLanguage: "Turkish",
    cefrLevel,
    count,
  });

  const accuracies: number[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const { native, english, cefrLevel: sentenceLevel } = sentences[i];

    cli.title(`Sentence ${i + 1} / ${sentences.length} [${sentenceLevel}]`);
    cli.info(native);

    const userTranslation = await cli.prompt("Your English translation:");

    if (!userTranslation.trim()) {
      cli.detail("Accuracy", "%0");
      cli.info("No translation entered — skipped.");
      console.log();
      accuracies.push(0);
      continue;
    }

    cli.info("Analyzing...");
    const result = await analyzeSentence({
      sentence: native,
      originalSentence: english,
      userTranslation,
      nativeLanguage: "Turkish",
    });

    accuracies.push(result.accuracy);

    cli.info(result.analysis);
    if (result.mistakes.length > 0) {
      cli.list("Mistakes", result.mistakes);
    }
    cli.list("Original sentence", [english]);
    if (result.alternatives.length > 0) {
      cli.list("Alternatives", result.alternatives);
    }

    if (result.expressions.length > 0) {
      cli.list("Expressions", result.expressions);
    }
    console.log();
    cli.detail("Accuracy", `%${result.accuracy}`);
  }

  const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

  cli.title("Session Summary");
  cli.detail("Average Accuracy", `%${avg.toFixed(1)}`);
  cli.detail("Highest", `%${Math.max(...accuracies)}`);
  cli.detail("Lowest", `%${Math.min(...accuracies)}`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  cli.success(`Simulation completed in ${elapsed}s.`);
  process.exit(0);
}

simulate().catch((err) => {
  cli.error(`Simulation failed: ${err.message}`);
  process.exit(1);
});
