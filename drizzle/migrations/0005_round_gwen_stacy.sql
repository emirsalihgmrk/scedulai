CREATE TABLE "transcripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"video_id" uuid NOT NULL,
	"language" "target_language" DEFAULT 'en' NOT NULL,
	"content" jsonb NOT NULL,
	CONSTRAINT "transcripts_video_language_unique" UNIQUE("video_id","language")
);
--> statement-breakpoint
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transcripts_video_id_idx" ON "transcripts" USING btree ("video_id");--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "transcript";