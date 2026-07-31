import getYouTubeID from "get-youtube-id";
import YouTube from "youtube-sr";
import { YoutubeTranscript } from "youtube-transcript";

export function getVideoId(url: string): string {
  const videoId = getYouTubeID(url);
  if (!videoId) {
    throw new Error(`Geçersiz YouTube URL'si: ${url}`);
  }
  return videoId;
}

export async function getVideoInfo(url: string) {
  try {
    return await YouTube.getVideo(url);
  } catch (error) {
    throw new Error(
      `Video bilgileri alınamadı. Lütfen URL'yi kontrol edin. Hata: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export function validateTEDxVideo(title: string, channelName: string): void {
  const isTEDx =
    channelName.toLowerCase().includes("tedx") ||
    title.toLowerCase().includes("tedx");
  if (!isTEDx) {
    throw new Error(
      `Doğrulama Hatası: Belirtilen video bir TEDx videosu gibi görünmüyor (Kanal: ${channelName}, Başlık: ${title}).`,
    );
  }
}

export async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const transcriptParts = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcriptParts || transcriptParts.length === 0) {
      throw new Error("Transkript içeriği boş.");
    }
    return transcriptParts.map((part) => part.text).join(" ");
  } catch (error) {
    throw new Error(
      `Transkript çekilirken bir hata oluştu: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
