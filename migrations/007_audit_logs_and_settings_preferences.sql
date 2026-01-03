ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'pt-BR',
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS fiscal_region text NOT NULL DEFAULT 'Portugal/PT',
  ADD COLUMN IF NOT EXISTS notify_import_status boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_review_queue boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_monthly_report boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS audit_logs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar REFERENCES users(id),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  status text NOT NULL DEFAULT 'success',
  message text,
  metadata jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);
