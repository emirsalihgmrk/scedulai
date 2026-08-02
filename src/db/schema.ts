import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const watchedTalks = pgTable("watched_talks", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  title: text("title"),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
});