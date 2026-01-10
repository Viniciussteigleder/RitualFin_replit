CREATE TYPE "public"."posting_status" AS ENUM('pending', 'posted');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('provisional', 'enriched', 'reconciled', 'void');--> statement-breakpoint
CREATE TYPE "public"."snapshot_source_type" AS ENUM('print', 'csv', 'manual');--> statement-breakpoint
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
CREATE TABLE "bulk_apply_runs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"params_json" jsonb,
	"summary_json" jsonb,
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
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "institution" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "account_type" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "currency_default" text DEFAULT 'EUR';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "external_ref_iban" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "external_ref_last4" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "account_id" varchar;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "imported_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "source_system" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "source_format" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "detected_account_id" varchar;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "detection_confidence" integer;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "detection_reasons" jsonb;--> statement-breakpoint
ALTER TABLE "ingestion_items" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "ingestion_items" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "rules" ADD COLUMN "rule_key" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "event_date" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "posting_date" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "value_date" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "event_time_text" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "posting_status" "posting_status" DEFAULT 'posted';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "processing_status" "processing_status" DEFAULT 'provisional';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "external_ref" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "enriched_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "account_balance_snapshots" ADD CONSTRAINT "account_balance_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_balance_snapshots" ADD CONSTRAINT "account_balance_snapshots_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_balance_snapshots" ADD CONSTRAINT "account_balance_snapshots_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alias_assets" ADD CONSTRAINT "alias_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_apply_runs" ADD CONSTRAINT "bulk_apply_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
CREATE UNIQUE INDEX "alias_assets_user_alias_key_idx" ON "alias_assets" USING btree ("user_id","alias_key");--> statement-breakpoint
CREATE INDEX "amex_acc_datum_idx" ON "source_csv_amex" USING btree ("account_id","datum");--> statement-breakpoint
CREATE INDEX "amex_acc_amt_idx" ON "source_csv_amex" USING btree ("account_id","betrag");--> statement-breakpoint
CREATE INDEX "mm_acc_processed_idx" ON "source_csv_mm" USING btree ("account_id","processed_on");--> statement-breakpoint
CREATE INDEX "mm_acc_amt_idx" ON "source_csv_mm" USING btree ("account_id","amount");--> statement-breakpoint
CREATE INDEX "sparkasse_acc_booking_idx" ON "source_csv_sparkasse" USING btree ("account_id","buchungstag");--> statement-breakpoint
CREATE INDEX "sparkasse_acc_amt_idx" ON "source_csv_sparkasse" USING btree ("account_id","betrag");--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD CONSTRAINT "ingestion_batches_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_institution_idx" ON "accounts" USING btree ("user_id","institution");--> statement-breakpoint
CREATE INDEX "accounts_user_iban_idx" ON "accounts" USING btree ("user_id","external_ref_iban");--> statement-breakpoint
CREATE INDEX "accounts_user_last4_idx" ON "accounts" USING btree ("user_id","external_ref_last4");--> statement-breakpoint
CREATE UNIQUE INDEX "rules_user_rule_key_idx" ON "rules" USING btree ("user_id","rule_key");--> statement-breakpoint
CREATE INDEX "transactions_acc_amt_posting_idx" ON "transactions" USING btree ("account_id","amount","posting_date");--> statement-breakpoint
CREATE INDEX "transactions_acc_amt_event_idx" ON "transactions" USING btree ("account_id","amount","event_date");--> statement-breakpoint
CREATE INDEX "transactions_acc_posting_status_idx" ON "transactions" USING btree ("account_id","posting_status");--> statement-breakpoint
CREATE INDEX "transactions_acc_processing_status_idx" ON "transactions" USING btree ("account_id","processing_status");--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "account_source";