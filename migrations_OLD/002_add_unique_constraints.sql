-- Add Unique Constraints
-- Created: 2025-12-28
-- Fase 1: Categorias 3 Níveis + Data Integrity

-- 1. Budgets: Prevent duplicate budget for same category in same month
CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_user_month_category
ON budgets(user_id, month, category_1);

-- 2. Goals: Prevent multiple goals for same month
CREATE UNIQUE INDEX IF NOT EXISTS idx_goals_user_month
ON goals(user_id, month);

-- 3. Category Goals: Prevent duplicate category in same goal
CREATE UNIQUE INDEX IF NOT EXISTS idx_category_goals_goal_category
ON category_goals(goal_id, category_1);
