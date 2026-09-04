import { ChannelRow, VideoRow } from "@/db/types";

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

// column types
export interface TranscriptLine {
  time: string;
  text: string;
}
