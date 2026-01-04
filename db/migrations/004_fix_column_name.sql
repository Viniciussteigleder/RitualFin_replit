-- =====================================================
-- Fix Column Name: url_logo_internet → url_icon_internet
-- =====================================================
-- This migration fixes the column name to match the Excel source
-- Excel column: URL_icon_internet (not URL_logo_internet)
-- =====================================================

ALTER TABLE alias_assets
RENAME COLUMN url_logo_internet TO url_icon_internet;

-- Verify
SELECT
  'alias_assets column fixed' as status,
  COUNT(*) as total_aliases
FROM alias_assets
WHERE user_id = (SELECT id FROM users WHERE username = 'demo');
