-- =====================================================
-- RitualFin Complete Database Reset & Schema Creation
-- =====================================================
-- WARNING: This will DROP ALL DATA and recreate from scratch
-- Run this ONLY when you want a clean slate
-- =====================================================

-- Drop all existing tables (cascade to handle dependencies)
DROP TABLE IF EXISTS upload_diagnostics CASCADE;
DROP TABLE IF EXISTS upload_errors CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS rules CASCADE;
DROP TABLE IF EXISTS alias_assets CASCADE;
DROP TABLE IF EXISTS key_desc_map CASCADE;
DROP TABLE IF EXISTS app_category_leaf CASCADE;
DROP TABLE IF EXISTS app_category CASCADE;
DROP TABLE IF EXISTS taxonomy_leaf CASCADE;
DROP TABLE IF EXISTS taxonomy_level_2 CASCADE;
DROP TABLE IF EXISTS taxonomy_level_1 CASCADE;
DROP TABLE IF EXISTS merchant_icons CASCADE;
DROP TABLE IF EXISTS merchant_descriptions CASCADE;
DROP TABLE IF EXISTS merchant_metadata CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS ai_usage_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS rituals CASCADE;
DROP TABLE IF EXISTS category_goals CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS event_occurrences CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS transaction_classified_by CASCADE;
DROP TYPE IF EXISTS transaction_source CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS upload_status CASCADE;
DROP TYPE IF EXISTS category_1 CASCADE;
DROP TYPE IF EXISTS fix_var CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

-- =====================================================
-- CREATE ENUMS
-- =====================================================

CREATE TYPE transaction_type AS ENUM ('Despesa', 'Receita');
CREATE TYPE fix_var AS ENUM ('Fixo', 'Variável');
CREATE TYPE category_1 AS ENUM (
  'Receitas', 'Moradia', 'Mercado', 'Compras Online',
  'Transporte', 'Saúde', 'Lazer', 'Viagem', 'Roupas',
  'Tecnologia', 'Alimentação', 'Energia', 'Internet',
  'Educação', 'Presentes', 'Streaming', 'Academia',
  'Investimentos', 'Outros', 'Interno'
);
CREATE TYPE upload_status AS ENUM ('processing', 'ready', 'duplicate', 'error');
CREATE TYPE account_type AS ENUM ('credit_card', 'debit_card', 'bank_account', 'cash');
CREATE TYPE transaction_source AS ENUM ('Sparkasse', 'Amex', 'M&M');
CREATE TYPE transaction_classified_by AS ENUM ('AUTO_KEYWORDS', 'MANUAL', 'AI_SUGGESTION');
CREATE TYPE transaction_status AS ENUM ('FINAL', 'OPEN');

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Users
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Settings
CREATE TABLE settings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  auto_confirm_high_confidence BOOLEAN NOT NULL DEFAULT false,
  confidence_threshold INTEGER NOT NULL DEFAULT 80,
  language TEXT NOT NULL DEFAULT 'pt-BR',
  currency TEXT NOT NULL DEFAULT 'EUR',
  fiscal_region TEXT NOT NULL DEFAULT 'Portugal/PT',
  notify_import_status BOOLEAN NOT NULL DEFAULT true,
  notify_review_queue BOOLEAN NOT NULL DEFAULT true,
  notify_monthly_report BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Accounts
CREATE TABLE accounts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  account_number TEXT,
  icon TEXT DEFAULT 'credit-card',
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Budgets
CREATE TABLE budgets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE calendar_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount REAL,
  category TEXT,
  recurrence_rule TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Event Occurrences
CREATE TABLE event_occurrences (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  occurrence_date DATE NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Goals
CREATE TABLE goals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  total_goal REAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Category Goals
CREATE TABLE category_goals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id VARCHAR NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Rituals
CREATE TABLE rituals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Usage Logs
CREATE TABLE ai_usage_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  feature_tag TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_estimate_usd REAL,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Merchant Metadata
CREATE TABLE merchant_metadata (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  category TEXT,
  icon_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Merchant Descriptions
CREATE TABLE merchant_descriptions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_desc TEXT NOT NULL,
  alias_desc TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Merchant Icons
CREATE TABLE merchant_icons (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  icon_data TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TAXONOMY TABLES (N1-N2-N3 hierarchy)
-- =====================================================

-- Taxonomy Level 1 (Nivel_1_PT)
CREATE TABLE taxonomy_level_1 (
  level_1_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nivel_1_pt TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Taxonomy Level 2 (Nivel_2_PT)
CREATE TABLE taxonomy_level_2 (
  level_2_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_1_id VARCHAR NOT NULL REFERENCES taxonomy_level_1(level_1_id) ON DELETE CASCADE,
  nivel_2_pt TEXT NOT NULL,
  recorrente_default TEXT,
  fixo_variavel_default TEXT,
  receita_despesa_default TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Taxonomy Leaf (Nivel_3_PT)
CREATE TABLE taxonomy_leaf (
  leaf_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_2_id VARCHAR NOT NULL REFERENCES taxonomy_level_2(level_2_id) ON DELETE CASCADE,
  nivel_3_pt TEXT NOT NULL,
  recorrente_default TEXT,
  fixo_variavel_default TEXT,
  receita_despesa_default TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- App Category (UI layer)
CREATE TABLE app_category (
  app_cat_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- App Category Leaf (N-to-N mapping)
CREATE TABLE app_category_leaf (
  app_cat_id VARCHAR NOT NULL REFERENCES app_category(app_cat_id) ON DELETE CASCADE,
  leaf_id VARCHAR NOT NULL REFERENCES taxonomy_leaf(leaf_id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_cat_id, leaf_id)
);

-- =====================================================
-- RULES & ALIASES
-- =====================================================

-- Rules (Keywords optional now)
CREATE TABLE rules (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  keywords TEXT,
  type transaction_type,
  fix_var fix_var,
  category_1 category_1,
  category_2 TEXT,
  category_3 TEXT,
  priority INTEGER NOT NULL DEFAULT 500,
  strict BOOLEAN NOT NULL DEFAULT false,
  is_system BOOLEAN NOT NULL DEFAULT false,
  leaf_id VARCHAR,
  key_words TEXT,
  key_words_negative TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Key Desc Map (merchant normalization)
CREATE TABLE key_desc_map (
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_desc TEXT NOT NULL,
  simple_desc TEXT NOT NULL,
  alias_desc TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, key_desc)
);

-- Alias Assets (keywords + logo URLs)
CREATE TABLE alias_assets (
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alias_desc TEXT NOT NULL,
  key_words_alias TEXT NOT NULL,
  url_logo_internet TEXT,
  logo_local_path TEXT,
  logo_mime_type TEXT,
  logo_updated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, alias_desc)
);

-- =====================================================
-- TRANSACTIONS & UPLOADS
-- =====================================================

-- Transactions
CREATE TABLE transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_date TIMESTAMP NOT NULL,
  booking_date DATE,
  imported_at TIMESTAMP NOT NULL DEFAULT NOW(),
  account_source TEXT NOT NULL DEFAULT 'M&M',
  source transaction_source,
  status transaction_status DEFAULT 'FINAL',
  desc_raw TEXT NOT NULL,
  desc_norm TEXT NOT NULL,
  key_desc TEXT,
  simple_desc TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  foreign_amount REAL,
  foreign_currency TEXT,
  exchange_rate REAL,
  type transaction_type,
  fix_var fix_var,
  category_1 category_1,
  category_2 TEXT,
  category_3 TEXT,
  internal_transfer BOOLEAN NOT NULL DEFAULT false,
  exclude_from_budget BOOLEAN NOT NULL DEFAULT false,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  manual_override BOOLEAN NOT NULL DEFAULT false,
  confidence INTEGER,
  classified_by transaction_classified_by,
  rule_id_applied VARCHAR,
  leaf_id VARCHAR,
  key TEXT NOT NULL UNIQUE,
  upload_id VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Uploads
CREATE TABLE uploads (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  status upload_status NOT NULL DEFAULT 'processing',
  rows_total INTEGER NOT NULL DEFAULT 0,
  rows_imported INTEGER NOT NULL DEFAULT 0,
  month_affected TEXT,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Upload Errors
CREATE TABLE upload_errors (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id VARCHAR NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  error_message TEXT NOT NULL,
  raw_data TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Upload Diagnostics
CREATE TABLE upload_diagnostics (
  upload_attempt_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id VARCHAR REFERENCES uploads(id) ON DELETE SET NULL,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER NOT NULL,
  encoding_used TEXT,
  delimiter_used TEXT,
  date_format TEXT,
  amount_format TEXT,
  rows_total INTEGER,
  rows_imported INTEGER,
  rows_duplicate INTEGER,
  rows_skipped INTEGER,
  errors JSONB,
  warnings JSONB,
  headers_found JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_needs_review ON transactions(needs_review) WHERE needs_review = true;
CREATE INDEX idx_transactions_payment_date ON transactions(payment_date);
CREATE INDEX idx_transactions_upload_id ON transactions(upload_id);
CREATE INDEX idx_rules_user_id ON rules(user_id);
CREATE INDEX idx_rules_active ON rules(active) WHERE active = true;
CREATE INDEX idx_taxonomy_l1_user ON taxonomy_level_1(user_id);
CREATE INDEX idx_taxonomy_l2_user ON taxonomy_level_2(user_id);
CREATE INDEX idx_taxonomy_leaf_user ON taxonomy_leaf(user_id);
CREATE INDEX idx_alias_assets_user ON alias_assets(user_id);

-- =====================================================
-- COMPLETE
-- =====================================================
-- Schema creation complete
-- Next: Run 002_seed_taxonomy.sql to populate categories
-- Next: Run 003_seed_aliases.sql to populate merchant aliases
