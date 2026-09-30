import type { z } from "zod";

import {
  createSectionProgressRowSchema
  
  
  
  
  
} from "@/db/rows";
import type {ChannelRow, ProgramRow, SectionProgressRow, SectionRow, VideoRow} from "@/db/rows";

// ── Query types ──

export type Section = Omit<SectionRow, "createdAt" | "updatedAt">;

export type ProgramListItem = Pick<
  ProgramRow,
  | "id"
  | "slug"
  | "title"
  | "shortDescription"
  | "thumbnailUrl"
  | "difficulty"
  | "referenceUrl"
>;

export type ProgramDetail = Pick<
  ProgramRow,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "shortDescription"
  | "thumbnailUrl"
  | "difficulty"
  | "referenceUrl"
> & {
  channel: Pick<ChannelRow, "title" | "thumbnailUrl"> | null;
};

export type SectionProgress = Pick<
  SectionProgressRow,
  "quizStatus" | "videoPositionSeconds" | "updatedAt"
>;

export type SectionListItem = Pick<SectionRow, "id" | "title" | "order"> & {
  video: Pick<VideoRow, "title" | "durationSeconds" | "thumbnailUrl"> | null;
  progress: SectionProgress | null;
};

// ── DAL input schemas ──

export const upsertSectionProgressSchema = createSectionProgressRowSchema
  .pick({ videoPositionSeconds: true, quizStatus: true })
  .partial();
export type UpsertSectionProgressInput = z.infer<
  typeof upsertSectionProgressSchema
>;

// ── Service input schemas ──

// `quizStatus` is derived server-side, so only the position is user input.
export const saveVideoPositionSchema = upsertSectionProgressSchema
  .pick({ videoPositionSeconds: true })
  .required();
export type SaveVideoPositionInput = z.infer<typeof saveVideoPositionSchema>;
