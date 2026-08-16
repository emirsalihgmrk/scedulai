CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"youtube_id" text NOT NULL,
	"title" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	CONSTRAINT "channels_youtube_id_unique" UNIQUE("youtube_id")
);
--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "channel_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "published_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "duration_seconds" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "thumbnail_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "channel_title";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "channel_thumbnail_url";