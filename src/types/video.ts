import { channelsTable, videosTable } from "@/db/schema";

export type ChannelSelect = typeof channelsTable.$inferSelect;
export type VideoSelect = typeof videosTable.$inferSelect;

export type Video = Omit<
  VideoSelect,
  "channelId" | "createdAt" | "updatedAt"
> & {
  channelTitle: ChannelSelect["title"];
  channelThumbnailUrl: ChannelSelect["thumbnailUrl"];
};

export interface TranscriptLine {
  time: string;
  text: string;
}
