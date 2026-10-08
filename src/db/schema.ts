import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
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
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { SUPPORTED_NATIVE_LANGUAGE_CODES } from "@/constants/language";
import {
  CEFR_LEVELS,
  LEARNING_GOALS,
  LEVEL_SOURCES,
} from "@/constants/learning";
import { MISTAKE_CATEGORIES, MISTAKE_SOURCES } from "@/constants/mistake";
import { PLANS } from "@/constants/plan";
import { QUESTION_DIRECTIONS, QUESTION_TYPES } from "@/constants/question";
import { ROLES } from "@/constants/role";
import type { QuestionPayload, TranscriptLine } from "@/schemas/column-types";

const commonFields = {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const planEnum = pgEnum("plan", PLANS);
export const roleEnum = pgEnum("role", ROLES);
export const questionTypeEnum = pgEnum("question_type", QUESTION_TYPES);
export const questionDirectionEnum = pgEnum(
  "question_direction",
  QUESTION_DIRECTIONS,
);
export const nativeLanguageEnum = pgEnum(
  "native_language",
  SUPPORTED_NATIVE_LANGUAGE_CODES,
);
export const cefrLevelEnum = pgEnum("cefr_level", CEFR_LEVELS);
export const levelSourceEnum = pgEnum("level_source", LEVEL_SOURCES);
export const learningGoalEnum = pgEnum("learning_goal", LEARNING_GOALS);
export const mistakeCategoryEnum = pgEnum(
  "mistake_category",
  MISTAKE_CATEGORIES,
);
export const mistakeSourceEnum = pgEnum("mistake_source", MISTAKE_SOURCES);

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
  role: roleEnum("role").default("user").notNull(),
  nativeLanguage: nativeLanguageEnum("native_language").default("tr").notNull(),
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
  shortDescription: text("short_description").notNull(),
  channelId: uuid("channel_id").references(() => channelsTable.id, {
    onDelete: "set null",
  }),
  thumbnailUrl: text("thumbnail_url").notNull(),
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
  youtubeSlug: text("youtube_slug").notNull().unique(),
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
  // A property of the video itself (null until rated), so it is shared by every
  // section that uses the video.
  cefrLevel: cefrLevelEnum("cefr_level"),
});

export const transcriptsTable = pgTable(
  "transcripts",
  {
    ...commonFields,
    videoId: uuid("video_id")
      .references(() => videosTable.id, { onDelete: "cascade" })
      .notNull(),
    content: jsonb("content").$type<TranscriptLine[]>().notNull(),
  },
  (table) => [unique("transcripts_video_unique").on(table.videoId)],
);

export const quizzesTable = pgTable(
  "quizzes",
  {
    ...commonFields,
    sectionId: uuid("section_id")
      .references(() => sectionsTable.id, { onDelete: "cascade" })
      .notNull(),
    nativeLanguage: nativeLanguageEnum("native_language").notNull(),
  },
  (table) => [
    index("quizzes_section_id_idx").on(table.sectionId),
    unique("quizzes_section_native_language_unique").on(
      table.sectionId,
      table.nativeLanguage,
    ),
  ],
);

// A question belongs to exactly one owner: a section quiz (shared) or a
// practice (one learner's).
export const questionsTable = pgTable(
  "questions",
  {
    ...commonFields,
    quizId: uuid("quiz_id").references(() => quizzesTable.id, {
      onDelete: "cascade",
    }),
    // Annotated to break the questions → practices → mistakes → questions
    // type cycle.
    practiceId: uuid("practice_id").references(
      (): AnyPgColumn => practicesTable.id,
      { onDelete: "cascade" },
    ),
    order: integer("order").notNull(),
    type: questionTypeEnum("type").default("translation").notNull(),
    direction: questionDirectionEnum("direction")
      .default("native-to-target")
      .notNull(),
    payload: jsonb("payload").$type<QuestionPayload>().notNull(),
  },
  (table) => [
    index("questions_quiz_id_idx").on(table.quizId),
    index("questions_quiz_id_order_idx").on(table.quizId, table.order),
    index("questions_practice_id_order_idx").on(
      table.practiceId,
      table.order,
    ),
    check(
      "questions_single_owner_check",
      sql`num_nonnulls(${table.quizId}, ${table.practiceId}) = 1`,
    ),
  ],
);

export const sectionProgressTable = pgTable(
  "section_progress",
  {
    ...commonFields,
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    sectionId: uuid("section_id")
      .references(() => sectionsTable.id, { onDelete: "cascade" })
      .notNull(),
    videoPositionSeconds: integer("video_position_seconds")
      .default(0)
      .notNull(),
    quizCompletedAt: timestamp("quiz_completed_at"),
  },
  (table) => [
    unique("section_progress_user_section_unique").on(
      table.userId,
      table.sectionId,
    ),
    index("section_progress_user_id_idx").on(table.userId),
  ],
);

// One row per user. A user is "onboarded" once they have a profile; there is
// no separate flag.
export const learningProfilesTable = pgTable(
  "learning_profiles",
  {
    ...commonFields,
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    // null = the learner doesn't know their level yet (placement test pending)
    level: cefrLevelEnum("level"),
    levelSource: levelSourceEnum("level_source"),
    goal: learningGoalEnum("goal").notNull(),
    dailyMinutes: integer("daily_minutes").notNull(),
  },
  (table) => [unique("learning_profiles_user_unique").on(table.userId)],
);

// One row per mistake found in a graded answer; every attempt is kept. The
// sentence, answer and source are snapshotted so the history survives the
// question.
export const mistakesTable = pgTable(
  "mistakes",
  {
    ...commonFields,
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id").references(() => questionsTable.id, {
      onDelete: "set null",
    }),
    source: mistakeSourceEnum("source").notNull(),
    category: mistakeCategoryEnum("category").notNull(),
    incorrect: text("incorrect").notNull(),
    correction: text("correction").notNull(),
    explanation: text("explanation").notNull(),
    sourceSentence: text("source_sentence").notNull(),
    userTranslation: text("user_translation").notNull(),
  },
  (table) => [
    index("mistakes_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("mistakes_user_id_category_idx").on(table.userId, table.category),
  ],
);

// One per mistake practiced. Owned by a single learner, unlike section quizzes,
// so completion lives here instead of in a progress table.
export const practicesTable = pgTable(
  "practices",
  {
    ...commonFields,
    userId: text("user_id")
      .references(() => userTable.id, { onDelete: "cascade" })
      .notNull(),
    mistakeId: uuid("mistake_id")
      .references(() => mistakesTable.id, { onDelete: "cascade" })
      .notNull(),
    // null = not finished yet; set again on every later completion.
    completedAt: timestamp("completed_at"),
  },
  (table) => [unique("practices_mistake_unique").on(table.mistakeId)],
);

// Relations
export const userRelations = relations(userTable, ({ many }) => ({
  learningProfiles: many(learningProfilesTable),
  sectionProgress: many(sectionProgressTable),
  mistakes: many(mistakesTable),
  practices: many(practicesTable),
  sessions: many(sessionTable),
  accounts: many(accountTable),
}));

export const learningProfilesRelations = relations(
  learningProfilesTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [learningProfilesTable.userId],
      references: [userTable.id],
    }),
  }),
);

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
  progress: many(sectionProgressTable),
}));

export const videosRelations = relations(videosTable, ({ one, many }) => ({
  channel: one(channelsTable, {
    fields: [videosTable.channelId],
    references: [channelsTable.id],
  }),
  transcripts: many(transcriptsTable),
}));

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
  section: one(sectionsTable, {
    fields: [quizzesTable.sectionId],
    references: [sectionsTable.id],
  }),
  questions: many(questionsTable),
}));

export const questionsRelations = relations(
  questionsTable,
  ({ one, many }) => ({
    quiz: one(quizzesTable, {
      fields: [questionsTable.quizId],
      references: [quizzesTable.id],
    }),
    practice: one(practicesTable, {
      fields: [questionsTable.practiceId],
      references: [practicesTable.id],
    }),
    mistakes: many(mistakesTable),
  }),
);

export const mistakesRelations = relations(mistakesTable, ({ one }) => ({
  user: one(userTable, {
    fields: [mistakesTable.userId],
    references: [userTable.id],
  }),
  question: one(questionsTable, {
    fields: [mistakesTable.questionId],
    references: [questionsTable.id],
  }),
  practice: one(practicesTable),
}));

export const practicesRelations = relations(
  practicesTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [practicesTable.userId],
      references: [userTable.id],
    }),
    mistake: one(mistakesTable, {
      fields: [practicesTable.mistakeId],
      references: [mistakesTable.id],
    }),
    questions: many(questionsTable),
  }),
);

export const transcriptsRelations = relations(transcriptsTable, ({ one }) => ({
  video: one(videosTable, {
    fields: [transcriptsTable.videoId],
    references: [videosTable.id],
  }),
}));

export const sectionProgressRelations = relations(
  sectionProgressTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [sectionProgressTable.userId],
      references: [userTable.id],
    }),
    section: one(sectionsTable, {
      fields: [sectionProgressTable.sectionId],
      references: [sectionsTable.id],
    }),
  }),
);
