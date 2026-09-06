import { ChannelRow, TranscriptRow, VideoRow } from "@/db/types";

export type { TranscriptLine } from "@/db/schema";

// query types
export type Video = Pick<
  VideoRow,
  | "id"
  | "youtubeId"
  | "url"
  | "title"
  | "publishedAt"
  | "durationSeconds"
  | "thumbnailUrl"
> & {
  channel: Pick<ChannelRow, "title" | "thumbnailUrl">;
};

export type Transcript = Pick<TranscriptRow, "content">;
