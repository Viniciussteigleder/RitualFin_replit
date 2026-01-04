-- =====================================================
-- Migration 005: Add Recurrence Tracking Fields
-- =====================================================
-- Adds fields to support recurrence detection and grouping
-- Required for: Calendar projections, weekly/monthly rituals
-- =====================================================

-- Add recurrence fields to transactions
ALTER TABLE transactions
  ADD COLUMN is_recurrent BOOLEAN DEFAULT false,
  ADD COLUMN recurrence_pattern TEXT,
  ADD COLUMN recurrence_day_of_month INTEGER,
  ADD COLUMN recurrence_group_id VARCHAR;

COMMENT ON COLUMN transactions.is_recurrent IS
  'True if transaction is part of a recurring pattern (e.g., Netflix monthly, rent)';

COMMENT ON COLUMN transactions.recurrence_pattern IS
  'Pattern type: monthly, weekly, annual, or custom description';

COMMENT ON COLUMN transactions.recurrence_day_of_month IS
  'Typical day of month for monthly recurrences (1-31). NULL for non-monthly.';

COMMENT ON COLUMN transactions.recurrence_group_id IS
  'Groups related recurring transactions together (e.g., all Netflix payments)';

-- Add index for recurrence queries
CREATE INDEX idx_transactions_recurrence
  ON transactions(user_id, is_recurrent, recurrence_pattern)
  WHERE is_recurrent = true;

-- Add index for recurrence groups
CREATE INDEX idx_transactions_recurrence_group
  ON transactions(recurrence_group_id)
  WHERE recurrence_group_id IS NOT NULL;

-- Update calendar_events to support better recurrence tracking
ALTER TABLE calendar_events
  ADD COLUMN recurrence_type TEXT, -- 'monthly', 'weekly', 'annual'
  ADD COLUMN recurrence_day_of_month INTEGER,
  ADD COLUMN recurrence_day_of_week INTEGER, -- 0-6 for Sunday-Saturday
  ADD COLUMN is_automatic BOOLEAN DEFAULT false, -- true if auto-detected from transactions
  ADD COLUMN linked_transaction_id VARCHAR;

COMMENT ON COLUMN calendar_events.recurrence_type IS
  'Type of recurrence: monthly, weekly, annual, custom';

COMMENT ON COLUMN calendar_events.recurrence_day_of_month IS
  'For monthly events: typical day of month (1-31)';

COMMENT ON COLUMN calendar_events.recurrence_day_of_week IS
  'For weekly events: day of week (0=Sunday, 6=Saturday)';

COMMENT ON COLUMN calendar_events.is_automatic IS
  'True if this event was auto-created from recurring transaction pattern';

COMMENT ON COLUMN calendar_events.linked_transaction_id IS
  'If auto-created, links back to the transaction that triggered it';

-- Verify
SELECT
  'Recurrence tracking fields added' as status,
  COUNT(*) as transactions_count
FROM transactions;
