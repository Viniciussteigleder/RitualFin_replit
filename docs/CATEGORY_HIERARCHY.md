# Category Hierarchy (STRICT)

This app treats `leafId` (taxonomy leaf) as the single source of truth for transaction categorization.

## Hierarchy

`leafId` → `category3` → `category2` → `category1` → `appCategory`

- `leafId`: `taxonomy_leaf.leaf_id` (Level 3)
- `category3`: `taxonomy_leaf.nivel_3_pt`
- `category2`: `taxonomy_level_2.nivel_2_pt`
- `category1`: `taxonomy_level_1.nivel_1_pt`
- `appCategory`: `app_category.name` via `app_category_leaf`

## Classification states

- **MATCHED**: exactly one `leafId` is resolved by rule matching
- **OPEN**: no `leafId` can be resolved → transaction is set to the user’s **OPEN** leaf
- **CONFLICT**: more than one `leafId` can be resolved → transaction is set to **OPEN** and flagged with candidates

## Invariants

- Transactions created/updated by automation must always store:
  - `leafId`
  - `category1/category2/category3` derived from `leafId`
  - `appCategoryId/appCategoryName` derived from `leafId`
- **OPEN** means OPEN at every level (leaf + category1/2/3 + appCategory).
- **CONFLICT** never auto-picks a category:
  - `conflictFlag=true`
  - `classificationCandidates` contains candidate leaves for the user to resolve
  - Stored hierarchy is **OPEN** until resolution
- AI never auto-applies classification or rule changes without user action:
  - **OPEN discovery**: AI may suggest a leaf + keywords to help the user create/extend a rule.
  - **CONFLICT resolution** (optional): AI may suggest *keyword adjustments* (usually `key_words_negative`) to reduce ambiguity.

## Core implementation

- Rules matching: `src/lib/rules/engine.ts`
- Leaf resolution + conflict candidates: `src/lib/rules/leaf-resolution.ts`
- Taxonomy hydration (leaf → full hierarchy): `src/lib/taxonomy/hierarchy.ts`
- Ingestion / re-categorization:
  - `src/lib/actions/ingest.ts` (`commitBatchCore`)
  - `src/lib/actions/categorization.ts` (`applyCategorizationCore`)

## DB sync helpers

If the DB is missing enum values for taxonomy level 1 names, categorization writes can fail.
The app keeps the `category_1` enum aligned with `taxonomy_level_1.nivel_1_pt` at runtime.

Useful scripts:
- `npm run db:ensure-open` (ensures OPEN + aligns enum with taxonomy for all users)
- `npm run db:backfill-categorization` (re-applies strict categorization for all users)
- `npx tsx scripts/check-category1-enum-coverage.ts` (diagnostic)

## App workflows (STRICT)

### Rule discovery (`/confirm` → "Definição de regras")

- Source: **only** transactions currently classified as the user’s **OPEN** leaf (`transactions.leaf_id = OPEN_LEAF_ID`).
- Grouping: by normalized description (`descNorm`), surfaced as “padrões” with occurrence count.
- Action: **Adicionar regra**:
  - Creates a rule if none exists for the selected `leafId`.
  - If a rule already exists for that `leafId`, it **merges** new `key_words`/`key_words_negative` into the existing row (one rule per leaf).

### Conflict review (`/confirm` → "Conflitos")

- Source: transactions with `conflictFlag=true` (stored as OPEN + `classificationCandidates`).
- Resolution:
  - Manual: select a candidate `leafId` (updates the transaction hierarchy and clears conflict).
  - Optional AI: proposes minimal keyword edits to reduce future conflicts; user chooses whether to apply.

### Recurring suggestions (`/confirm` → "Recorrentes")

- Source: non-OPEN transactions grouped by `(leafId, abs(amount), merchantKey)`.
- Action: "Marcar recorrente" sets recurring flags/group metadata on matching transactions.
