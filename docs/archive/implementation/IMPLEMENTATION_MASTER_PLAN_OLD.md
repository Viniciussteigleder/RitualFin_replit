# Implementation Master Plan — RitualFin

**Purpose**: Consolidated execution guide for implementation, features, taxonomy migration, QA, and deployment.
**Status**: Active source of truth (supersedes fragmented implementation notes).
**Full Deploy Policy**: Required for all changes, including UI-only updates.

---

## 1) Current State (Condensed)

- **Core app**: Dashboard, transações, uploads, contas, orçamento, metas, calendário, insights e configurações estão ativos.
- **IA aplicada**: Sidebar com grupos colapsáveis e “Configurações” apenas em Sistema.
- **Classification system**: Taxonomy tables + classification import/export endpoints exist; uploads already classify via `leafId` when rules are in taxonomy format.
- **Legacy compatibility**: `category1` enum remains in use for dashboards and some pages; taxonomy leafs must map back to legacy categories where needed.
- **Security posture**: Demo auth + RLS disabled; credential rotation is mandatory before any production use.
- **Deployment**: Split architecture (Vercel + Render + Supabase) with full deploy verification required for every change.

---

## 2) Taxonomy Migration (Highest Priority)

**Goal**: Ensure taxonomy tables are populated and legacy data is mapped to `leafId`.

**Implementation**:
- Use `script/migrate-taxonomy.ts` to:
  - Build taxonomy level 1/2/3 entries from existing legacy categories.
  - Create app categories aligned to L1.
  - Map rules and transactions to `leafId`.
  - Maintain legacy `category1` values for UI compatibility.

**Prerequisites**:
- `DATABASE_URL` configured.

**Post-migration checks**:
- `/api/classification/leaves` returns populated leaf list.
- New uploads set `leafId` and `status=FINAL` when keyword rules match.

---

## 3) Phase 1 Features (Critical Fixes)

### 3.1 UI Copy Corrections (Portuguese)
- Normalize all user-facing copy for accents and clarity.
- Replace ASCII fallbacks (Configurações, Preferências, Importação, Não, etc).

### 3.2 Sparkasse Upload Reliability
- Preserve BOM handling fix and extend diagnostics for malformed rows.
- Ensure upload diagnostics surface column mismatches.

### 3.3 AI Keywords Analysis (Taxonomy-Aware)
- Use taxonomy leafs to generate AI suggestions.
- Store rules with `leafId` + `keyWords`.
- Map AI suggestions back to legacy categories for UI compatibility.

---

## 4) UX/UI Plan Alignment

**Source**: `docs/UX_UI_MASTER_PLAN.md`

Key enforced UX patterns (A–H):
- Preview → Confirm → Commit for imports, rules, and bulk edits.
- Status panels for every data operation with visible diagnostics.
- Classification explainability (key_desc, alias, rule match).

---

## 5) QA + Debug Gates

Use:
- `docs/QUALITY_ASSURANCE_AND_DEBUG.md`
- `docs/E2E_TESTING_AND_VALIDATION_PLAN.md`

Minimum checks:
- `npm run check`
- `npm run build`
- CSV upload flow (all three sources)
- Review queue + taxonomy leaf selection
- AI keyword analysis endpoints

---

## 6) Deployment Policy (Enforced)

All changes (backend + frontend) must follow `docs/FULL_DEPLOY_PROTOCOL.md`.
Commit/Sync is deprecated.

---

## 7) Reference Sources (Canonical Inputs)

- `docs/IMPLEMENTATION_PLAN_FINAL.md`
- `docs/IMPLEMENTATION_ROADMAP.md`
- `docs/FEATURE_IMPLEMENTATION_REPORT.md`
- `docs/CATEGORY_IMPLEMENTATION_SUMMARY.md`
- `docs/CATEGORY_QUICK_REFERENCE.md`
- `docs/UX_UI_MASTER_PLAN.md`
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/SECURITY_AUDIT_2025-12-29.md`
