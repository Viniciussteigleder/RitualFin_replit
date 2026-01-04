# Database Migrations

## Quick Start - Complete Reset

**To reset and seed the database from scratch:**

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard)
2. Open your project
3. Click "SQL Editor" in sidebar
4. Create a new query
5. Copy **all contents** of `migrations/001_complete_reset_and_schema.sql`
6. Run it
7. Copy **all contents** of `migrations/002_seed_taxonomy.sql`
8. Run it
9. Copy **all contents** of `migrations/003_seed_aliases.sql`
10. Run it

**OR** if your Supabase supports `\i` includes, you can run just `000_RUN_THIS_FIRST.sql`.

## What Gets Created

### Schema
- All core tables (users, settings, accounts, etc.)
- Taxonomy tables (level_1, level_2, leaf)
- Rules table (with **keywords now OPTIONAL**)
- Alias assets table
- Transactions, uploads, and audit tables

### Seed Data
- **Demo user** (`username: demo`, `password: demo`)
- **12 Level 1** categories
- **~30 Level 2** subcategories
- **109 Level 3** specific categories
- **~60-70 rules** auto-generated from keywords
- **1000 merchant aliases** with logo URLs

## Verification Queries

After running migrations, verify with:

```sql
-- Check demo user exists
SELECT * FROM users WHERE username = 'demo';

-- Check taxonomy counts
SELECT
  (SELECT COUNT(*) FROM taxonomy_level_1) as level_1,
  (SELECT COUNT(*) FROM taxonomy_level_2) as level_2,
  (SELECT COUNT(*) FROM taxonomy_leaf) as level_3,
  (SELECT COUNT(*) FROM rules) as rules,
  (SELECT COUNT(*) FROM alias_assets) as aliases;
```

Expected results:
- level_1: ~12
- level_2: ~30
- level_3: 109
- rules: ~60-70
- aliases: 1000

## Files

- `000_RUN_THIS_FIRST.sql` - Master runner (if supported)
- `001_complete_reset_and_schema.sql` - Drop/create all tables
- `002_seed_taxonomy.sql` - Seed 109 categories + rules
- `003_seed_aliases.sql` - Seed 1000 merchant aliases
- `generate-seed-sql.py` - Script that generated seed files from JSON

## Important Notes

⚠️ **These migrations DROP ALL DATA**. Only run when you want a clean slate.

✅ **Keywords are now OPTIONAL** in rules table - you can create rules without keywords.

✅ **Internal transactions** are supported - stored in DB but excluded from analytics.

## Regenerating Seed Files

If you need to regenerate seed SQL from updated Excel data:

```bash
# 1. Extract new data from Excel to JSON
python3 extract-xlsx-to-json.py

# 2. Regenerate SQL files
python3 db/generate-seed-sql.py
```
