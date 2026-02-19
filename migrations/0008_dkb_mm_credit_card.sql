-- Migration: Add DKB M&M credit card import support
-- Adds DKB-MM to transaction_source enum and creates source_csv_dkb_mm staging table.
-- Safe to run multiple times (idempotent via DO $$ EXCEPTION blocks).
-- Date: 2026-02-19

-- ---------------------------------------------------------------------------
-- 1. Extend the transaction_source enum with DKB-MM
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TYPE "transaction_source" ADD VALUE 'DKB-MM';
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN NULL; -- Some Postgres versions raise 42710
END $$;--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 2. Create staging table: source_csv_dkb_mm
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "source_csv_dkb_mm" (
  "id"                       varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"                  varchar NOT NULL REFERENCES "users"("id"),
  "account_id"               varchar REFERENCES "accounts"("id"),
  "batch_id"                 varchar REFERENCES "ingestion_batches"("id") ON DELETE CASCADE,
  "ingestion_item_id"        varchar REFERENCES "ingestion_items"("id") ON DELETE CASCADE,
  -- Positional CSV columns
  "transaction_date"         date,
  "posting_date"             date,
  "description_raw"          text,
  "original_currency"        text,
  "original_amount"          real,
  "fx_rate"                  real,
  "billing_amount"           real,
  "billing_currency"         text,
  -- Statement-level metadata
  "statement_billing_date"   date,
  "source_row_number"        integer,
  "card_holder"              text,
  "masked_card_number"       text,
  "customer_number"          text,
  "card_product"             text,
  -- Deduplication & provenance
  "import_fingerprint"       text NOT NULL,
  "row_fingerprint"          text NOT NULL,
  "key"                      text,
  "key_desc"                 text,
  "unique_row"               boolean DEFAULT false,
  "imported_at"              timestamp NOT NULL DEFAULT now()
);--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "dkb_mm_acc_tx_date_idx"
  ON "source_csv_dkb_mm" ("account_id", "transaction_date");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "dkb_mm_acc_amt_idx"
  ON "source_csv_dkb_mm" ("account_id", "billing_amount");--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- 4. Unique constraints (idempotency)
--    (user_id, import_fingerprint) – spec §A9 uniqueness constraint
--    (user_id, key)               – legacy compat
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE UNIQUE INDEX "dkb_mm_user_fingerprint_idx"
    ON "source_csv_dkb_mm" ("user_id", "import_fingerprint");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  CREATE UNIQUE INDEX "dkb_mm_user_key_idx"
    ON "source_csv_dkb_mm" ("user_id", "key");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;
