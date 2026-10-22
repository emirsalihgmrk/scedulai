import { z } from "zod";

import {
  createListeningDayRowSchema,
  createSectionProgressRowSchema,
} from "@/db/rows";
import type {
  ChannelRow,
  ListeningDayRow,
  ProgramRow,
  SectionProgressRow,
  SectionRow,
  VideoRow,
} from "@/db/rows";

// ── Query types ──

export type Section = Omit<SectionRow, "createdAt" | "updatedAt">;

export type ProgramListItem = Pick<
  ProgramRow,
  | "id"
  | "slug"
  | "title"
  | "shortDescription"
  | "thumbnailUrl"
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
  | "referenceUrl"
> & {
  channel: Pick<ChannelRow, "title" | "thumbnailUrl"> | null;
};

export type SectionProgress = Pick<
  SectionProgressRow,
  "quizCompletedAt" | "videoPositionSeconds" | "updatedAt"
>;

export type SectionListItem = Pick<SectionRow, "id" | "title" | "order"> & {
  video: Pick<
    VideoRow,
    "title" | "durationSeconds" | "thumbnailUrl" | "cefrLevel"
  > | null;
  progress: SectionProgress | null;
};

export type SectionProgressWithSection = SectionProgress & {
  section: Pick<SectionRow, "title" | "order"> & {
    program: Pick<ProgramRow, "slug" | "title">;
    video: Pick<VideoRow, "durationSeconds" | "thumbnailUrl"> | null;
  };
};

export type ListeningDay = Pick<ListeningDayRow, "day" | "seconds">;

// ── DAL input schemas ──

export const upsertSectionProgressSchema = createSectionProgressRowSchema
  .pick({ videoPositionSeconds: true, quizCompletedAt: true })
  .partial();
export type UpsertSectionProgressInput = z.infer<
  typeof upsertSectionProgressSchema
>;

// Seconds are added to the day's total. The player saves every 30 s while
// playing, so a single save stays far below the cap even in a throttled
// background tab.
export const upsertListeningDaySchema = createListeningDayRowSchema
  .pick({ seconds: true })
  .extend({ seconds: z.int().min(0).max(600) });
export type UpsertListeningDayInput = z.infer<typeof upsertListeningDaySchema>;

// ── Service input schemas ──

// `quizCompletedAt` is set server-side, so only the position and the time
// played since the last save are user input.
export const saveVideoPositionSchema = upsertSectionProgressSchema
  .pick({ videoPositionSeconds: true })
  .required()
  .extend({ listenedSeconds: upsertListeningDaySchema.shape.seconds });
export type SaveVideoPositionInput = z.infer<typeof saveVideoPositionSchema>;
