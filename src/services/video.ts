import { getTranscript, getVideo } from "@/dal/video/queries";
import { TranscriptLine, Video } from "@/types/video";

export async function getVideoService(
  sectionId: string,
): Promise<Video | null> {
  const video = await getVideo(sectionId);
  if (!video) return null;

  //PERMISSION
  //

  return video;
}

export async function getTranscriptService(
  videoId: string,
): Promise<TranscriptLine[]> {
  const transcript = await getTranscript(videoId);

  if (!transcript) return [];

  return transcript;
}
