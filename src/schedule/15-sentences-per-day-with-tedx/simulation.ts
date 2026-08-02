import { reviewTranscript } from "@/ai/tasks";
import { cli } from "@/lib/cli";
import { fetchTedTalkData } from "@/lib/ted";

async function simulate() {
  const defaultUrl =
    "https://www.ted.com/talks/lila_landowski_brain_hack_6_secrets_to_learning_faster_backed_by_neuroscience";
  const url = process.argv[2] || defaultUrl;

  cli.title("15 Sentences a Day");

  if (!process.argv[2]) {
    cli.warning("No TED.com URL provided; using the default TEDx talk.");
    cli.detail("URL", defaultUrl);
    cli.info("To use a specific talk: npm run simulate <ted-url>");
  }

  const startTime = Date.now();
  cli.info("Simulation started.");

  try {
    cli.info("Fetching TED talk details and transcript...");
    const tedTalkData = await fetchTedTalkData(url);

    if (!tedTalkData) {
      throw new Error(
        "Unable to retrieve the TED talk details or transcript. Please check the URL.",
      );
    }

    cli.detail("Title", `"${tedTalkData.title}"`);
    cli.detail("Speaker", `"${tedTalkData.speaker}"`);

    const { transcript } = tedTalkData;
    if (!transcript) {
      throw new Error("The transcript is empty.");
    }

    cli.success("Transcript fetched.");
    cli.detail("Characters", transcript.length);
    cli.info("Generating 15 practice sentences...");

    const result = await reviewTranscript({
      transcript,
      nativeLanguage: "Turkish",
    });

    cli.list("Generated sentences", result.output.sentences);
    const durationInSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    cli.success(`Simulation complete (${durationInSeconds}s).`);
  } catch (error) {
    cli.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

simulate();
