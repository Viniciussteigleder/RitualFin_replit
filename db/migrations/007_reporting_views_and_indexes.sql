-- =====================================================
-- Migration 007: Reporting Views, Indexes & Helper Functions
-- =====================================================
-- Adds views and functions to support:
-- - Dashboard queries (exclude Interno)
-- - Calendar week/month aggregations
-- - Budget tracking
-- - Rituals tracking
-- =====================================================

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Dashboard: Monthly expenses by category (excluding Interno)
CREATE INDEX idx_transactions_monthly_expenses
  ON transactions(user_id, payment_date, type)
  WHERE type = 'Despesa' AND internal_transfer = false;

-- Calendar: Week/month grouping
CREATE INDEX idx_transactions_payment_date_only
  ON transactions(payment_date);

-- Budget tracking: Category spending
CREATE INDEX idx_transactions_leaf_category
  ON transactions(user_id, leaf_id, payment_date)
  WHERE leaf_id IS NOT NULL;

-- Internal transfer exclusion (critical for reporting)
CREATE INDEX idx_transactions_internal_transfer
  ON transactions(user_id, internal_transfer, exclude_from_budget)
  WHERE internal_transfer = true OR exclude_from_budget = true;

-- =====================================================
-- VIEW: Reportable Transactions (excludes Interno)
-- =====================================================

CREATE OR REPLACE VIEW v_reportable_transactions AS
SELECT
  t.*,
  tl.nivel_3_pt as category_level3,
  tl2.nivel_2_pt as category_level2,
  tl1.nivel_1_pt as category_level1
FROM transactions t
LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
LEFT JOIN taxonomy_level_2 tl2 ON tl.level_2_id = tl2.level_2_id
LEFT JOIN taxonomy_level_1 tl1 ON tl2.level_1_id = tl1.level_1_id
WHERE
  t.internal_transfer = false
  AND t.exclude_from_budget = false;

COMMENT ON VIEW v_reportable_transactions IS
  'All transactions excluding Interno (internal transfers). Use this for dashboard, budgets, analytics.';

-- =====================================================
-- VIEW: Monthly Dashboard Summary
-- =====================================================

CREATE OR REPLACE VIEW v_monthly_dashboard AS
SELECT
  user_id,
  DATE_TRUNC('month', payment_date) as month,
  SUM(CASE WHEN type = 'Despesa' THEN amount ELSE 0 END) as total_expenses,
  SUM(CASE WHEN type = 'Receita' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'Despesa' AND fix_var = 'Fixo' THEN amount ELSE 0 END) as fixed_expenses,
  SUM(CASE WHEN type = 'Despesa' AND fix_var = 'Variável' THEN amount ELSE 0 END) as variable_expenses,
  COUNT(DISTINCT CASE WHEN type = 'Despesa' THEN id END) as expense_count,
  COUNT(DISTINCT CASE WHEN type = 'Receita' THEN id END) as income_count
FROM v_reportable_transactions
GROUP BY user_id, DATE_TRUNC('month', payment_date);

COMMENT ON VIEW v_monthly_dashboard IS
  'Monthly summary for dashboard KPIs. Excludes Interno automatically.';

-- =====================================================
-- VIEW: Category Spending (Month)
-- =====================================================

CREATE OR REPLACE VIEW v_category_spending_monthly AS
SELECT
  user_id,
  DATE_TRUNC('month', payment_date) as month,
  category_level1,
  category_level2,
  category_level3,
  leaf_id,
  SUM(amount) as total_spent,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_transaction
FROM v_reportable_transactions
WHERE type = 'Despesa'
GROUP BY
  user_id,
  DATE_TRUNC('month', payment_date),
  category_level1,
  category_level2,
  category_level3,
  leaf_id;

COMMENT ON VIEW v_category_spending_monthly IS
  'Monthly spending by category (all 3 levels). Excludes Interno.';

-- =====================================================
-- FUNCTION: Get Week Spending (for Calendar week view)
-- =====================================================

CREATE OR REPLACE FUNCTION get_week_spending(
  p_user_id VARCHAR,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE (
  week_number INTEGER,
  week_start DATE,
  week_end DATE,
  total_expenses REAL,
  total_income REAL,
  transaction_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH week_bounds AS (
    SELECT
      EXTRACT(WEEK FROM d.day) as week_num,
      MIN(d.day) as week_start,
      MAX(d.day) as week_end
    FROM generate_series(
      DATE_TRUNC('month', make_date(p_year, p_month, 1)),
      DATE_TRUNC('month', make_date(p_year, p_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day',
      '1 day'::interval
    ) as d(day)
    GROUP BY EXTRACT(WEEK FROM d.day)
  )
  SELECT
    wb.week_num::INTEGER,
    wb.week_start,
    wb.week_end,
    COALESCE(SUM(CASE WHEN t.type = 'Despesa' THEN t.amount ELSE 0 END), 0)::REAL as total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'Receita' THEN t.amount ELSE 0 END), 0)::REAL as total_income,
    COUNT(t.id)::INTEGER as transaction_count
  FROM week_bounds wb
  LEFT JOIN v_reportable_transactions t
    ON t.user_id = p_user_id
    AND t.payment_date >= wb.week_start
    AND t.payment_date <= wb.week_end
  GROUP BY wb.week_num, wb.week_start, wb.week_end
  ORDER BY wb.week_start;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_week_spending IS
  'Returns spending summary per week for a given month. Excludes Interno.';

-- =====================================================
-- FUNCTION: Get Budget vs Actual (for dashboard)
-- =====================================================

CREATE OR REPLACE FUNCTION get_budget_vs_actual(
  p_user_id VARCHAR,
  p_month TEXT -- format: 'YYYY-MM'
)
RETURNS TABLE (
  category_level1 TEXT,
  category_level2 TEXT,
  category_level3 TEXT,
  leaf_id VARCHAR,
  budget_amount REAL,
  actual_spent REAL,
  remaining REAL,
  percent_used REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH month_spending AS (
    SELECT
      cs.leaf_id,
      cs.category_level1,
      cs.category_level2,
      cs.category_level3,
      cs.total_spent
    FROM v_category_spending_monthly cs
    WHERE cs.user_id = p_user_id
      AND TO_CHAR(cs.month, 'YYYY-MM') = p_month
  )
  SELECT
    COALESCE(ms.category_level1, tl1.nivel_1_pt),
    COALESCE(ms.category_level2, tl2.nivel_2_pt),
    COALESCE(ms.category_level3, tl.nivel_3_pt),
    COALESCE(b.leaf_id, ms.leaf_id),
    COALESCE(b.amount, 0)::REAL as budget_amount,
    COALESCE(ms.total_spent, 0)::REAL as actual_spent,
    (COALESCE(b.amount, 0) - COALESCE(ms.total_spent, 0))::REAL as remaining,
    (CASE
      WHEN COALESCE(b.amount, 0) > 0
      THEN (COALESCE(ms.total_spent, 0) / b.amount * 100)
      ELSE 0
    END)::REAL as percent_used
  FROM budgets b
  LEFT JOIN month_spending ms ON b.leaf_id = ms.leaf_id
  LEFT JOIN taxonomy_leaf tl ON b.leaf_id = tl.leaf_id
  LEFT JOIN taxonomy_level_2 tl2 ON tl.level_2_id = tl2.level_2_id
  LEFT JOIN taxonomy_level_1 tl1 ON tl2.level_1_id = tl1.level_1_id
  WHERE b.user_id = p_user_id
    AND b.month = p_month

  UNION ALL

  -- Include categories with spending but no budget
  SELECT
    ms.category_level1,
    ms.category_level2,
    ms.category_level3,
    ms.leaf_id,
    0::REAL as budget_amount,
    ms.total_spent,
    -ms.total_spent as remaining,
    999::REAL as percent_used
  FROM month_spending ms
  WHERE NOT EXISTS (
    SELECT 1 FROM budgets b
    WHERE b.user_id = p_user_id
      AND b.month = p_month
      AND b.leaf_id = ms.leaf_id
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_budget_vs_actual IS
  'Compares budgeted vs actual spending per category for a month. Excludes Interno.';

-- =====================================================
-- FUNCTION: Get Upcoming Commitments (next 7/14 days)
-- =====================================================

CREATE OR REPLACE FUNCTION get_upcoming_commitments(
  p_user_id VARCHAR,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  commitment_date DATE,
  title TEXT,
  amount REAL,
  category_level1 TEXT,
  category_level2 TEXT,
  category_level3 TEXT,
  is_recurrent BOOLEAN,
  source TEXT -- 'calendar_event' or 'recurring_transaction'
) AS $$
BEGIN
  RETURN QUERY
  -- Calendar events
  SELECT
    ce.start_date as commitment_date,
    ce.title,
    ce.amount,
    tl1.nivel_1_pt as category_level1,
    tl2.nivel_2_pt as category_level2,
    tl.nivel_3_pt as category_level3,
    (ce.recurrence_rule IS NOT NULL) as is_recurrent,
    'calendar_event'::TEXT as source
  FROM calendar_events ce
  LEFT JOIN taxonomy_leaf tl ON ce.leaf_id = tl.leaf_id
  LEFT JOIN taxonomy_level_2 tl2 ON tl.level_2_id = tl2.level_2_id
  LEFT JOIN taxonomy_level_1 tl1 ON tl2.level_1_id = tl1.level_1_id
  WHERE ce.user_id = p_user_id
    AND ce.start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days_ahead

  UNION ALL

  -- Projected recurring transactions (example: next expected occurrence)
  SELECT
    (CURRENT_DATE + ((t.recurrence_day_of_month - EXTRACT(DAY FROM CURRENT_DATE))::INTEGER || ' days')::INTERVAL)::DATE as commitment_date,
    t.simple_desc as title,
    t.amount,
    tl1.nivel_1_pt as category_level1,
    tl2.nivel_2_pt as category_level2,
    tl.nivel_3_pt as category_level3,
    true as is_recurrent,
    'recurring_transaction'::TEXT as source
  FROM transactions t
  LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
  LEFT JOIN taxonomy_level_2 tl2 ON tl.level_2_id = tl2.level_2_id
  LEFT JOIN taxonomy_level_1 tl1 ON tl2.level_1_id = tl1.level_1_id
  WHERE t.user_id = p_user_id
    AND t.is_recurrent = true
    AND t.recurrence_pattern = 'monthly'
    AND t.recurrence_day_of_month IS NOT NULL
    AND (CURRENT_DATE + ((t.recurrence_day_of_month - EXTRACT(DAY FROM CURRENT_DATE))::INTEGER || ' days')::INTERVAL)::DATE
      BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days_ahead

  ORDER BY commitment_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_upcoming_commitments IS
  'Returns expected commitments/expenses in next N days from calendar + recurring transactions.';

-- Verify
SELECT
  'Reporting views and functions created' as status,
  (SELECT COUNT(*) FROM v_reportable_transactions) as reportable_count,
  (SELECT COUNT(*) FROM transactions WHERE internal_transfer = true) as internal_count;
