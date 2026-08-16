ALTER TABLE "videos" RENAME COLUMN "speaker" TO "channel_title";--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "channel_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "channel_thumbnail_url" text;