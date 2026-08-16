import { CEFR_LEVELS } from "@/constants/cefr-level";
import {
  SUPPORTED_NATIVE_LANGUAGE_CODES,
  SUPPORTED_TARGET_LANGUAGE_CODES,
} from "@/constants/language";
import { PLANS } from "@/constants/plan";
import {
  AiAnalysis,
  QUESTION_DIRECTIONS,
  QUESTION_TYPES,
  QuestionAnswer,
  QuestionPayload,
} from "@/types/question";

interface TranscriptLine {
  time: string;
  text: string;
}
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const commonFields = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const planEnum = pgEnum("plan", PLANS);
export const cefrLevelEnum = pgEnum("cefr_level", CEFR_LEVELS);
export const questionTypeEnum = pgEnum("question_type", QUESTION_TYPES);
export const questionDirectionEnum = pgEnum(
  "question_direction",
  QUESTION_DIRECTIONS,
);
export const nativeLanguageEnum = pgEnum(
  "native_language",
  SUPPORTED_NATIVE_LANGUAGE_CODES,
);
export const targetLanguageEnum = pgEnum(
  "target_language",
  SUPPORTED_TARGET_LANGUAGE_CODES,
);

export const usersTable = pgTable("users", {
  ...commonFields,
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  plan: planEnum("plan").default("free").notNull(),
  nativeLanguage: nativeLanguageEnum("native_language").default("tr").notNull(),
  targetLanguage: targetLanguageEnum("target_language").default("en").notNull(),
});

export const videosTable = pgTable("videos", {
  ...commonFields,
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  speaker: text("speaker").notNull(),
  publishedAt: text("published_at"),
  durationSeconds: integer("duration_seconds"),
  thumbnailUrl: text("thumbnail_url"),
});

export const watchedVideosTable = pgTable(
  "watched_videos",
  {
    ...commonFields,
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    unique("watched_videos_user_video_unique").on(table.userId, table.videoId),
    index("watched_videos_user_id_idx").on(table.userId),
    index("watched_videos_video_id_idx").on(table.videoId),
  ],
);

export const transcriptsTable = pgTable(
  "transcripts",
  {
    ...commonFields,
    videoId: uuid("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
    language: targetLanguageEnum("language").default("en").notNull(),
    content: jsonb("content").$type<TranscriptLine[]>().notNull(),
  },
  (table) => [
    unique("transcripts_video_language_unique").on(table.videoId, table.language),
    index("transcripts_video_id_idx").on(table.videoId),
  ],
);

export const quizzesTable = pgTable(
  "quizzes",
  {
    ...commonFields,
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id").references(() => videosTable.id, {
      onDelete: "set null",
    }),
    accuracy: integer("accuracy"),
    cefrLevel: cefrLevelEnum("cefr_level").notNull(),
  },
  (table) => [
    index("quizzes_user_id_idx").on(table.userId),
    index("quizzes_video_id_idx").on(table.videoId),
  ],
);

export const questionsTable = pgTable(
  "questions",
  {
    ...commonFields,
    quizId: uuid("quiz_id")
      .references(() => quizzesTable.id, { onDelete: "cascade" })
      .notNull(),
    order: integer("order").notNull(),
    type: questionTypeEnum("type").default("translation").notNull(),
    direction: questionDirectionEnum("direction")
      .default("target-to-native")
      .notNull(),
    payload: jsonb("payload").$type<QuestionPayload>().notNull(),
    answer: jsonb("answer").$type<QuestionAnswer>(),
    aiAnalyse: jsonb("ai_analyse").$type<AiAnalysis>(),
    accuracy: integer("accuracy"),
  },
  (table) => [
    index("questions_quiz_id_idx").on(table.quizId),
    index("questions_quiz_id_order_idx").on(table.quizId, table.order),
  ],
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  watchedVideos: many(watchedVideosTable),
  quizzes: many(quizzesTable),
}));

export const videosRelations = relations(videosTable, ({ many }) => ({
  watchedVideos: many(watchedVideosTable),
  quizzes: many(quizzesTable),
  transcripts: many(transcriptsTable),
}));

export const watchedVideosRelations = relations(
  watchedVideosTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [watchedVideosTable.userId],
      references: [usersTable.id],
    }),
    video: one(videosTable, {
      fields: [watchedVideosTable.videoId],
      references: [videosTable.id],
    }),
  }),
);

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [quizzesTable.userId],
    references: [usersTable.id],
  }),
  video: one(videosTable, {
    fields: [quizzesTable.videoId],
    references: [videosTable.id],
  }),
  questions: many(questionsTable),
}));

export const questionsRelations = relations(questionsTable, ({ one }) => ({
  quiz: one(quizzesTable, {
    fields: [questionsTable.quizId],
    references: [quizzesTable.id],
  }),
}));

export const transcriptsRelations = relations(transcriptsTable, ({ one }) => ({
  video: one(videosTable, {
    fields: [transcriptsTable.videoId],
    references: [videosTable.id],
  }),
}));
