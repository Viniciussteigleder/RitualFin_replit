# Step-by-Step: Reset Supabase Database & Seed Data

## Overview
These instructions will completely reset your Supabase database and seed it with:
- ✅ 109 categories (3-level hierarchy N1→N2→N3)
- ✅ ~60-70 auto-generated rules from keywords
- ✅ 1000 merchant aliases with logo URLs
- ✅ Recurrence tracking for monthly/weekly transactions
- ✅ Reporting views excluding Internal transactions
- ✅ Demo user (username: `demo`, password: `demo`)

**Time required:** ~5 minutes
**Data loss:** ⚠️ ALL existing data will be DELETED

---

## Quick Method: Run All Migrations at Once

**Recommended for clean installations:**

1. Go to https://supabase.com/dashboard → SQL Editor
2. Open this file on your computer: `db/migrations/000_RUN_THIS_FIRST.sql`
3. Copy the ENTIRE file contents
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. Wait ~60 seconds for all 7 migrations to complete
7. Jump to Step 6 (Verify Database State)

**Note:** If you encounter errors or need more control, use the detailed step-by-step method below.

---

## Detailed Step-by-Step Method

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your RitualFin project
4. Click **"SQL Editor"** in the left sidebar
5. Click **"New query"** button

---

### Step 2: Run Schema Reset Migration

1. Open this file on your computer:
   ```
   db/migrations/001_complete_reset_and_schema.sql
   ```

2. **Copy the ENTIRE file contents** (474 lines)

3. **Paste** into Supabase SQL Editor

4. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

5. **Wait** for completion (~10-15 seconds)

6. **Verify** you see:
   ```
   Success. No rows returned
   ```

**What this does:**
- Drops all existing tables and enums
- Recreates entire schema from scratch
- Creates all indexes

---

## Step 3: Seed Taxonomy Data

1. Open this file on your computer:
   ```
   db/migrations/002_seed_taxonomy.sql
   ```

2. **Copy the ENTIRE file contents** (5363 lines)

3. **Paste** into a new Supabase SQL Editor query

4. Click **"Run"**

5. **Wait** for completion (~30-45 seconds)

6. **Verify** you see results like:
   ```
   Level 1 Count    12
   Level 2 Count    30
   Level 3 (Leaf) Count    109
   Rules Count    67
   ```

**What this does:**
- Creates demo user
- Seeds 12 top-level categories (Alimentação, Assinaturas, etc.)
- Seeds ~30 mid-level categories
- Seeds 109 specific categories (leaves)
- Auto-creates ~60-70 rules from keywords

---

### Step 4: Seed Merchant Aliases

1. Open this file on your computer:
   ```
   db/migrations/003_seed_aliases.sql
   ```

2. **Copy the ENTIRE file contents** (866 lines)

3. **Paste** into a new Supabase SQL Editor query

4. Click **"Run"**

5. **Wait** for completion (~15-20 seconds)

6. **Verify** you see:
   ```
   Aliases Count    1000
   ```

**What this does:**
- Seeds 1000 merchant aliases
- Includes normalized merchant names
- Includes logo URLs from Wikipedia/official sources

---

### Step 5: Add key_desc Documentation

1. Open this file: `db/migrations/004_key_desc_documentation.sql`
2. Copy and paste into Supabase SQL Editor
3. Click **"Run"**
4. Wait ~2 seconds

**What this does:**
- Documents key_desc derivation logic for Sparkasse, Amex, M&M CSVs
- Documents keyword matching rules (semicolon-delimited, contains-match)
- No schema changes (documentation only)

---

### Step 6: Add Recurrence Tracking

1. Open this file: `db/migrations/005_add_recurrence_tracking.sql`
2. Copy and paste into Supabase SQL Editor
3. Click **"Run"**
4. Wait ~5 seconds

**What this does:**
- Adds recurrence fields to transactions (is_recurrent, pattern, day_of_month)
- Adds recurrence fields to calendar_events
- Creates indexes for recurrence queries

---

### Step 7: Fix Category References

1. Open this file: `db/migrations/006_fix_category_references.sql`
2. Copy and paste into Supabase SQL Editor
3. Click **"Run"**
4. Wait ~5 seconds

**What this does:**
- Adds leaf_id references to budgets, calendar_events, category_goals
- Creates helper function get_category_hierarchy(leaf_id)
- Enables hierarchical category queries

---

### Step 8: Create Reporting Views

1. Open this file: `db/migrations/007_reporting_views_and_indexes.sql`
2. Copy and paste into Supabase SQL Editor
3. Click **"Run"**
4. Wait ~10 seconds

**What this does:**
- Creates v_reportable_transactions (excludes Internal)
- Creates v_monthly_dashboard for KPIs
- Creates v_category_spending_monthly
- Adds helper functions: get_week_spending, get_budget_vs_actual, get_upcoming_commitments
- Creates indexes for performance

---

## Step 9: Verify Database State

Run this verification query in Supabase SQL Editor:

```sql
SELECT
  'Demo User' as entity,
  username,
  id
FROM users
WHERE username = 'demo'
UNION ALL
SELECT
  'Level 1 Categories' as entity,
  CAST(COUNT(*) AS TEXT) as count,
  '' as id
FROM taxonomy_level_1
WHERE user_id = (SELECT id FROM users WHERE username = 'demo')
UNION ALL
SELECT
  'Level 2 Categories',
  CAST(COUNT(*) AS TEXT),
  ''
FROM taxonomy_level_2
WHERE user_id = (SELECT id FROM users WHERE username = 'demo')
UNION ALL
SELECT
  'Level 3 Categories',
  CAST(COUNT(*) AS TEXT),
  ''
FROM taxonomy_leaf
WHERE user_id = (SELECT id FROM users WHERE username = 'demo')
UNION ALL
SELECT
  'Rules',
  CAST(COUNT(*) AS TEXT),
  ''
FROM rules
WHERE user_id = (SELECT id FROM users WHERE username = 'demo')
UNION ALL
SELECT
  'Merchant Aliases',
  CAST(COUNT(*) AS TEXT),
  ''
FROM alias_assets
WHERE user_id = (SELECT id FROM users WHERE username = 'demo');
```

**Expected results:**
```
Demo User            demo        [uuid]
Level 1 Categories   12
Level 2 Categories   ~30
Level 3 Categories   109
Rules                ~60-70
Merchant Aliases     1000
```

---

## Step 10: Restart Render Backend

After database reset, restart your backend to clear any cached connections:

1. Go to https://dashboard.render.com
2. Select your RitualFin backend service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
   OR
   Click **"Restart Service"** (if available)

4. Wait for deploy/restart to complete (~2-3 minutes)

5. **Verify** backend is healthy:
   - Check logs for "serving on port XXXX"
   - No database connection errors

---

## Step 11: Test in UI

1. Open your RitualFin app URL (Vercel deployment)

2. **Login** with demo credentials:
   - Username: `demo`
   - Password: `demo`

3. **Test Rules Page:**
   - Navigate to Rules page
   - Should show ~60-70 rules
   - Try creating a new rule WITHOUT keywords (should work!)

4. **Test CSV Upload:**
   - Go to Uploads page
   - Upload one of the test CSVs from `docs/Feedback_user/CSV_original/`
   - Should parse successfully
   - Check Confirm Queue for pending items

5. **Test Confirm Queue:**
   - Go to Confirm Queue
   - Should show transactions needing review
   - Confirm some items
   - Verify they move to Transactions

6. **Test Dashboard:**
   - Navigate to Dashboard
   - Should show spending overview
   - Verify "Internal" transactions are excluded from totals

---

## Troubleshooting

### "relation X does not exist"
- You likely skipped Step 2 (schema reset)
- Re-run `001_complete_reset_and_schema.sql`

### "user demo already exists"
- Normal if you re-run seed scripts
- The `ON CONFLICT DO NOTHING` will skip existing records

### "No rows returned" but expected counts
- Queries ran successfully but returned no data
- Check you're running Step 3 & 4 AFTER Step 2

### Backend still showing errors
- Clear browser cache
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Restart Render backend again

---

## Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `000_RUN_THIS_FIRST.sql` | 60 | Master runner (runs all 7 migrations) |
| `001_complete_reset_and_schema.sql` | 474 | Drop/create all tables and enums |
| `002_seed_taxonomy.sql` | 5363 | Seed 109 categories + auto-generate rules |
| `003_seed_aliases.sql` | 866 | Seed 1000 merchant aliases with logos |
| `004_key_desc_documentation.sql` | 118 | Document key_desc derivation logic |
| `005_add_recurrence_tracking.sql` | 65 | Add recurrence fields for patterns |
| `006_fix_category_references.sql` | 94 | Add leaf_id references + helper function |
| `007_reporting_views_and_indexes.sql` | 303 | Create views/indexes excluding Internal |

---

## Summary

After completing these steps, you will have:
- ✅ Clean database with latest schema
- ✅ Keywords OPTIONAL in rules
- ✅ 109 categories ready for categorization (N1→N2→N3 hierarchy)
- ✅ 1000 merchant aliases for auto-classification
- ✅ ~60-70 rules to jumpstart auto-categorization
- ✅ Recurrence tracking for monthly/weekly transactions
- ✅ Reporting views that automatically exclude Internal transactions
- ✅ Budget vs actual tracking functions
- ✅ Calendar week/month aggregation functions
- ✅ Demo user ready to use

**Next:** Upload your real CSVs and start categorizing!
