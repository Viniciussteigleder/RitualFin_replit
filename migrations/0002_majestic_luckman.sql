DO $$ BEGIN
  CREATE TYPE "public"."screen_exclusion_type" AS ENUM('dashboard', 'analytics', 'transactions', 'calendar', 'budgets');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TYPE "public"."category_1" ADD VALUE 'OPEN';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assistant_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"database_context" text,
	"analysis_prompt" text,
	"advice_prompt" text,
	"summary_prompt" text,
	"response_language" text DEFAULT 'pt-BR',
	"response_style" text DEFAULT 'professional',
	"max_response_length" integer DEFAULT 500,
	"include_emojis" boolean DEFAULT false,
	"auto_suggestions" boolean DEFAULT true,
	"context_aware" boolean DEFAULT true,
	"include_recent_transactions" boolean DEFAULT true,
	"include_category_breakdown" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assistant_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exclusion_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"category_1" text,
	"category_2" text,
	"app_category_name" text,
	"is_internal" boolean,
	"custom_condition" text,
	"exclude_from_dashboard" boolean DEFAULT false,
	"exclude_from_analytics" boolean DEFAULT false,
	"exclude_from_transactions" boolean DEFAULT false,
	"exclude_from_calendar" boolean DEFAULT false,
	"exclude_from_budgets" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ritual_goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"ritual_id" varchar,
	"ritual_type" text NOT NULL,
	"goal_text" text NOT NULL,
	"target_date" timestamp,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "assistant_settings" ADD CONSTRAINT "assistant_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "exclusion_rules" ADD CONSTRAINT "exclusion_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "ritual_goals" ADD CONSTRAINT "ritual_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "ritual_goals" ADD CONSTRAINT "ritual_goals_ritual_id_rituals_id_fk" FOREIGN KEY ("ritual_id") REFERENCES "public"."rituals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ritual_goals_user_idx" ON "ritual_goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ritual_goals_ritual_idx" ON "ritual_goals" USING btree ("ritual_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ritual_goals_type_idx" ON "ritual_goals" USING btree ("ritual_type");
