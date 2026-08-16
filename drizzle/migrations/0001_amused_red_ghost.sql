CREATE TYPE "public"."cefr_level" AS ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2');--> statement-breakpoint
CREATE TYPE "public"."native_language" AS ENUM('tr', 'en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'zh', 'ru', 'pt', 'nl', 'pl', 'el', 'sv', 'no', 'da', 'fi', 'ar');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'basic', 'premium');--> statement-breakpoint
CREATE TYPE "public"."question_direction" AS ENUM('native-to-target', 'target-to-native');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('translation', 'fill-in-the-blank');--> statement-breakpoint
CREATE TYPE "public"."target_language" AS ENUM('en');--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"type" "question_type" DEFAULT 'translation' NOT NULL,
	"direction" "question_direction" DEFAULT 'target-to-native' NOT NULL,
	"payload" jsonb NOT NULL,
	"answer" jsonb,
	"ai_analyse" jsonb,
	"accuracy" integer
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" uuid,
	"accuracy" integer,
	"cefr_level" "cefr_level" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"native_language" "native_language" DEFAULT 'tr' NOT NULL,
	"target_language" "target_language" DEFAULT 'en' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"speaker" text NOT NULL,
	"speaker_role" text,
	"release_date" timestamp,
	"duration_seconds" integer,
	"thumbnail_url" text,
	"transcript" jsonb,
	CONSTRAINT "videos_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "watched_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"watched_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "watched_videos_user_video_unique" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
DROP TABLE "watched_talks" CASCADE;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watched_videos" ADD CONSTRAINT "watched_videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watched_videos" ADD CONSTRAINT "watched_videos_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "questions_quiz_id_idx" ON "questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "questions_quiz_id_order_idx" ON "questions" USING btree ("quiz_id","order");--> statement-breakpoint
CREATE INDEX "quizzes_user_id_idx" ON "quizzes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quizzes_video_id_idx" ON "quizzes" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "watched_videos_user_id_idx" ON "watched_videos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watched_videos_video_id_idx" ON "watched_videos" USING btree ("video_id");