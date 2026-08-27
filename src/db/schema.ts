import { CEFR_LEVELS } from "@/constants/cefr-level";
import {
  SUPPORTED_NATIVE_LANGUAGE_CODES,
  SUPPORTED_TARGET_LANGUAGE_CODES,
} from "@/constants/language";
import { PLANS } from "@/constants/plan";
import { QUESTION_DIRECTIONS, QUESTION_TYPES } from "@/constants/question";
import { relations } from "drizzle-orm";
import {
  boolean,
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
import type { TranscriptLine } from "@/schemas/video";
import type {
  QuestionAnswer,
  QuestionAnswerAnalysis,
  QuestionPayload,
} from "@/schemas/quiz";

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

// better-auth managed tables
export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  plan: planEnum("plan").default("free").notNull(),
  nativeLanguage: nativeLanguageEnum("native_language").default("tr").notNull(),
  targetLanguage: targetLanguageEnum("target_language").default("en").notNull(),
});

export const sessionTable = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const accountTable = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
    unique("account_issuer_accountId_unique").on(table.issuer, table.accountId),
  ],
);

export const verificationTable = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// App tables
export const programsTable = pgTable("programs", {
  ...commonFields,
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  channelId: uuid("channel_id").references(() => channelsTable.id, {
    onDelete: "set null",
  }),
  participantCount: integer("participant_count").default(0).notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  cefrLevel: cefrLevelEnum("cefr_level"),
  referenceUrl: text("reference_url"),
});

export const sectionsTable = pgTable(
  "sections",
  {
    ...commonFields,
    programId: uuid("program_id")
      .references(() => programsTable.id, { onDelete: "cascade" })
      .notNull(),
    videoId: uuid("video_id").references(() => videosTable.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    order: integer("order").notNull(),
  },
  (table) => [
    unique("sections_program_order_unique").on(table.programId, table.order),
    index("sections_program_id_idx").on(table.programId),
  ],
);

export const channelsTable = pgTable("channels", {
  ...commonFields,
  youtubeId: text("youtube_id").notNull().unique(),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
});

export const videosTable = pgTable("videos", {
  ...commonFields,
  channelId: uuid("channel_id")
    .references(() => channelsTable.id, { onDelete: "cascade" })
    .notNull(),
  youtubeId: text("youtube_id").notNull().unique(),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  publishedAt: text("published_at").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
});

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
    unique("transcripts_video_language_unique").on(
      table.videoId,
      table.language,
    ),
    index("transcripts_video_id_idx").on(table.videoId),
  ],
);

export const quizzesTable = pgTable(
  "quizzes",
  {
    ...commonFields,
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    sectionId: uuid("section_id")
      .references(() => sectionsTable.id, { onDelete: "cascade" })
      .notNull(),
    cefrLevel: cefrLevelEnum("cefr_level").notNull(),
  },
  (table) => [
    index("quizzes_user_id_idx").on(table.userId),
    index("quizzes_section_id_idx").on(table.sectionId),
    unique("quizzes_user_section_unique").on(table.userId, table.sectionId),
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
    answerAnalysis: jsonb("analysis").$type<QuestionAnswerAnalysis>(),
    answerAccuracy: integer("accuracy"),
  },
  (table) => [
    index("questions_quiz_id_idx").on(table.quizId),
    index("questions_quiz_id_order_idx").on(table.quizId, table.order),
  ],
);

// Relations
export const userRelations = relations(userTable, ({ many }) => ({
  quizzes: many(quizzesTable),
  sessions: many(sessionTable),
  accounts: many(accountTable),
}));

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));

export const channelsRelations = relations(channelsTable, ({ many }) => ({
  videos: many(videosTable),
  programs: many(programsTable),
}));

export const programsRelations = relations(programsTable, ({ one, many }) => ({
  channel: one(channelsTable, {
    fields: [programsTable.channelId],
    references: [channelsTable.id],
  }),
  sections: many(sectionsTable),
}));

export const sectionsRelations = relations(sectionsTable, ({ one, many }) => ({
  program: one(programsTable, {
    fields: [sectionsTable.programId],
    references: [programsTable.id],
  }),
  video: one(videosTable, {
    fields: [sectionsTable.videoId],
    references: [videosTable.id],
  }),
  quizzes: many(quizzesTable),
}));

export const videosRelations = relations(videosTable, ({ one, many }) => ({
  channel: one(channelsTable, {
    fields: [videosTable.channelId],
    references: [channelsTable.id],
  }),
  transcripts: many(transcriptsTable),
}));

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [quizzesTable.userId],
    references: [userTable.id],
  }),
  section: one(sectionsTable, {
    fields: [quizzesTable.sectionId],
    references: [sectionsTable.id],
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
