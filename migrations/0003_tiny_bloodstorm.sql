ALTER TYPE "public"."category_1" ADD VALUE 'Assinaturas' BEFORE 'Mercados';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Lazer' BEFORE 'Compras';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Esportes' BEFORE 'Compras';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Finanças' BEFORE 'Interno';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Mobilidade' BEFORE 'Moradia';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Telefone' BEFORE 'OPEN';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Educação' BEFORE 'OPEN';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Doações' BEFORE 'OPEN';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Pets' BEFORE 'OPEN';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Férias' BEFORE 'OPEN';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Transferências' BEFORE 'OPEN';--> statement-breakpoint
ALTER TYPE "public"."category_1" ADD VALUE 'Vendas' BEFORE 'OPEN';--> statement-breakpoint
ALTER TYPE "public"."transaction_source" ADD VALUE 'DKB-MM';--> statement-breakpoint
CREATE TABLE "source_csv_dkb_mm" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" varchar,
	"batch_id" varchar,
	"ingestion_item_id" varchar,
	"transaction_date" date,
	"posting_date" date,
	"description_raw" text,
	"original_currency" text,
	"original_amount" real,
	"fx_rate" real,
	"billing_amount" real,
	"billing_currency" text,
	"statement_billing_date" date,
	"source_row_number" integer,
	"card_holder" text,
	"masked_card_number" text,
	"customer_number" text,
	"card_product" text,
	"import_fingerprint" text NOT NULL,
	"row_fingerprint" text NOT NULL,
	"key" text,
	"key_desc" text,
	"unique_row" boolean DEFAULT false,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "source_csv_amex" DROP CONSTRAINT "source_csv_amex_batch_id_ingestion_batches_id_fk";
--> statement-breakpoint
ALTER TABLE "source_csv_amex" DROP CONSTRAINT "source_csv_amex_ingestion_item_id_ingestion_items_id_fk";
--> statement-breakpoint
ALTER TABLE "source_csv_mm" DROP CONSTRAINT "source_csv_mm_batch_id_ingestion_batches_id_fk";
--> statement-breakpoint
ALTER TABLE "source_csv_mm" DROP CONSTRAINT "source_csv_mm_ingestion_item_id_ingestion_items_id_fk";
--> statement-breakpoint
ALTER TABLE "source_csv_sparkasse" DROP CONSTRAINT "source_csv_sparkasse_batch_id_ingestion_batches_id_fk";
--> statement-breakpoint
ALTER TABLE "source_csv_sparkasse" DROP CONSTRAINT "source_csv_sparkasse_ingestion_item_id_ingestion_items_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "file_content" "bytea";--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "file_hash_sha256" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "file_size_bytes" integer;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "encoding" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "delimiter" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "quote_char" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "decimal_sep" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "thousands_sep" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "date_format" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "parser_version" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "normalization_version" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "rules_version" text;--> statement-breakpoint
ALTER TABLE "ingestion_batches" ADD COLUMN "taxonomy_version" text;--> statement-breakpoint
ALTER TABLE "ingestion_items" ADD COLUMN "row_index" integer;--> statement-breakpoint
ALTER TABLE "ingestion_items" ADD COLUMN "raw_columns_json" jsonb;--> statement-breakpoint
ALTER TABLE "ingestion_items" ADD COLUMN "raw_row_hash" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "ingestion_item_id" varchar;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "raw_row_hash" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "parser_version" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "normalization_version" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "rules_version" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "taxonomy_version" text;--> statement-breakpoint
ALTER TABLE "source_csv_dkb_mm" ADD CONSTRAINT "source_csv_dkb_mm_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_dkb_mm" ADD CONSTRAINT "source_csv_dkb_mm_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_dkb_mm" ADD CONSTRAINT "source_csv_dkb_mm_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_dkb_mm" ADD CONSTRAINT "source_csv_dkb_mm_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dkb_mm_acc_tx_date_idx" ON "source_csv_dkb_mm" USING btree ("account_id","transaction_date");--> statement-breakpoint
CREATE INDEX "dkb_mm_acc_amt_idx" ON "source_csv_dkb_mm" USING btree ("account_id","billing_amount");--> statement-breakpoint
CREATE UNIQUE INDEX "dkb_mm_user_fingerprint_idx" ON "source_csv_dkb_mm" USING btree ("user_id","import_fingerprint");--> statement-breakpoint
CREATE UNIQUE INDEX "dkb_mm_user_key_idx" ON "source_csv_dkb_mm" USING btree ("user_id","key");--> statement-breakpoint
ALTER TABLE "source_csv_amex" ADD CONSTRAINT "source_csv_amex_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_amex" ADD CONSTRAINT "source_csv_amex_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_mm" ADD CONSTRAINT "source_csv_mm_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_mm" ADD CONSTRAINT "source_csv_mm_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_sparkasse" ADD CONSTRAINT "source_csv_sparkasse_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_csv_sparkasse" ADD CONSTRAINT "source_csv_sparkasse_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_rules_user_active_leaf" ON "rules" USING btree ("user_id","active","leaf_id");--> statement-breakpoint
CREATE INDEX "idx_rules_user_active" ON "rules" USING btree ("user_id","active");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_date" ON "transactions" USING btree ("user_id","payment_date");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_review" ON "transactions" USING btree ("user_id","needs_review");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_app_cat" ON "transactions" USING btree ("user_id","app_category_name");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_type" ON "transactions" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_display" ON "transactions" USING btree ("user_id","display");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_cat1" ON "transactions" USING btree ("user_id","category_1");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_source" ON "transactions" USING btree ("user_id","source");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_date_cat1" ON "transactions" USING btree ("user_id","payment_date","category_1");