import { getAIObjectResponse } from "@/ai";
import { reviewTranscriptOutput } from "@/ai/outputs";
import {
  getVideoId,
  getVideoInfo,
  validateTEDxVideo,
  fetchTranscript,
} from "@/lib/youtube";

async function simulate() {
  const defaultUrl = "https://www.youtube.com/watch?v=kKvK2foOTJM";
  const url = process.argv[2] || defaultUrl;

  if (!process.argv[2]) {
    console.log(
      `\x1b[33mUyarı: Herhangi bir YouTube URL'si belirtilmedi. Varsayılan TEDx videosu kullanılıyor:\x1b[0m ${defaultUrl}`,
    );
    console.log(
      `Özel bir video ile çalıştırmak için: npm run simulate <youtube-url>\n`,
    );
  }

  const startTime = Date.now();
  console.log("Simulation starting...");

  try {
    const videoId = getVideoId(url);

    console.log(`Video detayları alınıyor: ${videoId}...`);
    const videoInfo = await getVideoInfo(url);
    const title = videoInfo.title || "";
    const channelName = videoInfo.channel?.name || "";

    console.log(`Video Başlığı: "${title}"`);
    console.log(`Kanal: "${channelName}"`);

    validateTEDxVideo(title, channelName);

    console.log("Transkript çekiliyor...");
    const transcript = await fetchTranscript(videoId);
    console.log(
      `Transkript başarıyla çekildi. Karakter sayısı: ${transcript.length}`,
    );

    const result = await getAIObjectResponse({
      messages: [
        {
          role: "user",
          content: `You are asked to analyze and review a transcript. Extract key sentence structures, vocabulary, and expressions from the transcript, and generate exactly 15 new practice sentences in Turkish for the user to translate into English later.\n\nTranscript:\n${transcript}`,
        },
      ],
      output: reviewTranscriptOutput,
    });

    const sentences = result.output.sentences;
    console.log("\n--- Generated 15 Sentences ---\n");
    sentences.forEach((sentence, index) => {
      console.log(`${index + 1}. ${sentence}`);
    });

    const endTime = Date.now();
    console.log(
      `\nSimulation completed. Total time: ${(endTime - startTime) / 1000} seconds.`,
    );
  } catch (error) {
    console.error(
      `\n\x1b[31mHata oluştu:\x1b[0m ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

simulate();
