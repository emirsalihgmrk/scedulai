import { analyzeSentence, generateSentences } from "@/ai/tasks";
import { db } from "@/db";
import { watchedTalks } from "@/db/schema";
import { cli } from "@/lib/cli";
import { discoverTedTalk, fetchTedTalkData, hasTranscript } from "@/lib/ted";

async function simulate(): Promise<void> {
  const startTime = Date.now();

  const manualUrl = process.argv[2];

  let talkData;

  if (manualUrl) {
    cli.title("TED Talk Simulation (Manual URL)");
    cli.info(`Fetching talk from: ${manualUrl}`);
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

  cli.info("Generating 15 practice sentences...");
  const { sentences } = await generateSentences({
    transcript: talkData.transcript,
    nativeLanguage: "Turkish",
  });

  const accuracies: number[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const { native, english } = sentences[i];

    cli.title(`Sentence ${i + 1} / ${sentences.length}`);
    cli.info(native);

    const userTranslation = await cli.prompt("Your English translation:");

    cli.info("Analyzing...");
    const result = await analyzeSentence({
      sentence: native,
      originalSentence: english,
      userTranslation,
      nativeLanguage: "Turkish",
    });

    accuracies.push(result.accuracy);

    cli.detail("Accuracy", `%${result.accuracy}`);
    console.log();
    cli.info(result.analysis);
    cli.list("Original sentence", [english]);
    if (result.alternatives.length > 0) {
      cli.list("Alternatives", result.alternatives);
    }

    if (result.expressions.length > 0) {
      cli.list("Expressions", result.expressions);
    }
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
