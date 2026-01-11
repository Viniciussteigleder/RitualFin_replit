CREATE TYPE "public"."account_type" AS ENUM('credit_card', 'debit_card', 'bank_account', 'cash');--> statement-breakpoint
CREATE TYPE "public"."category_1" AS ENUM('Alimentação', 'Mercados', 'Renda Extra', 'Outros', 'Lazer / Esporte', 'Compras', 'Financiamento', 'Interno', 'Transporte', 'Moradia', 'Saúde', 'Trabalho');--> statement-breakpoint
CREATE TYPE "public"."fix_var" AS ENUM('Fixo', 'Variável');--> statement-breakpoint
CREATE TYPE "public"."ingestion_batch_status" AS ENUM('processing', 'preview', 'committed', 'rolled_back', 'error');--> statement-breakpoint
CREATE TYPE "public"."ingestion_source_type" AS ENUM('csv', 'screenshot');--> statement-breakpoint
CREATE TYPE "public"."posting_status" AS ENUM('pending', 'posted');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('provisional', 'enriched', 'reconciled', 'void');--> statement-breakpoint
CREATE TYPE "public"."snapshot_source_type" AS ENUM('print', 'csv', 'manual');--> statement-breakpoint
CREATE TYPE "public"."transaction_classified_by" AS ENUM('AUTO_KEYWORDS', 'MANUAL', 'AI_SUGGESTION');--> statement-breakpoint
CREATE TYPE "public"."transaction_source" AS ENUM('Sparkasse', 'Amex', 'M&M');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('FINAL', 'OPEN');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('Despesa', 'Receita');--> statement-breakpoint
CREATE TYPE "public"."upload_status" AS ENUM('processing', 'ready', 'duplicate', 'error');--> statement-breakpoint
CREATE TABLE "account_balance_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar NOT NULL,
	"as_of_date" timestamp NOT NULL,
	"balance_type" text,
	"amount" real NOT NULL,
	"unit" text DEFAULT 'EUR',
	"source_type" "snapshot_source_type" NOT NULL,
	"ingestion_item_id" varchar,
	"attachment_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"institution" text,
	"type" "account_type" NOT NULL,
	"account_type" text,
	"currency_default" text DEFAULT 'EUR',
	"external_ref_iban" text,
	"external_ref_last4" text,
	"account_number" text,
	"icon" text DEFAULT 'credit-card',
	"color" text DEFAULT '#6366f1',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alias_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"alias_key" text,
	"alias_desc" text NOT NULL,
	"key_words_alias" text,
	"logo_url" text,
	"local_logo_path" text,
	"active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 500 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_category" (
	"app_cat_id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"version_id" varchar DEFAULT gen_random_uuid() NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_category_leaf" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"app_cat_id" varchar NOT NULL,
	"leaf_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"batch_id" varchar,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"ocr_status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authenticators" (
	"credential_id" text NOT NULL,
	"user_id" varchar NOT NULL,
	"provider_account_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticators_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"month" text NOT NULL,
	"category_1" "category_1" NOT NULL,
	"amount" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bulk_apply_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"params_json" jsonb,
	"summary_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"amount" real NOT NULL,
	"category_1" "category_1" NOT NULL,
	"category_2" text,
	"recurrence" text DEFAULT 'none' NOT NULL,
	"next_due_date" timestamp NOT NULL,
	"account_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" varchar NOT NULL,
	"category_1" "category_1" NOT NULL,
	"target_amount" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"month" text NOT NULL,
	"estimated_income" real DEFAULT 0 NOT NULL,
	"total_planned" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_batches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar,
	"source_type" "ingestion_source_type" NOT NULL,
	"status" "ingestion_batch_status" DEFAULT 'processing' NOT NULL,
	"filename" text,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	"source_system" text,
	"source_format" text,
	"detected_account_id" varchar,
	"detection_confidence" integer,
	"detection_reasons" jsonb,
	"diagnostics_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" varchar NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"parsed_payload" jsonb,
	"item_fingerprint" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "ocr_extractions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attachment_id" varchar NOT NULL,
	"text_raw" text,
	"blocks_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_line_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar,
	"print_session_id" varchar,
	"ingestion_item_id" varchar,
	"section" text,
	"event_date" timestamp,
	"event_time_text" text,
	"merchant_line_1" text,
	"sub_text" text,
	"amount" real,
	"currency" text DEFAULT 'EUR',
	"fingerprint" text NOT NULL,
	"transaction_id" varchar,
	"confidence" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar,
	"batch_id" varchar,
	"source_app" text,
	"captured_at" timestamp,
	"as_of_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliation_candidates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" varchar NOT NULL,
	"left_transaction_id" varchar NOT NULL,
	"right_transaction_id" varchar NOT NULL,
	"score_total" real,
	"score_breakdown" jsonb,
	"decision" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliation_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar NOT NULL,
	"left_type" text NOT NULL,
	"right_type" text NOT NULL,
	"params_json" jsonb,
	"status" text DEFAULT 'running' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rituals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"period" text NOT NULL,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"type" "transaction_type",
	"fix_var" "fix_var",
	"category_1" "category_1",
	"category_2" text,
	"category_3" text,
	"priority" integer DEFAULT 500 NOT NULL,
	"strict" boolean DEFAULT false NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"leaf_id" varchar,
	"key_words" text,
	"key_words_negative" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"auto_confirm_high_confidence" boolean DEFAULT false NOT NULL,
	"confidence_threshold" integer DEFAULT 80 NOT NULL,
	"language" text DEFAULT 'pt-BR' NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"fiscal_region" text DEFAULT 'Portugal/PT' NOT NULL,
	"notify_import_status" boolean DEFAULT true NOT NULL,
	"notify_review_queue" boolean DEFAULT true NOT NULL,
	"notify_monthly_report" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "source_csv_amex" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar,
	"batch_id" varchar,
	"ingestion_item_id" varchar,
	"datum" date,
	"beschreibung" text,
	"betrag" real,
	"karteninhaber" text,
	"kartennummer" text,
	"referenz" text,
	"ort" text,
	"staat" text,
	"row_fingerprint" text NOT NULL,
	"key" text,
	"key_desc" text,
	"unique_row" boolean DEFAULT false,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_csv_mm" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar,
	"batch_id" varchar,
	"ingestion_item_id" varchar,
	"authorised_on" date,
	"processed_on" date,
	"payment_type" text,
	"status" text,
	"amount" real,
	"currency" text,
	"description" text,
	"row_fingerprint" text NOT NULL,
	"key" text,
	"key_desc" text,
	"unique_row" boolean DEFAULT false,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_csv_sparkasse" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar,
	"batch_id" varchar,
	"ingestion_item_id" varchar,
	"auftragskonto" text,
	"buchungstag" date,
	"valutadatum" date,
	"buchungstext" text,
	"verwendungszweck" text,
	"glaeubiger_id" text,
	"mandatsreferenz" text,
	"kundenreferenz" text,
	"sammlerreferenz" text,
	"lastschrifteinreicher_id" text,
	"id_end_to_end" text,
	"beguenstigter_zahlungspflichtiger" text,
	"iban" text,
	"bic" text,
	"betrag" real,
	"waehrung" text,
	"info" text,
	"row_fingerprint" text NOT NULL,
	"key" text,
	"key_desc" text,
	"unique_row" boolean DEFAULT false,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_leaf" (
	"leaf_id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"level_2_id" varchar NOT NULL,
	"nivel_3_pt" text NOT NULL,
	"recorrente_default" text,
	"fixo_variavel_default" text,
	"receita_despesa_default" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_level_1" (
	"level_1_id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"nivel_1_pt" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_level_2" (
	"level_2_id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"level_1_id" varchar NOT NULL,
	"nivel_2_pt" text NOT NULL,
	"recorrente_default" text,
	"fixo_variavel_default" text,
	"receita_despesa_default" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_evidence_link" (
	"transaction_id" varchar NOT NULL,
	"ingestion_item_id" varchar NOT NULL,
	"match_confidence" integer,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"payment_date" timestamp NOT NULL,
	"booking_date" date,
	"event_date" timestamp,
	"posting_date" timestamp,
	"value_date" timestamp,
	"event_time_text" text,
	"posting_status" "posting_status" DEFAULT 'posted',
	"processing_status" "processing_status" DEFAULT 'provisional',
	"external_ref" text,
	"enriched_at" timestamp,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	"desc_raw" text NOT NULL,
	"desc_norm" text NOT NULL,
	"raw_description" text,
	"normalized_description" text,
	"amount" real NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"foreign_amount" real,
	"foreign_currency" text,
	"exchange_rate" real,
	"key" text NOT NULL,
	"source" "transaction_source",
	"key_desc" text,
	"simple_desc" text,
	"alias_desc" text,
	"leaf_id" varchar,
	"classified_by" "transaction_classified_by",
	"status" "transaction_status",
	"recurring_flag" boolean DEFAULT false NOT NULL,
	"recurring_group_id" varchar,
	"recurring_confidence" real,
	"recurring_day_of_month" integer,
	"recurring_day_window" integer,
	"type" "transaction_type",
	"fix_var" "fix_var",
	"category_1" "category_1",
	"category_2" text,
	"category_3" text,
	"manual_override" boolean DEFAULT false NOT NULL,
	"internal_transfer" boolean DEFAULT false NOT NULL,
	"exclude_from_budget" boolean DEFAULT false NOT NULL,
	"needs_review" boolean DEFAULT true NOT NULL,
	"rule_id_applied" varchar,
	"upload_id" varchar,
	"confidence" integer,
	"suggested_keyword" text,
	"display" text DEFAULT 'yes' NOT NULL,
	"conflict_flag" boolean DEFAULT false NOT NULL,
	"classification_candidates" jsonb
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"filename" text NOT NULL,
	"status" "upload_status" DEFAULT 'processing' NOT NULL,
	"rows_total" integer DEFAULT 0 NOT NULL,
	"rows_imported" integer DEFAULT 0 NOT NULL,
	"month_affected" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"username" text,
	"password_hash" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	"google_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_balance_snapshots" ADD CONSTRAINT "account_balance_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_balance_snapshots" ADD CONSTRAINT "account_balance_snapshots_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_balance_snapshots" ADD CONSTRAINT "account_balance_snapshots_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alias_assets" ADD CONSTRAINT "alias_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_category" ADD CONSTRAINT "app_category_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_category_leaf" ADD CONSTRAINT "app_category_leaf_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_category_leaf" ADD CONSTRAINT "app_category_leaf_app_cat_id_app_category_app_cat_id_fk" FOREIGN KEY ("app_cat_id") REFERENCES "public"."app_category"("app_cat_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_category_leaf" ADD CONSTRAINT "app_category_leaf_leaf_id_taxonomy_leaf_leaf_id_fk" FOREIGN KEY ("leaf_id") REFERENCES "public"."taxonomy_leaf"("leaf_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_apply_runs" ADD CONSTRAINT "bulk_apply_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_goals" ADD CONSTRAINT "category_goals_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD CONSTRAINT "ingestion_batches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD CONSTRAINT "ingestion_batches_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_items" ADD CONSTRAINT "ingestion_items_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_extractions" ADD CONSTRAINT "ocr_extractions_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_line_items" ADD CONSTRAINT "print_line_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_line_items" ADD CONSTRAINT "print_line_items_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_line_items" ADD CONSTRAINT "print_line_items_print_session_id_print_sessions_id_fk" FOREIGN KEY ("print_session_id") REFERENCES "public"."print_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_line_items" ADD CONSTRAINT "print_line_items_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_line_items" ADD CONSTRAINT "print_line_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_sessions" ADD CONSTRAINT "print_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_sessions" ADD CONSTRAINT "print_sessions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_sessions" ADD CONSTRAINT "print_sessions_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_candidates" ADD CONSTRAINT "reconciliation_candidates_run_id_reconciliation_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."reconciliation_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_runs" ADD CONSTRAINT "reconciliation_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_runs" ADD CONSTRAINT "reconciliation_runs_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rituals" ADD CONSTRAINT "rituals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_amex" ADD CONSTRAINT "source_csv_amex_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_amex" ADD CONSTRAINT "source_csv_amex_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_amex" ADD CONSTRAINT "source_csv_amex_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_amex" ADD CONSTRAINT "source_csv_amex_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_mm" ADD CONSTRAINT "source_csv_mm_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_mm" ADD CONSTRAINT "source_csv_mm_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_mm" ADD CONSTRAINT "source_csv_mm_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_mm" ADD CONSTRAINT "source_csv_mm_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_sparkasse" ADD CONSTRAINT "source_csv_sparkasse_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_sparkasse" ADD CONSTRAINT "source_csv_sparkasse_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_sparkasse" ADD CONSTRAINT "source_csv_sparkasse_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_sparkasse" ADD CONSTRAINT "source_csv_sparkasse_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_leaf" ADD CONSTRAINT "taxonomy_leaf_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_leaf" ADD CONSTRAINT "taxonomy_leaf_level_2_id_taxonomy_level_2_level_2_id_fk" FOREIGN KEY ("level_2_id") REFERENCES "public"."taxonomy_level_2"("level_2_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_level_1" ADD CONSTRAINT "taxonomy_level_1_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_level_2" ADD CONSTRAINT "taxonomy_level_2_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_level_2" ADD CONSTRAINT "taxonomy_level_2_level_1_id_taxonomy_level_1_level_1_id_fk" FOREIGN KEY ("level_1_id") REFERENCES "public"."taxonomy_level_1"("level_1_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_evidence_link" ADD CONSTRAINT "transaction_evidence_link_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_evidence_link" ADD CONSTRAINT "transaction_evidence_link_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_rule_id_applied_rules_id_fk" FOREIGN KEY ("rule_id_applied") REFERENCES "public"."rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_institution_idx" ON "accounts" USING btree ("user_id","institution");--> statement-breakpoint
CREATE INDEX "accounts_user_iban_idx" ON "accounts" USING btree ("user_id","external_ref_iban");--> statement-breakpoint
CREATE INDEX "accounts_user_last4_idx" ON "accounts" USING btree ("user_id","external_ref_last4");--> statement-breakpoint
CREATE UNIQUE INDEX "alias_assets_user_alias_key_idx" ON "alias_assets" USING btree ("user_id","alias_key");--> statement-breakpoint
CREATE UNIQUE INDEX "authenticators_user_id_credential_id_idx" ON "authenticators" USING btree ("user_id","credential_id");--> statement-breakpoint
CREATE INDEX "ingestion_items_fingerprint_idx" ON "ingestion_items" USING btree ("item_fingerprint");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_account_id_idx" ON "oauth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "amex_acc_datum_idx" ON "source_csv_amex" USING btree ("account_id","datum");--> statement-breakpoint
CREATE INDEX "amex_acc_amt_idx" ON "source_csv_amex" USING btree ("account_id","betrag");--> statement-breakpoint
CREATE UNIQUE INDEX "amex_user_key_idx" ON "source_csv_amex" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX "mm_acc_processed_idx" ON "source_csv_mm" USING btree ("account_id","processed_on");--> statement-breakpoint
CREATE INDEX "mm_acc_amt_idx" ON "source_csv_mm" USING btree ("account_id","amount");--> statement-breakpoint
CREATE UNIQUE INDEX "mm_user_key_idx" ON "source_csv_mm" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX "sparkasse_acc_booking_idx" ON "source_csv_sparkasse" USING btree ("account_id","buchungstag");--> statement-breakpoint
CREATE INDEX "sparkasse_acc_amt_idx" ON "source_csv_sparkasse" USING btree ("account_id","betrag");--> statement-breakpoint
CREATE UNIQUE INDEX "sparkasse_user_key_idx" ON "source_csv_sparkasse" USING btree ("user_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_evidence_link_pk" ON "transaction_evidence_link" USING btree ("transaction_id","ingestion_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_unique_key_per_user" ON "transactions" USING btree ("user_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_identifier_token_idx" ON "verification_tokens" USING btree ("identifier","token");