import { channelsTable, videosTable } from "@/db/schema";

export type ChannelRow = typeof channelsTable.$inferSelect;
export type VideoRow = typeof videosTable.$inferSelect;

export type Video = Omit<VideoRow, "channelId" | "createdAt" | "updatedAt"> & {
  channelTitle: ChannelRow["title"];
  channelThumbnailUrl: ChannelRow["thumbnailUrl"];
};

export interface TranscriptLine {
  time: string;
  text: string;
}