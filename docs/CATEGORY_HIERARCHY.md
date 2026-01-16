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
- AI suggestions apply **only** when the rule engine resolves **OPEN**.

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

