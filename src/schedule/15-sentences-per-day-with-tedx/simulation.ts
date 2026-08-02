import { generatePracticeSentences } from "@/ai/tasks";
import { db } from "@/db";
import { watchedTalks } from "@/db/schema";
import { cli } from "@/lib/cli";
import {
  TedTalkData,
  discoverTedTalk,
  fetchTedTalkData,
  hasTranscript,
} from "@/lib/ted";

async function simulate() {
  const manualUrl = process.argv[2];

  cli.title("15 Sentences a Day");
  const startTime = Date.now();
  cli.info("Simulation started.");

  let tedTalkData: TedTalkData;

  try {
    if (manualUrl) {
      cli.detail("URL", manualUrl);
      cli.info("Fetching TED talk details and transcript...");

      const data = await fetchTedTalkData(manualUrl);
      if (!data) {
        throw new Error(
          "Unable to retrieve the TED talk details or transcript. Please check the URL.",
        );
      }
      if (!hasTranscript(data)) {
        throw new Error("The transcript is empty.");
      }

      tedTalkData = data;
      cli.detail("Title", `"${tedTalkData.title}"`);
      cli.detail("Speaker", `"${tedTalkData.speaker}"`);
      cli.success("Transcript fetched.");
      cli.detail("Characters", tedTalkData.transcript.length);
    } else {
      cli.info("Discovering a TED talk...");

      const watched = await db
        .select({ url: watchedTalks.url })
        .from(watchedTalks);
      const excludeUrls = watched.map((r) => r.url);

      if (excludeUrls.length > 0) {
        cli.detail(
          "Filtering out",
          `${excludeUrls.length} already-watched talk(s)`,
        );
      }

      const discovered = await discoverTedTalk(excludeUrls);
      if (!discovered) {
        throw new Error(
          "Could not find a suitable TED talk with a transcript. Try again.",
        );
      }

      await db
        .insert(watchedTalks)
        .values({ url: discovered.url, title: discovered.title })
        .onConflictDoNothing();

      tedTalkData = discovered;
      cli.success("Talk discovered.");
      cli.detail("URL", tedTalkData.url);
      cli.detail("Title", `"${tedTalkData.title}"`);
      cli.detail("Speaker", `"${tedTalkData.speaker}"`);
    }

    cli.info("Generating 15 practice sentences...");

    const result = await generatePracticeSentences({
      transcript: tedTalkData.transcript,
      nativeLanguage: "Turkish",
    });

    cli.list("Generated sentences", result.sentences);
    const durationInSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    cli.success(`Simulation complete (${durationInSeconds}s).`);
  } catch (error) {
    cli.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

simulate();
