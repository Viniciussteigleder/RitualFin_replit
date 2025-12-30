-- Critical Performance Indexes
-- Created: 2025-12-28
-- Fase 0: Diagnóstico e Estabilização

-- Index 1: Dashboard queries (monthly aggregations)
-- Query: SELECT * FROM transactions WHERE user_id = ? AND payment_date >= ? AND payment_date < ?
CREATE INDEX IF NOT EXISTS idx_transactions_user_payment_date
ON transactions(user_id, payment_date DESC);

-- Index 2: Dashboard queries with filters (exclude_from_budget, internal_transfer)
-- Query: WHERE user_id = ? AND exclude_from_budget = false AND internal_transfer = false AND payment_date >= ?
CREATE INDEX IF NOT EXISTS idx_transactions_user_budget_date
ON transactions(user_id, exclude_from_budget, internal_transfer, payment_date DESC);

-- Index 3: Rules matching (priority-based)
-- Query: SELECT * FROM rules WHERE user_id = ? ORDER BY priority DESC
CREATE INDEX IF NOT EXISTS idx_rules_user_priority
ON rules(user_id, priority DESC);

-- Index 4: Upload history
-- Query: SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_uploads_user_created
ON uploads(user_id, created_at DESC);

-- Index 5: Confirm queue (needs_review filter)
-- Query: SELECT * FROM transactions WHERE user_id = ? AND needs_review = true
CREATE INDEX IF NOT EXISTS idx_transactions_user_needs_review
ON transactions(user_id, needs_review)
WHERE needs_review = true;

-- Note: transactions.key already has unique constraint, which creates an index automatically
