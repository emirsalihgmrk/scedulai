import type { ChannelRow, TranscriptRow, VideoRow } from "@/db/rows";

export { transcriptLineSchema } from "@/schemas/column-types";
export type { TranscriptLine } from "@/schemas/column-types";

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
