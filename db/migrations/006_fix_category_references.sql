-- =====================================================
-- Migration 006: Fix Category References (TEXT → leaf_id)
-- =====================================================
-- Updates category references to use taxonomy leaf_id
-- instead of free-text categories
-- Required for: Hierarchical categorization, future flexibility
-- =====================================================

-- =====================================================
-- BUDGETS TABLE - Add leaf_id reference
-- =====================================================

-- Add new column
ALTER TABLE budgets
  ADD COLUMN leaf_id VARCHAR REFERENCES taxonomy_leaf(leaf_id) ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_budgets_leaf_id ON budgets(leaf_id);

COMMENT ON COLUMN budgets.category IS
  'DEPRECATED: Legacy text category. Use leaf_id instead for new records.';

COMMENT ON COLUMN budgets.leaf_id IS
  'Reference to taxonomy leaf (Nivel_3_PT). Preferred over category text.';

-- =====================================================
-- CALENDAR_EVENTS TABLE - Add leaf_id reference
-- =====================================================

-- Add new column
ALTER TABLE calendar_events
  ADD COLUMN leaf_id VARCHAR REFERENCES taxonomy_leaf(leaf_id) ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_calendar_events_leaf_id ON calendar_events(leaf_id);

COMMENT ON COLUMN calendar_events.category IS
  'DEPRECATED: Legacy text category. Use leaf_id instead for new records.';

COMMENT ON COLUMN calendar_events.leaf_id IS
  'Reference to taxonomy leaf (Nivel_3_PT). Preferred over category text.';

-- =====================================================
-- CATEGORY_GOALS TABLE - Add leaf_id reference
-- =====================================================

-- Add new column
ALTER TABLE category_goals
  ADD COLUMN leaf_id VARCHAR REFERENCES taxonomy_leaf(leaf_id) ON DELETE CASCADE;

-- Add index
CREATE INDEX idx_category_goals_leaf_id ON category_goals(leaf_id);

COMMENT ON COLUMN category_goals.category IS
  'DEPRECATED: Legacy text category. Use leaf_id instead for new records.';

COMMENT ON COLUMN category_goals.leaf_id IS
  'Reference to taxonomy leaf (Nivel_3_PT). Required for new records.';

-- =====================================================
-- ADD HELPER FUNCTION: Get category hierarchy
-- =====================================================

CREATE OR REPLACE FUNCTION get_category_hierarchy(p_leaf_id VARCHAR)
RETURNS TABLE (
  nivel_1_pt TEXT,
  nivel_2_pt TEXT,
  nivel_3_pt TEXT,
  leaf_id VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tl1.nivel_1_pt,
    tl2.nivel_2_pt,
    tl.nivel_3_pt,
    tl.leaf_id
  FROM taxonomy_leaf tl
  JOIN taxonomy_level_2 tl2 ON tl.level_2_id = tl2.level_2_id
  JOIN taxonomy_level_1 tl1 ON tl2.level_1_id = tl1.level_1_id
  WHERE tl.leaf_id = p_leaf_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_category_hierarchy IS
  'Helper function to get full N1-N2-N3 hierarchy from leaf_id';

-- Verify
SELECT
  'Category references updated to use leaf_id' as status,
  (SELECT COUNT(*) FROM budgets) as budgets_count,
  (SELECT COUNT(*) FROM calendar_events) as events_count,
  (SELECT COUNT(*) FROM category_goals) as goals_count;
