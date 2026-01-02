CREATE TABLE IF NOT EXISTS "import_runs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "dataset_name" text NOT NULL,
  "filename" text NOT NULL,
  "status" text DEFAULT 'previewed' NOT NULL,
  "reason_codes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "error_message" text,
  "detected_encoding" text,
  "detected_delimiter" text,
  "header_found" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "header_diff" jsonb,
  "row_error_samples" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "rows_total" integer DEFAULT 0 NOT NULL,
  "rows_valid" integer DEFAULT 0 NOT NULL,
  "canonical_csv" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "confirmed_at" timestamp
);

CREATE INDEX IF NOT EXISTS "import_runs_user_dataset_created_at_idx"
  ON "import_runs" ("user_id", "dataset_name", "created_at");
