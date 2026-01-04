-- =====================================================
-- RitualFin Complete Database Reset & Seed
-- =====================================================
-- This file runs ALL migrations in sequence:
-- 1. Drop and recreate schema
-- 2. Seed taxonomy (109 categories)
-- 3. Seed merchant aliases (1000 merchants)
-- 4. Document key_desc derivation logic
-- 5. Add recurrence tracking fields
-- 6. Fix category references (leaf_id)
-- 7. Create reporting views and indexes
-- =====================================================
-- WARNING: This DROPS ALL DATA and starts fresh
-- Only run this when you want a clean slate
-- =====================================================
--
-- TO USE:
-- 1. Copy entire contents of this file
-- 2. Go to Supabase SQL Editor (https://supabase.com/dashboard)
-- 3. Paste and run
-- 4. Wait for completion (~30-60 seconds)
-- 5. Verify counts at end
-- =====================================================

\echo '==================================================='
\echo 'RitualFin Database Reset & Seed - Starting...'
\echo '==================================================='

\echo 'Step 1/7: Dropping and recreating schema...'
\i 001_complete_reset_and_schema.sql

\echo 'Step 2/7: Seeding taxonomy (109 categories)...'
\i 002_seed_taxonomy.sql

\echo 'Step 3/7: Seeding merchant aliases (1000 entries)...'
\i 003_seed_aliases.sql

\echo 'Step 4/7: Documenting key_desc derivation logic...'
\i 004_key_desc_documentation.sql

\echo 'Step 5/7: Adding recurrence tracking fields...'
\i 005_add_recurrence_tracking.sql

\echo 'Step 6/7: Fixing category references (leaf_id)...'
\i 006_fix_category_references.sql

\echo 'Step 7/7: Creating reporting views and indexes...'
\i 007_reporting_views_and_indexes.sql

\echo '==================================================='
\echo 'Database reset complete!'
\echo '==================================================='
\echo 'Verification:'
SELECT 'Demo User' as entity, username, id FROM users WHERE username = 'demo'
UNION ALL
SELECT 'Level 1', CAST(COUNT(*) AS TEXT), '' FROM taxonomy_level_1 WHERE user_id = (SELECT id FROM users WHERE username = 'demo')
UNION ALL
SELECT 'Level 2', CAST(COUNT(*) AS TEXT), '' FROM taxonomy_level_2 WHERE user_id = (SELECT id FROM users WHERE username = 'demo')
UNION ALL
SELECT 'Level 3', CAST(COUNT(*) AS TEXT), '' FROM taxonomy_leaf WHERE user_id = (SELECT id FROM users WHERE username = 'demo')
UNION ALL
SELECT 'Rules', CAST(COUNT(*) AS TEXT), '' FROM rules WHERE user_id = (SELECT id FROM users WHERE username = 'demo')
UNION ALL
SELECT 'Aliases', CAST(COUNT(*) AS TEXT), '' FROM alias_assets WHERE user_id = (SELECT id FROM users WHERE username = 'demo');
