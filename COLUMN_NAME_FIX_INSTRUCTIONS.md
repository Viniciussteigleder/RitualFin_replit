# Column Name Fix - url_icon_internet

## Issue
I incorrectly named the column `url_logo_internet` instead of `url_icon_internet` to match your Excel source.

**Your Excel column:** `URL_icon_internet`
**What I created:** `url_logo_internet` ❌
**Now fixed to:** `url_icon_internet` ✅

## If You Already Ran Migrations 001-003

Run this additional migration in Supabase SQL Editor:

**File:** `db/migrations/004_fix_column_name.sql`

```sql
ALTER TABLE alias_assets
RENAME COLUMN url_logo_internet TO url_icon_internet;
```

This will rename the column to match your Excel exactly.

## If You Haven't Run Migrations Yet

The fixed migrations are ready:
- ✅ `001_complete_reset_and_schema.sql` - Updated
- ✅ `002_seed_taxonomy.sql` - No changes needed
- ✅ `003_seed_aliases.sql` - Updated
- ✅ `004_fix_column_name.sql` - Not needed (skip this)

Just run migrations 001-003 as documented in `DEPLOY_INSTRUCTIONS_SUPABASE.md`.

## All Column Names Now Match Excel

| Excel Column | Database Column | Status |
|--------------|-----------------|--------|
| `Nivel_1_PT` | `nivel_1_pt` | ✅ Match |
| `Nivel_2_PT` | `nivel_2_pt` | ✅ Match |
| `Nivel_3_PT` | `nivel_3_pt` | ✅ Match |
| `Key_words` | `key_words` | ✅ Match |
| `Key_words_negative` | `key_words_negative` | ✅ Match |
| `Receita/Despesa` | `receita_despesa_default` | ✅ Match |
| `Fixo/Variável` | `fixo_variavel_default` | ✅ Match |
| `Recorrente` | `recorrente_default` | ✅ Match |
| `Alias_Desc` | `alias_desc` | ✅ Match |
| `Key_words_alias` | `key_words_alias` | ✅ Match |
| `URL_icon_internet` | `url_icon_internet` | ✅ **FIXED** |

## Apology

Apologies for the naming inconsistency. All column names now exactly match your Excel source data.
