import type {
  channelsTable,
  programsTable,
  sectionProgressTable,
  sectionsTable,
  videosTable,
} from "@/db/schema";

// db types
export type ProgramSelect = typeof programsTable.$inferSelect;
export type SectionSelect = typeof sectionsTable.$inferSelect;
export type SectionProgressSelect = typeof sectionProgressTable.$inferSelect;
type ChannelSelect = typeof channelsTable.$inferSelect;
type VideoSelect = typeof videosTable.$inferSelect;

// query types
export type Program = Omit<ProgramSelect, "createdAt" | "updatedAt">;
export type Section = Omit<SectionSelect, "createdAt" | "updatedAt">;

export type ProgramListItem = Pick<
  ProgramSelect,
  | "id"
  | "slug"
  | "title"
  | "shortDescription"
  | "thumbnailUrl"
  | "difficulty"
  | "referenceUrl"
>;

export type ProgramDetail = Pick<
  ProgramSelect,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "shortDescription"
  | "thumbnailUrl"
  | "difficulty"
  | "referenceUrl"
> & {
  channel: Pick<ChannelSelect, "title" | "thumbnailUrl"> | null;
};

export type SectionProgress = Pick<
  SectionProgressSelect,
  "quizStatus" | "videoPositionSeconds" | "updatedAt"
>;

export type SectionListItem = Pick<SectionSelect, "id" | "title" | "order"> & {
  video: Pick<VideoSelect, "title" | "durationSeconds" | "thumbnailUrl"> | null;
  progress: SectionProgress | null;
};