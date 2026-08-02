CREATE TABLE "watched_talks" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "watched_talks_url_unique" UNIQUE("url")
);
