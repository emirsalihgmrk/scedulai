import { videosTable } from "@/db/schema";

export type Video = typeof videosTable.$inferSelect;

export interface TranscriptLine {
  time: string;
  text: string;
}
