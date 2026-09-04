import {
  ProgramRow,
  SectionRow,
  ChannelRow,
  VideoRow,
  SectionProgressRow,
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
