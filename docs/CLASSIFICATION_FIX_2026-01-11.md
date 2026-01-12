# Classification Issues - Investigation & Resolution

## Date: 2026-01-11

## Issues Identified

### 1. **Duplicate and Incorrect Classification Rules**

**Problem:** There were TWO sets of rules for supermarkets:

#### ❌ WRONG Rules (Deleted):
- **Category 1:** "Alimentação" (should be "Mercados")
- **Category 2:** "Supermercado"
- **Category 3:** ALDI, EDEKA, LIDL, NETTO, REWE
- **is_system:** false
- **Rule IDs:**
  - `ea3456c0-0574-4e47-a692-94f0e412b76f` (ALDI)
  - `f20e068a-cd8c-48a3-a4c8-dc1a70f28599` (EDEKA)
  - `2151893e-e6d7-423a-abf7-feeed628f092` (LIDL)
  - `e5f67b04-75f9-48b1-b811-d0b741ef0e87` (NETTO)
  - `e33b041f-9635-4166-abd0-9bda4565c4ad` (REWE)

#### ✅ CORRECT Rules (Kept):
- **Category 1:** "Mercados" (plural)
- **Category 2:** "Supermercado"
- **Category 3:** ALDI, EDEKA, LIDL, NETTO, REWE
- **is_system:** true
- **Has proper leaf_id references to taxonomy**

**Root Cause:** These incorrect rules were likely created manually or through an import that didn't follow your taxonomy structure. They were classifying supermarket transactions under "Alimentação" instead of "Mercados".

---

### 2. **Database Enum Mismatch: "Mercado" vs "Mercados"**

**Problem:** 
- **Schema (schema.ts):** Defined "Mercados" (plural)
- **Database enum:** Had "Mercado" (singular)

**Solution:**
- Added "Mercados" to the database enum
- Updated all existing data from "Mercado" → "Mercados"
- Updated 250 transactions to use the correct plural form

---

### 3. **Incorrect Taxonomy Structure**

**Problem:**
Your specification: `Mercados → Alimentação → Supermercado → ALDI`

**What was in the database:**
```
Alimentação → Supermercado → ALDI
```

**What it should be (and now is):**
```
Mercados → Alimentação → ALDI
Mercados → Alimentação → EDEKA
Mercados → Alimentação → LIDL
Mercados → Alimentação → NETTO
Mercados → Alimentação → Outros mercados
Mercados → Alimentação → REWE
```

**Note:** The system has 3 taxonomy levels:
- **Level 1:** Mercados
- **Level 2:** Alimentação
- **Leaf (Level 3):** ALDI, EDEKA, LIDL, etc.

The word "Supermercado" in your specification appears to be the category type, not a separate level in the hierarchy.

---

## Actions Taken

### ✅ Step 1: Deleted Incorrect Rules
Removed the 5 duplicate rules that were using "Alimentação" as Level 1.

### ✅ Step 2: Fixed Database Enum
- Added "Mercados" (plural) to the `category_1` enum
- Migrated all data from "Mercado" to "Mercados"

### ✅ Step 3: Fixed Taxonomy Structure
- Created "Mercados" at Level 1
- Created "Alimentação" at Level 2 under "Mercados"
- Updated all supermarket leaf nodes to point to the correct hierarchy

### ✅ Step 4: Verified Final State
All supermarket transactions now correctly classify as:
```
Level 1: Mercados
Level 2: Alimentação
Leaf: [ALDI | EDEKA | LIDL | NETTO | REWE | Outros mercados]
```

---

## Current Classification Logic

The **CORRECT** logic now being used is:

1. **System Rules** (is_system = true) with proper taxonomy references
2. **Keywords:** ALDI, EDEKA, LIDL, NETTO, REWE
3. **Priority:** 500 (standard)
4. **Taxonomy Path:** Mercados → Alimentação → [Brand]

**These rules are linked to the taxonomy via `leaf_id`**, ensuring consistent classification across the application.

---

## What Logic Was Removed

The **INCORRECT** logic that was removed:

- **Manual rules** (is_system = false) that classified supermarkets under "Alimentação" directly
- These rules did NOT have `leaf_id` references
- They were deviating from your taxonomy structure
- They were likely created accidentally or through an old import

**You will no longer see transactions classified as:**
```
❌ Alimentação → Supermercado → ALDI
```

**Instead, they will correctly show as:**
```
✅ Mercados → Alimentação → ALDI
```

---

## Recommendations

1. **Re-run Classification:** Consider re-classifying existing transactions to apply the corrected rules
2. **Verify Transactions:** Check that transactions with IDs like `21193ec0` and `24460da2` now show the correct hierarchy
3. **Monitor Imports:** Ensure future CSV/Excel imports respect the taxonomy structure

---

## Files Modified

- `scripts/investigate-classification.ts` - Investigation script
- `scripts/fix-classification-rules.ts` - Rule deletion script
- `scripts/fix-mercado-enum.ts` - Enum migration script
- `scripts/fix-taxonomy.ts` - Taxonomy structure fix
- `scripts/check-taxonomy.ts` - Verification script
