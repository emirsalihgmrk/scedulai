import {
  getTranscriptByVideoId,
  getVideoBySectionId,
} from "@/dal/video/queries";
import { TranscriptLine, Video } from "@/types/video";

export async function getVideoBySectionIdService(
  sectionId: string,
): Promise<Video | null> {
  const video = await getVideoBySectionId(sectionId);
  if (!video) return null;

  //PERMISSION
  //

  return video;
}

export async function getTranscriptByVideoIdService(
  videoId: string,
): Promise<TranscriptLine[]> {
  const transcript = await getTranscriptByVideoId(videoId);

  if (!transcript) return [];

  return transcript;
}
