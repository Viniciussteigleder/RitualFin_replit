#!/usr/bin/env python3
"""
Generate SQL seed files from extracted JSON data
"""

import json
import sys

def escape_sql(value):
    """Escape single quotes for SQL"""
    if value is None or value == 'None':
        return 'NULL'
    return f"'{str(value).replace(chr(39), chr(39)+chr(39))}'"

def generate_taxonomy_seed():
    """Generate taxonomy seed SQL from /tmp/categorias.json"""

    with open('/tmp/categorias.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Skip header row
    rows = data[1:]

    sql = """-- =====================================================
-- RitualFin Taxonomy Seed (109 categories N1-N2-N3)
-- =====================================================
-- Generated from docs/Feedback_user/RitualFin-categorias-alias.xlsx
-- Run after: 001_complete_reset_and_schema.sql
-- =====================================================

-- Get demo user ID (create if not exists)
DO $$
DECLARE
  demo_user_id VARCHAR;
BEGIN
  SELECT id INTO demo_user_id FROM users WHERE username = 'demo';

  IF demo_user_id IS NULL THEN
    INSERT INTO users (username, password)
    VALUES ('demo', 'demo')
    RETURNING id INTO demo_user_id;
  END IF;

  -- Store in temp for use in subsequent statements
  CREATE TEMP TABLE IF NOT EXISTS temp_vars (
    var_name TEXT PRIMARY KEY,
    var_value TEXT
  );
  DELETE FROM temp_vars WHERE var_name = 'demo_user_id';
  INSERT INTO temp_vars (var_name, var_value) VALUES ('demo_user_id', demo_user_id);
END $$;

"""

    # Build hierarchy
    level1_map = {}
    level2_map = {}
    leaf_data = []

    for row in rows:
        if not row or len(row) < 9:
            continue

        app_classificacao = row[0] if len(row) > 0 else None
        nivel1 = row[1] if len(row) > 1 else None
        nivel2 = row[2] if len(row) > 2 else None
        nivel3 = row[3] if len(row) > 3 else None
        key_words = row[4] if len(row) > 4 else None
        key_words_neg = row[5] if len(row) > 5 else None
        receita_despesa = row[6] if len(row) > 6 else None
        fixo_variavel = row[7] if len(row) > 7 else None
        recorrente = row[8] if len(row) > 8 else None

        if not nivel1 or not nivel2 or not nivel3:
            continue

        # Normalize recorrente
        recorrente_norm = 'Sim' if recorrente == 'Sim' else 'Não'

        # Track unique level1
        if nivel1 not in level1_map:
            level1_map[nivel1] = len(level1_map)

        # Track unique level2 per level1
        level2_key = f"{nivel1}::{nivel2}"
        if level2_key not in level2_map:
            level2_map[level2_key] = {
                'nivel1': nivel1,
                'nivel2': nivel2,
                'recorrente': recorrente_norm,
                'fixo_variavel': fixo_variavel,
                'receita_despesa': receita_despesa
            }

        # Store leaf
        leaf_data.append({
            'nivel1': nivel1,
            'nivel2': nivel2,
            'nivel3': nivel3,
            'key_words': key_words,
            'key_words_neg': key_words_neg,
            'recorrente': recorrente_norm,
            'fixo_variavel': fixo_variavel,
            'receita_despesa': receita_despesa
        })

    # Generate Level 1 inserts
    sql += "\n-- =====================================================\n"
    sql += "-- Level 1 Categories (Nivel_1_PT)\n"
    sql += "-- =====================================================\n\n"

    for nivel1 in sorted(level1_map.keys()):
        sql += f"""INSERT INTO taxonomy_level_1 (user_id, nivel_1_pt)
SELECT var_value, {escape_sql(nivel1)}
FROM temp_vars WHERE var_name = 'demo_user_id'
ON CONFLICT DO NOTHING;

"""

    # Generate Level 2 inserts
    sql += "\n-- =====================================================\n"
    sql += "-- Level 2 Categories (Nivel_2_PT)\n"
    sql += "-- =====================================================\n\n"

    for level2_key in sorted(level2_map.keys()):
        l2 = level2_map[level2_key]
        sql += f"""INSERT INTO taxonomy_level_2 (user_id, level_1_id, nivel_2_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl1.level_1_id,
  {escape_sql(l2['nivel2'])},
  {escape_sql(l2['recorrente'])},
  {escape_sql(l2['fixo_variavel'])},
  {escape_sql(l2['receita_despesa'])}
FROM temp_vars tv
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl1.user_id = tv.var_value
  AND tl1.nivel_1_pt = {escape_sql(l2['nivel1'])}
ON CONFLICT DO NOTHING;

"""

    # Generate Leaf inserts with rules
    sql += "\n-- =====================================================\n"
    sql += "-- Level 3 Categories (Leaves) + Rules\n"
    sql += "-- =====================================================\n\n"

    for leaf in leaf_data:
        # Insert leaf
        sql += f"""-- Leaf: {leaf['nivel1']} > {leaf['nivel2']} > {leaf['nivel3']}
INSERT INTO taxonomy_leaf (user_id, level_2_id, nivel_3_pt, recorrente_default, fixo_variavel_default, receita_despesa_default)
SELECT
  tv.var_value,
  tl2.level_2_id,
  {escape_sql(leaf['nivel3'])},
  {escape_sql(leaf['recorrente'])},
  {escape_sql(leaf['fixo_variavel'])},
  {escape_sql(leaf['receita_despesa'])}
FROM temp_vars tv
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl2.user_id = tv.var_value
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = {escape_sql(leaf['nivel1'])}
  AND tl2.nivel_2_pt = {escape_sql(leaf['nivel2'])}
ON CONFLICT DO NOTHING;

"""

        # Insert rule if keywords exist
        if leaf['key_words'] and str(leaf['key_words']).strip() and leaf['key_words'] != 'None':
            sql += f"""-- Rule for: {leaf['nivel3']}
INSERT INTO rules (user_id, name, leaf_id, key_words, key_words_negative, priority, strict, active)
SELECT
  tv.var_value,
  {escape_sql(f"{leaf['nivel3']} - Auto")},
  tl.leaf_id,
  {escape_sql(leaf['key_words'])},
  {escape_sql(leaf['key_words_neg']) if leaf['key_words_neg'] and leaf['key_words_neg'] != 'None' else 'NULL'},
  500,
  false,
  true
FROM temp_vars tv
CROSS JOIN taxonomy_leaf tl
CROSS JOIN taxonomy_level_2 tl2
CROSS JOIN taxonomy_level_1 tl1
WHERE tv.var_name = 'demo_user_id'
  AND tl.user_id = tv.var_value
  AND tl.level_2_id = tl2.level_2_id
  AND tl2.level_1_id = tl1.level_1_id
  AND tl1.nivel_1_pt = {escape_sql(leaf['nivel1'])}
  AND tl2.nivel_2_pt = {escape_sql(leaf['nivel2'])}
  AND tl.nivel_3_pt = {escape_sql(leaf['nivel3'])}
ON CONFLICT DO NOTHING;

"""

    sql += """
-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT
  'Level 1 Count' as metric,
  COUNT(*) as count
FROM taxonomy_level_1
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id')
UNION ALL
SELECT
  'Level 2 Count',
  COUNT(*)
FROM taxonomy_level_2
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id')
UNION ALL
SELECT
  'Level 3 (Leaf) Count',
  COUNT(*)
FROM taxonomy_leaf
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id')
UNION ALL
SELECT
  'Rules Count',
  COUNT(*)
FROM rules
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id');
"""

    return sql

def generate_alias_seed():
    """Generate alias seed SQL from /tmp/alias.json"""

    with open('/tmp/alias.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Skip header row
    rows = data[1:]

    sql = """-- =====================================================
-- RitualFin Merchant Aliases Seed (1000 merchants)
-- =====================================================
-- Generated from docs/Feedback_user/RitualFin-categorias-alias.xlsx
-- Run after: 002_seed_taxonomy.sql
-- =====================================================

-- Get demo user ID
DO $$
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS temp_vars (
    var_name TEXT PRIMARY KEY,
    var_value TEXT
  );
  DELETE FROM temp_vars WHERE var_name = 'demo_user_id';
  INSERT INTO temp_vars (var_name, var_value)
  SELECT 'demo_user_id', id FROM users WHERE username = 'demo' LIMIT 1;
END $$;

-- =====================================================
-- Merchant Aliases
-- =====================================================

"""

    count = 0
    for row in rows:
        if not row or len(row) < 2:
            continue

        alias_desc = row[0] if len(row) > 0 else None
        key_words_alias = row[1] if len(row) > 1 else None
        url_logo = row[2] if len(row) > 2 else None

        if not alias_desc or not key_words_alias:
            continue

        sql += f"""INSERT INTO alias_assets (user_id, alias_desc, key_words_alias, url_icon_internet)
SELECT
  var_value,
  {escape_sql(alias_desc)},
  {escape_sql(key_words_alias)},
  {escape_sql(url_logo)}
FROM temp_vars
WHERE var_name = 'demo_user_id'
ON CONFLICT (user_id, alias_desc) DO UPDATE SET
  key_words_alias = EXCLUDED.key_words_alias,
  url_icon_internet = EXCLUDED.url_icon_internet,
  updated_at = NOW();

"""
        count += 1

    sql += f"""
-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT
  'Aliases Count' as metric,
  COUNT(*) as count
FROM alias_assets
WHERE user_id = (SELECT var_value FROM temp_vars WHERE var_name = 'demo_user_id');

-- Expected: {count} aliases
"""

    return sql

if __name__ == '__main__':
    print("Generating taxonomy seed SQL...")
    taxonomy_sql = generate_taxonomy_seed()
    with open('/home/user/RitualFin_replit/db/migrations/002_seed_taxonomy.sql', 'w', encoding='utf-8') as f:
        f.write(taxonomy_sql)
    print("✅ Created: db/migrations/002_seed_taxonomy.sql")

    print("\nGenerating alias seed SQL...")
    alias_sql = generate_alias_seed()
    with open('/home/user/RitualFin_replit/db/migrations/003_seed_aliases.sql', 'w', encoding='utf-8') as f:
        f.write(alias_sql)
    print("✅ Created: db/migrations/003_seed_aliases.sql")

    print("\n✅ All SQL migrations generated successfully!")
    print("\nTo apply:")
    print("1. Connect to Supabase SQL Editor")
    print("2. Run 001_complete_reset_and_schema.sql")
    print("3. Run 002_seed_taxonomy.sql")
    print("4. Run 003_seed_aliases.sql")
