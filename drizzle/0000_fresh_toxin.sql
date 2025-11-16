CREATE TYPE "public"."dimension" AS ENUM('E', 'I', 'S', 'N', 'T', 'F', 'J', 'P');--> statement-breakpoint
CREATE TABLE "personality_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"personality_type" text NOT NULL,
	"dimension_scores" jsonb NOT NULL,
	"calculated_at" date NOT NULL,
	"window_start" date NOT NULL,
	"window_end" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"target_dimension" "dimension" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" boolean NOT NULL,
	"responded_at" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"total_days_completed" integer DEFAULT 0 NOT NULL,
	"last_completed_date" date,
	"has_completed_onboarding" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_calculated_at_idx" ON "personality_snapshots" USING btree ("user_id","calculated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_question_date_idx" ON "responses" USING btree ("user_id","question_id","responded_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_responded_at_idx" ON "responses" USING btree ("user_id","responded_at");