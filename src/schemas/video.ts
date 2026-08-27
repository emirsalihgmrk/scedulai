import type { channelsTable, videosTable } from "@/db/schema";

// db types
export type ChannelSelect = typeof channelsTable.$inferSelect;
export type VideoSelect = typeof videosTable.$inferSelect;

// query types
export type Video = Pick<
  VideoSelect,
  | "id"
  | "youtubeId"
  | "url"
  | "title"
  | "publishedAt"
  | "durationSeconds"
  | "thumbnailUrl"
> & {
  channel: Pick<ChannelSelect, "title" | "thumbnailUrl">;
};

// column types
export interface TranscriptLine {
  time: string;
  text: string;
}
