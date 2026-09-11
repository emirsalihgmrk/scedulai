import { z } from "zod";
import {
  ProgramRow,
  SectionRow,
  ChannelRow,
  VideoRow,
  SectionProgressRow,
  updateSectionProgressRowSchema,
} from "@/db/types";

// query types
export type Program = Omit<ProgramRow, "createdAt" | "updatedAt">;
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

// mutation schemas
export const saveVideoPositionSchema = updateSectionProgressRowSchema
  .pick({ videoPositionSeconds: true })
  .required();
export type SaveVideoPositionInput = z.infer<typeof saveVideoPositionSchema>;

// `quizStatus` is derived server-side, so it is not exposed as a user-input schema.
export const upsertSectionProgressSchema = z
  .object({
    ...saveVideoPositionSchema.shape,
    quizStatus: updateSectionProgressRowSchema.shape.quizStatus,
  })
  .partial();
export type UpsertSectionProgressInput = z.infer<
  typeof upsertSectionProgressSchema
>;
