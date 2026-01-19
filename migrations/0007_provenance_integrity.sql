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

ALTER TABLE "transactions" ADD COLUMN "batch_id" varchar;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "ingestion_item_id" varchar;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "raw_row_hash" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "parser_version" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "normalization_version" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "rules_version" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "taxonomy_version" text;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_batch_id_ingestion_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."ingestion_batches"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ingestion_item_id_ingestion_items_id_fk" FOREIGN KEY ("ingestion_item_id") REFERENCES "public"."ingestion_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
