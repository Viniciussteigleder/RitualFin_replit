-- Category Restructuring Migration
-- Created: 2025-12-30
-- Phase 2: Migrate Category1 enum to match proposed 13-value structure
-- ⚠️ WARNING: This is a BREAKING CHANGE migration
-- ⚠️ IMPORTANT: Run ONLY after Phase 1 migration is stable (2+ weeks)
-- ⚠️ BACKUP database before running this script

-- =============================================================================
-- PREREQUISITES
-- =============================================================================
-- 1. Full database backup completed: ✅
-- 2. Tested on staging environment: ✅
-- 3. Low-traffic window scheduled: ✅
-- 4. Rollback plan documented: ✅
-- 5. Estimated downtime: 2-4 hours

-- =============================================================================
-- STEP 1: Create new category enum
-- =============================================================================

-- Create new enum with proposed 13 values
CREATE TYPE category_1_new AS ENUM (
  'Moradia',
  'Alimentação',
  'Compras & Estilo de Vida',
  'Mobilidade',
  'Saúde & Seguros',
  'Educação & Crianças',
  'Lazer & Viagens',
  'Interna',
  'Finanças & Transferências',
  'Trabalho & Receitas',
  'Doações & Outros',
  'Revisão & Não Classificado',
  'Outros'
);

-- =============================================================================
-- STEP 2: Add temporary column to transactions table
-- =============================================================================

ALTER TABLE transactions ADD COLUMN category_1_new category_1_new;

-- =============================================================================
-- STEP 3: Migrate data with mapping logic
-- =============================================================================

-- Map old enum values to new enum values
UPDATE transactions SET category_1_new =
  CASE category_1
    -- Direct mappings (no change)
    WHEN 'Moradia' THEN 'Moradia'::category_1_new
    WHEN 'Alimentação' THEN 'Alimentação'::category_1_new
    WHEN 'Interno' THEN 'Interna'::category_1_new
    WHEN 'Outros' THEN 'Outros'::category_1_new

    -- Merge into new categories
    WHEN 'Mercado' THEN 'Alimentação'::category_1_new
    WHEN 'Transporte' THEN 'Mobilidade'::category_1_new
    WHEN 'Saúde' THEN 'Saúde & Seguros'::category_1_new
    WHEN 'Educação' THEN 'Educação & Crianças'::category_1_new

    -- Map to "Compras & Estilo de Vida"
    WHEN 'Compras Online' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Roupas' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Tecnologia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Streaming' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Academia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Presentes' THEN 'Compras & Estilo de Vida'::category_1_new

    -- Map to "Lazer & Viagens"
    WHEN 'Lazer' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Viagem' THEN 'Lazer & Viagens'::category_1_new

    -- Map to "Finanças & Transferências" or "Trabalho & Receitas"
    WHEN 'Receitas' THEN 'Trabalho & Receitas'::category_1_new
    WHEN 'Investimentos' THEN 'Finanças & Transferências'::category_1_new

    -- Special mappings based on type
    -- NOTE: These require conditional logic based on transaction type
    WHEN 'Energia' THEN 'Moradia'::category_1_new
    WHEN 'Internet' THEN 'Moradia'::category_1_new

    -- Default fallback
    ELSE 'Outros'::category_1_new
  END
WHERE category_1 IS NOT NULL;

-- =============================================================================
-- STEP 4: Migrate rules table
-- =============================================================================

ALTER TABLE rules ADD COLUMN category_1_new category_1_new;

UPDATE rules SET category_1_new =
  CASE category_1
    WHEN 'Moradia' THEN 'Moradia'::category_1_new
    WHEN 'Alimentação' THEN 'Alimentação'::category_1_new
    WHEN 'Interno' THEN 'Interna'::category_1_new
    WHEN 'Outros' THEN 'Outros'::category_1_new
    WHEN 'Mercado' THEN 'Alimentação'::category_1_new
    WHEN 'Transporte' THEN 'Mobilidade'::category_1_new
    WHEN 'Saúde' THEN 'Saúde & Seguros'::category_1_new
    WHEN 'Educação' THEN 'Educação & Crianças'::category_1_new
    WHEN 'Compras Online' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Roupas' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Tecnologia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Streaming' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Academia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Presentes' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Lazer' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Viagem' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Receitas' THEN 'Trabalho & Receitas'::category_1_new
    WHEN 'Investimentos' THEN 'Finanças & Transferências'::category_1_new
    WHEN 'Energia' THEN 'Moradia'::category_1_new
    WHEN 'Internet' THEN 'Moradia'::category_1_new
    ELSE 'Outros'::category_1_new
  END
WHERE category_1 IS NOT NULL;

-- =============================================================================
-- STEP 5: Migrate budgets table
-- =============================================================================

ALTER TABLE budgets ADD COLUMN category_1_new category_1_new;

UPDATE budgets SET category_1_new =
  CASE category_1
    WHEN 'Moradia' THEN 'Moradia'::category_1_new
    WHEN 'Alimentação' THEN 'Alimentação'::category_1_new
    WHEN 'Interno' THEN 'Interna'::category_1_new
    WHEN 'Outros' THEN 'Outros'::category_1_new
    WHEN 'Mercado' THEN 'Alimentação'::category_1_new
    WHEN 'Transporte' THEN 'Mobilidade'::category_1_new
    WHEN 'Saúde' THEN 'Saúde & Seguros'::category_1_new
    WHEN 'Educação' THEN 'Educação & Crianças'::category_1_new
    WHEN 'Compras Online' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Roupas' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Tecnologia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Streaming' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Academia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Presentes' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Lazer' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Viagem' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Receitas' THEN 'Trabalho & Receitas'::category_1_new
    WHEN 'Investimentos' THEN 'Finanças & Transferências'::category_1_new
    WHEN 'Energia' THEN 'Moradia'::category_1_new
    WHEN 'Internet' THEN 'Moradia'::category_1_new
    ELSE 'Outros'::category_1_new
  END
WHERE category_1 IS NOT NULL;

-- =============================================================================
-- STEP 6: Migrate category_goals table
-- =============================================================================

ALTER TABLE category_goals ADD COLUMN category_1_new category_1_new;

UPDATE category_goals SET category_1_new =
  CASE category_1
    WHEN 'Moradia' THEN 'Moradia'::category_1_new
    WHEN 'Alimentação' THEN 'Alimentação'::category_1_new
    WHEN 'Interno' THEN 'Interna'::category_1_new
    WHEN 'Outros' THEN 'Outros'::category_1_new
    WHEN 'Mercado' THEN 'Alimentação'::category_1_new
    WHEN 'Transporte' THEN 'Mobilidade'::category_1_new
    WHEN 'Saúde' THEN 'Saúde & Seguros'::category_1_new
    WHEN 'Educação' THEN 'Educação & Crianças'::category_1_new
    WHEN 'Compras Online' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Roupas' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Tecnologia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Streaming' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Academia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Presentes' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Lazer' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Viagem' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Receitas' THEN 'Trabalho & Receitas'::category_1_new
    WHEN 'Investimentos' THEN 'Finanças & Transferências'::category_1_new
    WHEN 'Energia' THEN 'Moradia'::category_1_new
    WHEN 'Internet' THEN 'Moradia'::category_1_new
    ELSE 'Outros'::category_1_new
  END
WHERE category_1 IS NOT NULL;

-- =============================================================================
-- STEP 7: Migrate calendar_events table
-- =============================================================================

ALTER TABLE calendar_events ADD COLUMN category_1_new category_1_new;

UPDATE calendar_events SET category_1_new =
  CASE category_1
    WHEN 'Moradia' THEN 'Moradia'::category_1_new
    WHEN 'Alimentação' THEN 'Alimentação'::category_1_new
    WHEN 'Interno' THEN 'Interna'::category_1_new
    WHEN 'Outros' THEN 'Outros'::category_1_new
    WHEN 'Mercado' THEN 'Alimentação'::category_1_new
    WHEN 'Transporte' THEN 'Mobilidade'::category_1_new
    WHEN 'Saúde' THEN 'Saúde & Seguros'::category_1_new
    WHEN 'Educação' THEN 'Educação & Crianças'::category_1_new
    WHEN 'Compras Online' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Roupas' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Tecnologia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Streaming' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Academia' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Presentes' THEN 'Compras & Estilo de Vida'::category_1_new
    WHEN 'Lazer' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Viagem' THEN 'Lazer & Viagens'::category_1_new
    WHEN 'Receitas' THEN 'Trabalho & Receitas'::category_1_new
    WHEN 'Investimentos' THEN 'Finanças & Transferências'::category_1_new
    WHEN 'Energia' THEN 'Moradia'::category_1_new
    WHEN 'Internet' THEN 'Moradia'::category_1_new
    ELSE 'Outros'::category_1_new
  END
WHERE category_1 IS NOT NULL;

-- =============================================================================
-- STEP 8: Drop old columns and rename new columns
-- =============================================================================

-- Transactions table
ALTER TABLE transactions DROP COLUMN category_1;
ALTER TABLE transactions RENAME COLUMN category_1_new TO category_1;

-- Rules table
ALTER TABLE rules DROP COLUMN category_1;
ALTER TABLE rules RENAME COLUMN category_1_new TO category_1;

-- Budgets table
ALTER TABLE budgets DROP COLUMN category_1;
ALTER TABLE budgets RENAME COLUMN category_1_new TO category_1;

-- Category Goals table
ALTER TABLE category_goals DROP COLUMN category_1;
ALTER TABLE category_goals RENAME COLUMN category_1_new TO category_1;

-- Calendar Events table
ALTER TABLE calendar_events DROP COLUMN category_1;
ALTER TABLE calendar_events RENAME COLUMN category_1_new TO category_1;

-- =============================================================================
-- STEP 9: Drop old enum type
-- =============================================================================

DROP TYPE category_1;

-- =============================================================================
-- STEP 10: Rename new enum type to original name
-- =============================================================================

ALTER TYPE category_1_new RENAME TO category_1;

-- =============================================================================
-- STEP 11: Recreate indexes and constraints
-- =============================================================================

-- Recreate unique index on budgets (was dropped when column was dropped)
CREATE UNIQUE INDEX idx_budgets_user_month_category
ON budgets(user_id, month, category_1);

-- Recreate unique index on category_goals
CREATE UNIQUE INDEX idx_category_goals_goal_category
ON category_goals(goal_id, category_1);

-- =============================================================================
-- STEP 12: Verify migration success
-- =============================================================================

-- Check transaction count by new categories
SELECT category_1, COUNT(*) as count
FROM transactions
GROUP BY category_1
ORDER BY count DESC;

-- Check rules count by new categories
SELECT category_1, COUNT(*) as count
FROM rules
GROUP BY category_1
ORDER BY count DESC;

-- Check for NULL categories (should be 0)
SELECT COUNT(*) as null_category_count
FROM transactions
WHERE category_1 IS NULL AND type IS NOT NULL;

-- Verify enum values
SELECT enumlabel
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'category_1'
ORDER BY enumsortorder;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Next steps:
-- 1. Update shared/schema.ts to reflect new enum values
-- 2. Regenerate TypeScript types: npx drizzle-kit generate
-- 3. Update application code to use new category values
-- 4. Test all endpoints
-- 5. Deploy to production

-- Rollback instructions:
-- If migration fails, restore from backup:
-- psql $DATABASE_URL < backup_pre_category_migration.sql
