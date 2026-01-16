# Logic Contract - RitualFin Rules Engine

**Date**: 2026-01-12
**Purpose**: Freeze the intended behavior of the categorization logic as immutable specifications.

---

## 1. Rules Engine Semantics

### 1.1 Rule Structure

A `Rule` contains:
- `id`: Unique identifier
- `keyWords`: Semicolon-separated expressions (e.g., `"LIDL;REWE;EDEKA"`)
- `keyWordsNegative`: Semicolon-separated negative expressions (exclusions)
- `type`: `"Despesa"` | `"Receita"`
- `fixVar`: `"Fixo"` | `"Variável"`
- `category1`, `category2`, `category3`: Category hierarchy
- `priority`: Integer (higher = evaluated first, default 500)
- `strict`: Boolean (if true, match = 100% confidence, no review)
- `isSystem`: Boolean (system rules vs user-created)
- `leafId`: Optional taxonomy leaf reference
- `active`: Boolean (only active rules are evaluated)

**Invariant: One rule per `leafId`**
- For user-created rules, there must be **at most one active row** per `leafId`.
- Keyword maintenance adds new `keyWords` / `keyWordsNegative` by **merging into the existing row** (no duplicate rows for the same leaf target).

### 1.2 Keyword Matching (Deterministic)

**Normalization** (applied to both description and keywords):
1. Convert to UPPERCASE
2. Apply NFD normalization (decompose accents)
3. Remove diacritical marks (regex: `/[\u0300-\u036f]/g`)
4. Collapse multiple spaces to single space
5. Trim whitespace

**Match Algorithm**:
```
For each rule (sorted by priority DESC):
  Split keyWords by semicolon
  For each keyword expression:
    If normalized(haystack).includes(normalized(keyword)):
      MATCH FOUND
      If keyWordsNegative exists:
        If any negative keyword matches:
          SKIP THIS RULE (negative overrides positive)
      Return match with ruleId, leafId, categories
```

### 1.3 Evaluation Order & Priority

**Invariant**: Rules are evaluated in priority order (highest first).

**Strict category target**:
- Each match implies a *single classification target*:
  - Prefer `leafId` when present
  - Fallback target = (`category1`, `category2`, `category3`) tuple (legacy only)

**Resolution (STRICT)**:
- If matches resolve to **more than one distinct target** → **CONFLICT** (no `appliedRule`)
- If matches resolve to **exactly one target** → select `appliedRule` **within that target**:
  - `strict=true` wins over non-strict
  - Otherwise highest `priority` wins (deterministic)

**Important**: `strict=true` does **not** override conflicts across different targets.

### 1.4 Confidence Calculation

```
Base confidence: 70

Modifiers:
  +10 if isSystem=true
  +15 if priority >= 800
  +10 if priority >= 600 (and < 800)
  +5  if priority >= 500 (and < 600)
  =100 if strict=true

Cap at 100
```

### 1.5 Auto-confirm Logic

```
If autoConfirmHighConfidence=true AND confidence >= confidenceThreshold:
  needsReview=false (auto-confirmed)
Else:
  needsReview=true (requires manual review)
```

Default threshold: 80

---

## 2. Category Determination Rules

### 2.1 leaf_id → Category Cascade

When a rule has a `leafId`:
1. Lookup `taxonomy_leaf` by `leafId`
2. Join to `taxonomy_level_2` via `level_2_id`
3. Join to `taxonomy_level_1` via `level_1_id`
4. Extract:
   - `category1` = `nivel_1_pt`
   - `category2` = `nivel_2_pt`
   - `category3` = `nivel_3_pt`
   - `type` = `receitaDespesaDefault` (if present)
   - `fixVar` = `fixoVariavelDefault` (if present)

### 2.2 Special Case: leafId = "open"

Deprecated. The system uses a real taxonomy leaf named **OPEN**:
- `leafId` must reference the user’s **OPEN** leaf in `taxonomy_leaf`
- Categories cascade to:
  - `category1` = "OPEN"
  - `category2` = "OPEN"
  - `category3` = "OPEN"

### 2.3 No Rule Match Fallback

If no rule matches:
- `leafId` = OPEN leaf UUID
- `needsReview` = true
- `confidence` = 0
- Categories cascade to "OPEN" for all levels

---

## 3. Display Logic

### 3.1 display Field Values

| Condition | display |
|-----------|---------|
| `internalTransfer=true` OR `category1="Interno"` | `"no"` |
| `category2="Karlsruhe"` | `"Casa Karlsruhe"` |
| All other cases | `"yes"` |

### 3.2 Transactions with display="no"

Excluded from:
- Dashboard totals (except `totalBalance`)
- Spending aggregations
- Analytics drill-down
- Pending count

Included in:
- Total balance calculation
- Transaction list (with filter)

---

## 4. Interno Category Behavior

**Invariant**: When `category1="Interno"`:
- `internalTransfer` = true
- `excludeFromBudget` = true
- `display` = "no"

**Use case**: Internal transfers between accounts (credit card payments, etc.)

---

## 5. Manual Override Protection

**Invariant**: Once `manualOverride=true`:
- Rule reapplication MUST NOT change categorization
- Only explicit user edit can modify categories

**Implementation check**: Before applying rule result, check `manualOverride` flag.

---

## 6. Conflict Detection

**Definition**: Multiple rules match and resolve to **multiple distinct targets** (different `leafId`s or, for legacy rules, different category tuples).

**Behavior**:
- `conflictFlag` = true
- `needsReview` = true
- Transaction is treated as **OPEN** for reporting safety:
  - `leafId` = OPEN leaf UUID
  - Categories cascade to "OPEN"
- `classificationCandidates` = array of candidate targets (per leaf), to be resolved by the user
- `appliedRule` = none (do not auto-pick a category)

---

## 7. Required Invariants (Test Cases)

### TC-001: Same input → Same category
Given identical `descNorm` and rules, output must be deterministic.

### TC-002: Strict rule short-circuits
Strict rule match wins *within the same target*, but does **not** override a multi-target conflict.

### TC-003: Higher priority wins
Between two matching rules for the **same target**, higher priority is `appliedRule`.

### TC-004: Negative keywords exclude
If positive matches but negative also matches, rule is skipped.

### TC-005: Interno auto-flags
`category1="Interno"` → `internalTransfer=true`, `excludeFromBudget=true`.

### TC-006: Manual override preserved
`manualOverride=true` → rule reapply does not change categories.

### TC-007: Conflict detection
Multiple target matches → `conflictFlag=true`.

### TC-008: Confidence threshold
`confidence >= threshold` + `autoConfirm=true` → `needsReview=false`.

---

## 8. Edge Cases

### EC-001: Empty keywords
Rules with empty/null `keyWords` are skipped.

### EC-002: Special characters
Keywords may contain spaces, periods, special chars - preserved in matching.

### EC-003: Unicode normalization
Accented characters normalized before comparison (é → E).

### EC-004: Case insensitivity
All matching is case-insensitive via UPPERCASE normalization.

---

## Document Version

This Logic Contract was created as part of the stability audit on 2026-01-12.
Any changes to this contract require explicit approval and test updates.
