-- Upload diagnostics for Sparkasse imports
-- Created: 2026-01-01

CREATE TABLE IF NOT EXISTS upload_diagnostics (
  upload_attempt_id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id varchar REFERENCES uploads(id) ON DELETE SET NULL,
  user_id varchar NOT NULL REFERENCES users(id),
  source text NOT NULL,
  filename text NOT NULL,
  mime_type text,
  size_bytes integer NOT NULL,
  encoding_used text,
  delimiter_used text,
  header_found jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_missing jsonb NOT NULL DEFAULT '[]'::jsonb,
  rows_total integer NOT NULL DEFAULT 0,
  rows_preview jsonb NOT NULL DEFAULT '[]'::jsonb,
  stage text,
  error_code text,
  error_message text,
  error_details jsonb,
  stacktrace text,
  created_at timestamp NOT NULL DEFAULT now()
);
