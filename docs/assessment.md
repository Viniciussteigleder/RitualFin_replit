# Repository Assessment (E2E) — RitualFin

**Date**: 2026-01-15  
**Assessed commit**: `e5e316e` (local `main`)  
**Role**: Next.js Principal Architect + Release Owner  

## Constraints (Honored)
- **Immutable business logic**: do not modify `docs/LOGIC_CONTRACT.md` or `rules/oracle/*` (read-only reference)
- **No secrets**: never print/commit secrets (no `.env*` contents; redacted outputs only)
- **Evidence-driven**: every finding cites file paths and/or captured logs under `docs/assessment-evidence/`

## Baseline (Re-run) Evidence
- Install: `docs/assessment-evidence/50-npm-ci-main.txt` (failed) and `docs/assessment-evidence/51-npm-ci-main-pass.txt` (passed)
- Typecheck: `docs/assessment-evidence/52-typecheck-main.txt`
- Lint: `docs/assessment-evidence/53-lint-main.txt`
- Unit tests: `docs/assessment-evidence/54-test-unit-main.txt`
- Build (routes + output): `docs/assessment-evidence/55-build-main.txt`
- E2E (Playwright): `docs/assessment-evidence/64-playwright-main-pass.txt`
- App router file inventory: `docs/assessment-evidence/65-app-router-file-inventory.txt`
- Markdown inventory: `docs/assessment-evidence/66-md-inventory-2026-01-15.txt`
- Branch inventory + merge state: `docs/assessment-evidence/67-branch-inventory.txt`, `docs/assessment-evidence/68-main-ahead-of-origin.txt`

## Repo Map (Short)
- **Next.js App Router**: `src/app/*` (pages/layouts/route handlers)
- **Auth.js (NextAuth)**: `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- **DB/ORM**: Drizzle + `pg.Pool`: `src/lib/db/schema.ts`, `src/lib/db/index.ts`
- **Server actions**: `src/lib/actions/*` (uploads/ingest/rules/transactions/etc.)
- **Rules engine**: `src/lib/rules/engine.ts` and **oracle snapshots** `rules/oracle/*`
- **Frontend components**: `src/components/*` (transactions drawer, upload forms, sidebar, charts)
- **Deploy/ops**: `docs/deploy.md`, `docs/ops-runbook.md`, scripts under `scripts/`

## Architecture (Diagram in Words)
**Neon Postgres** → **Drizzle (`src/lib/db/*`)** → **Server actions (`src/lib/actions/*`) + route handlers (`src/app/api/*`)** → **RSC/SSR pages (`src/app/(dashboard)/*`)** → **client components (`src/components/*`)**.

**Business-logic boundary**
- Categorization invariants are specified in `docs/LOGIC_CONTRACT.md` and backed by `rules/oracle/*`.

## Route / Screen Inventory (Complete)
Source of truth:
- Build output: `docs/assessment-evidence/55-build-main.txt`
- Filesystem inventory: `docs/assessment-evidence/65-app-router-file-inventory.txt`

**Screens**
- `/` (Dashboard): `src/app/page.tsx`
- `/login`: `src/app/(auth)/login/page.tsx`
- `/signup`: `src/app/(auth)/signup/page.tsx`
- `/uploads`: `src/app/(dashboard)/uploads/page.tsx`
- `/imports/[batchId]/preview`: `src/app/(dashboard)/imports/[batchId]/preview/page.tsx`
- `/transactions`: `src/app/(dashboard)/transactions/page.tsx`
- `/confirm`: `src/app/(dashboard)/confirm/page.tsx`
- `/rules`: `src/app/(dashboard)/rules/page.tsx`
- `/admin/rules`: `src/app/(dashboard)/admin/rules/page.tsx`
- `/admin/import`: `src/app/(dashboard)/admin/import/page.tsx`
- `/analytics`: `src/app/(dashboard)/analytics/page.tsx`
- `/accounts`: `src/app/(dashboard)/accounts/page.tsx`
- `/calendar`: `src/app/(dashboard)/calendar/page.tsx`
- `/calendar/events/[id]`: `src/app/(dashboard)/calendar/events/[id]/page.tsx`
- `/budgets`: `src/app/(dashboard)/budgets/page.tsx`
- `/goals`: `src/app/(dashboard)/goals/page.tsx`
- `/rituals`: `src/app/(dashboard)/rituals/page.tsx`
- `/settings`: `src/app/(dashboard)/settings/page.tsx`
- `/settings/exclusions`: `src/app/(dashboard)/settings/exclusions/page.tsx`
- `/settings/rules`: `src/app/(dashboard)/settings/rules/page.tsx`
- `/settings/taxonomy`: `src/app/(dashboard)/settings/taxonomy/page.tsx`
- `/ai-keywords`: `src/app/(dashboard)/ai-keywords/page.tsx`
- `/diagnose`: `src/app/(dashboard)/diagnose/page.tsx`

**API routes**
- `/api/auth/[...nextauth]`: `src/app/api/auth/[...nextauth]/route.ts`
- `/api/auth/debug`: `src/app/api/auth/debug/route.ts`
- `/api/health`: `src/app/api/health/route.ts`

## E2E Product Flow Inventory (Per Screen)
Evidence: `docs/assessment-evidence/64-playwright-main-pass.txt`

For each screen, the interactive surface (buttons/inputs/filters/actions) is listed.

### `/login`
- Buttons: Google sign-in, credentials sign-in, submit
- Inputs: email/username, password
- Links: navigate to signup

### `/signup`
- Inputs: username, email, password
- Buttons: Sign Up / submit

### `/` (Dashboard)
- Month navigation / date selector (if present)
- Cards: pending review entry points, quick actions
- Links to key destinations (transactions, confirm, uploads)

### `/uploads`
- CSV upload: dropzone/click upload (`data-testid="csv-file-input"`), client-side busy state, confirmation panel
- Screenshot upload: file input + OCR flow
- Batch history: per-batch “Process & Import”, “Rollback”

### `/imports/[batchId]/preview`
- Read-only preview table
- Confirm import (server action) + cancel/back link

### `/transactions`
- Search input
- Filters panel toggle and filters (category, account/source, date, amount range)
- Sort toggles (date/amount/category/confidence)
- Bulk selection + bulk actions (confirm/delete/export)
- Per-row actions: open drawer, confirm, edit category, delete
- Drawer: copy ID/raw, set category, confirm, create rule from keyword

### `/confirm`
- Review queue list + per-item confirm
- “Apply high confidence” bulk confirm (if enabled)
- Rule discovery cards: accept/ignore/apply (where implemented)

### `/rules`
- Rule list CRUD (create/edit/delete), reapply all rules
- Filters/search for rules (if present)

### `/admin/rules`
- Rule suggestions list
- Simulate rule
- Create rule with category selection
- Reapply rules in bulk

### `/analytics`
- Date range navigation
- Category charts/graphs and toggles (if present)
- Export/report (if present)

### `/accounts`
- Accounts list and details
- Navigate to related transactions (if present)

### `/calendar` and `/calendar/events/[id]`
- Create event dialog: name/amount/category/recurrence/date
- Event actions (view/edit/delete if wired)

### `/settings/*`
- Preferences form: toggles and thresholds
- Exclusions: CRUD list + inputs
- Taxonomy editor: create/edit taxonomy levels/leaves
- Rules settings: assistant settings form, etc.

### `/ai-keywords`
- Informational + navigation to confirm/discovery (no placeholder stats)

## Per-topic Scorecards (A–L)
These scorecards reference findings in the Master Findings Table below (F-###).

### A) Correctness & business invariants
**Top 10 improvements**
1. Enforce “OPEN” meaning via `leafId` + null categories end-to-end (F-001, F-002)
2. Prevent UI from offering invalid `category1` values (F-003)
3. Verify rule-engine invariants vs `docs/LOGIC_CONTRACT.md` with integration tests (F-004)
4. Ensure rollback is idempotent and actually removes committed CSV imports (F-005)
5. Normalize amount parsing across all sources (EU thousands/decimals) (F-006)
6. Normalize date parsing to avoid locale/UTC drift (F-007)
7. Confirm internal transfer display/budget exclusion logic matches contract (F-008)
8. Ensure dedupe keys are per-user and stable (F-009)
9. Reduce implicit defaults that change semantics (e.g., category fallback) (F-010)
10. Add invariant checks for currency + rounding at aggregation boundaries (F-011)

**Top 5 strengths**
1. Rules engine has a deterministic unit suite tied to contract text: `docs/assessment-evidence/54-test-unit-main.txt`
2. Seed rules provide deterministic baseline categorization for common merchants: `src/lib/rules/engine.ts`
3. Transaction view has clear separation of “needsReview” and “manualOverride”: `src/lib/db/schema.ts`
4. Ingestion tracks batches/items and statuses: `src/lib/db/schema.ts`, `src/lib/actions/ingest.ts`
5. Oracle snapshots are versioned under `rules/oracle/*`

### B) Code quality & architecture
**Top 10 improvements**
1. Remove remaining `any` at action/UI boundaries (DTOs for transactions, ingestion, rules): `src/lib/actions/*`, `src/app/(dashboard)/*`
2. Separate “category1 config” vs “UI group categories” to avoid misuse: `src/lib/constants/categories.ts`
3. Consolidate server action result shape (consistent `Result<T>`), avoid ad-hoc `{ error: ... }`: `src/lib/validators.ts`, `src/lib/actions/*`
4. Reduce page-level DB access; prefer action layer to concentrate authN/authZ and caching: `src/app/(dashboard)/*`
5. Standardize naming and conventional commits (remove generic “fix” commits): `docs/assessment-evidence/68-main-ahead-of-origin.txt`
6. Add typed route params and `searchParams` types per page: `src/app/(dashboard)/*`
7. Reduce component size (transactions drawer, assistant) via lazy loading/splitting: `src/components/transactions/*`, `src/components/assistant/*`
8. Make admin surfaces explicitly role-protected (authZ): `src/app/(dashboard)/admin/*`
9. Ensure `src/lib/env.ts` is the only env entrypoint and is imported early: `src/app/layout.tsx`, `src/lib/db/index.ts`
10. Add eslint rules for forbidden patterns (`dangerouslySetInnerHTML`, raw SQL without user scoping, etc.): `eslint.config.mjs`

**Top 5 strengths**
1. Clear App Router structure and route segregation (`(auth)` vs `(dashboard)`): `docs/assessment-evidence/65-app-router-file-inventory.txt`
2. Server actions provide a natural boundary for auth + DB access: `src/lib/actions/*`
3. Drizzle schema is centralized and expressive: `src/lib/db/schema.ts`
4. UI uses shared components (`Button`, `Card`, `Select`), improving consistency: `src/components/ui/*`
5. Oracle data snapshots are isolated from runtime code: `rules/oracle/*`

### C) Testing & quality gates
**Top 10 improvements**
1. Make `npm run release:gate` the required pre-merge/CI gate: `package.json`, `scripts/pre-deploy-check.ts`
2. Add DB-backed integration tests for ingestion commit/rollback semantics (CSV + screenshot): `src/lib/actions/ingest.ts`, `src/lib/actions/screenshots.ts`
3. Add contract-parity integration tests for manualOverride and rule reapply: `docs/LOGIC_CONTRACT.md`, `src/lib/actions/categorization.ts`
4. Add CI step to fail on “main ahead of origin” drift (PR-only merges): `docs/assessment-evidence/67-branch-inventory.txt`
5. Stabilize Playwright around server actions (wait for committed state): `tests/ingestion.spec.ts`
6. Add smoke coverage for `/uploads` and `/imports/[batchId]/preview` authZ isolation: `src/app/(dashboard)/imports/[batchId]/preview/page.tsx`
7. Add lint/typecheck caching in CI to reduce cycle time
8. Add `npm audit --production` reporting gate (warning-only at first): `docs/assessment-evidence/51-npm-ci-main-pass.txt`
9. Add formatting gate if repo adopts one (do not introduce if not wanted)
10. Add screenshot/trace retention for flaky test diagnosis (CI artifacts): Playwright config

**Top 5 strengths**
1. E2E covers primary flows and is currently green: `docs/assessment-evidence/64-playwright-main-pass.txt`
2. Rules engine has a focused unit suite tied to the contract: `docs/assessment-evidence/54-test-unit-main.txt`
3. Typecheck is wired as a first-class gate: `docs/assessment-evidence/52-typecheck-main.txt`
4. Lint is wired and passing: `docs/assessment-evidence/53-lint-main.txt`
5. Build output provides a stable route inventory signal: `docs/assessment-evidence/55-build-main.txt`

### D) Performance & speed
**Top 10 improvements**
1. Add DB indexes for common access patterns (`transactions.userId+paymentDate`, `rules.userId`, etc.): `src/lib/db/schema.ts`
2. Reduce overfetch on dashboard and analytics (avoid scanning full history): `src/lib/actions/transactions.ts`, `src/lib/actions/analytics.ts`
3. Split heavy client bundles (transactions drawer, assistant) and lazy-load: `src/components/transactions/*`, `src/components/assistant/*`
4. Add pagination/virtualization strategy for `/transactions` beyond 2000 rows: `src/app/(dashboard)/transactions/page.tsx`
5. Cache expensive aggregations (with explicit invalidation): `src/lib/actions/transactions.ts`
6. Review N+1 patterns in ingestion and taxonomy mapping: `src/lib/actions/ingest.ts`
7. Add `npm run analyze` evidence for bundle size regression detection: `package.json`, `next.config.ts`
8. Set conservative Postgres pool settings for serverless + Neon's limits: `src/lib/db/index.ts`
9. Avoid large JSON blobs in RSC payloads where possible (classificationCandidates): `src/lib/db/schema.ts`
10. Add perf budgets (TTFB, JS size) in CI for dashboards and transactions

**Top 5 strengths**
1. Next.js app-router enables server rendering to reduce client JS by default
2. Limited API surface reduces client/server chatter: `src/app/api/*`
3. Postgres connection pooling is configurable via env: `src/lib/db/index.ts`
4. Transactions list supports filter + sort without server roundtrips once loaded: `src/app/(dashboard)/transactions/transaction-list.tsx`
5. Build completes quickly on this machine: `docs/assessment-evidence/55-build-main.txt`

### E) Reliability & resilience
**Top 10 improvements**
1. Make ingestion commit transactional (batch status + item status + tx inserts): `src/lib/actions/ingest.ts`
2. Make commit/rollback idempotent with clear user-facing feedback: `src/lib/actions/ingest.ts`, `src/app/(dashboard)/uploads/batch-list.tsx`
3. Ensure CSV imports link evidence so rollback can delete transactions: `src/lib/db/schema.ts`, `src/lib/actions/ingest.ts`
4. Add timeouts/retries for external calls (OpenAI) with circuit breaker semantics: `src/lib/ai/openai.ts`
5. Standardize error reporting (errorId surfaced to UI): `src/lib/errors.ts`, `src/lib/validators.ts`
6. Improve “loading/error/empty” states on all primary screens: `src/app/(dashboard)/*`
7. Guard server actions with explicit `authRequired()` and consistent return types: `src/lib/actions/*`
8. Avoid relying on client refresh for server action completion (optimistic UI / polling): `/uploads`, `/imports/*`
9. Add rate limiting or request validation on key endpoints (auth, uploads)
10. Add health readiness checks beyond a simple `/api/health`: `src/app/api/health/route.ts`

**Top 5 strengths**
1. Ingestion has explicit batch/item state machines: `src/lib/db/schema.ts`
2. Error sanitization patterns exist for server actions: `src/lib/errors.ts`
3. E2E demonstrates core flows are operable end-to-end: `docs/assessment-evidence/64-playwright-main-pass.txt`
4. Auth gating prevents many unauthenticated error states: `src/app/(dashboard)/*`
5. DB client is centralized: `src/lib/db/index.ts`

### F) Security & privacy
**Top 10 improvements**
1. Add role-based authZ for admin surfaces: `src/app/(dashboard)/admin/*`
2. Ensure every server action filters by `userId` (including batch access): `src/lib/actions/*`
3. Add CSP (report-only → enforce) and document rollout: `next.config.ts`, `docs/deploy.md`
4. Add upload validation (file size/type) and server-side CSV/screenshot validation: `src/app/(dashboard)/uploads/forms.tsx`, `src/lib/actions/ingest.ts`
5. Confirm no reset token ever logged or returned: `src/lib/actions/password-reset.ts`
6. Audit dependency vulnerabilities and patch high severity: `docs/assessment-evidence/51-npm-ci-main-pass.txt`
7. Add basic rate limiting for auth routes and uploads (edge or server): `src/app/api/auth/*`
8. Remove or gate any debug routes and diagnostics in prod: `src/app/api/auth/debug/route.ts`, `src/app/(dashboard)/diagnose/page.tsx`
9. Sanitize assistant output and avoid HTML injection: `src/components/assistant/floating-assistant.tsx`
10. Add security regression checks (XSS payloads, authZ isolation) as CI tests

**Top 5 strengths**
1. Sensitive import preview is user-scoped and auth-protected: `src/app/(dashboard)/imports/[batchId]/preview/page.tsx`
2. Debug endpoint is prod-hidden + auth gated: `src/app/api/auth/debug/route.ts`
3. Password reset no longer exposes token in logs/returns: `src/lib/actions/password-reset.ts`
4. Assistant output avoids raw HTML injection: `src/components/assistant/floating-assistant.tsx`
5. DB queries commonly scope by `userId`: `src/lib/actions/transactions.ts`

### G) UX & UI
**Top 10 improvements**
1. Replace remaining placeholder/dummy values with real data or `—`: `src/app/page.tsx`, `src/app/(dashboard)/accounts/page.tsx`
2. Make upload flow explicit and confidence-building (progress, confirmation, next step): `src/app/(dashboard)/uploads/forms.tsx`
3. Ensure “unclassified” is not silently shown as “Outros” (distinct UI state): `src/lib/actions/transactions.ts`, `src/components/dashboard/*`
4. Standardize destructive action confirmations (delete tx, rollback batch): `src/app/(dashboard)/*`
5. Ensure error states present actionable guidance (missing env, auth misconfig): `src/app/(auth)/login/page.tsx`
6. Normalize terminology (pt-PT vs pt-BR) for consistent microcopy: `src/app/layout.tsx`, `src/lib/db/schema.ts`
7. Add consistent loading skeletons (`loading.tsx`) where missing: `docs/assessment-evidence/65-app-router-file-inventory.txt`
8. Ensure filters are discoverable and persisted in URL where appropriate: `src/app/(dashboard)/transactions/page.tsx`
9. Improve admin pages: surface permission boundaries and warn users: `src/app/(dashboard)/admin/*`
10. Add “success” affordances for long-running server actions (import, reapply rules): `/uploads`, `/admin/rules`

**Top 5 strengths**
1. Strong visual design system consistency via shared UI primitives: `src/components/ui/*`
2. Transactions page has a complete interaction model (filters/sort/bulk/drawer): `src/app/(dashboard)/transactions/transaction-list.tsx`
3. Upload flow includes keyboard support + explicit confirmation: `src/app/(dashboard)/uploads/forms.tsx`
4. Sidebar IA is clear and matches primary tasks: `src/components/layout/sidebar.tsx`
5. Empty state on transactions is explicit and offers next actions: `src/app/(dashboard)/transactions/transaction-list.tsx`

### H) Accessibility
**Top 10 improvements**
1. Ensure all icon-only buttons have accessible names: `src/components/*`
2. Verify focus trapping and keyboard order in dialogs/drawers: `src/components/transactions/transaction-drawer.tsx`
3. Ensure color contrast meets WCAG AA on badges/charts: `src/components/dashboard/*`
4. Add `aria-live` for long-running operations (import, confirm): `/uploads`, `/confirm`
5. Avoid placeholder-only inputs; ensure labels are present: `src/app/(auth)/*`
6. Ensure table headers are semantic and sortable headers announce state: `/transactions`
7. Verify reduced motion handling for framer-motion usage: `src/components/*`
8. Add skip-link and landmark consistency (header/main/nav): `src/app/layout.tsx`
9. Ensure `next/image` usage includes `alt` always and no decorative image confusion
10. Add a11y regression checks (Playwright accessibility snapshot) as optional CI

**Top 5 strengths**
1. Upload dropzone is keyboard operable and uses `aria-busy`: `src/app/(dashboard)/uploads/forms.tsx`
2. Many interactions use Radix UI primitives which handle focus/aria well: `src/components/ui/*`
3. Transaction empty state is clearly announced: `/transactions`
4. Labels are used in many forms via `Label` component: `src/components/ui/label.tsx`
5. App has consistent landmark structure: `src/app/layout.tsx`

### I) Observability & operations
**Top 10 improvements**
1. Add structured logging with request correlation IDs across server actions: `src/lib/errors.ts`
2. Add error reporting integration (Sentry or similar) with PII redaction policy
3. Expand `/api/health` to include DB reachability (without exposing secrets): `src/app/api/health/route.ts`
4. Create runbooks for “import stuck”, “auth misconfig”, “Neon pool exhaustion”: `docs/ops-runbook.md`
5. Add metrics for ingestion timing and counts per batch (observability): `src/lib/actions/ingest.ts`
6. Add audit logging for admin changes (rules/taxonomy): `src/app/(dashboard)/admin/*`
7. Add CI artifact upload for build output and playwright traces: `.github/workflows/*`
8. Standardize server action error surface (errorId shown to user for support): `src/lib/validators.ts`
9. Add data parity checks script into CI for staging/prod (documented): `scripts/verify-db-parity.ts`
10. Ensure logs never include tokens/PII by default (lint rule / grep gate)

**Top 5 strengths**
1. Ops runbook exists and is actionable: `docs/ops-runbook.md`
2. Health endpoint exists for uptime checks: `src/app/api/health/route.ts`
3. Release gate script exists: `scripts/pre-deploy-check.ts`
4. Evidence logging approach is established: `docs/assessment-evidence/*`
5. Many server actions return structured error metadata: `src/lib/validators.ts`

### J) Deployment & environment parity
**Top 10 improvements**
1. Resolve parity drift: local `main` must land on `origin/main` via PR (no local-only release): `docs/assessment-evidence/67-branch-inventory.txt`
2. Add CI job to run `release:gate` and Playwright on PRs: `.github/workflows/*`, `package.json`
3. Validate required env vars at startup and fail fast: `src/lib/env.ts`, `src/app/layout.tsx`
4. Standardize DB migration flow (pre-deploy manual vs CI-run): `docs/deploy.md`
5. Ensure preview deployments do not require Neon branching secrets if unconfigured: `.github/workflows/neon_workflow.yml`
6. Add `PG_POOL_MAX` guidance per environment: `docs/deploy.md`, `src/lib/db/index.ts`
7. Document seed/bootstrap steps for taxonomy/rules for new users
8. Add rollback plan for schema migrations (down migrations strategy): `docs/deploy.md`
9. Add smoke checks for preview envs (health + login + transactions): Playwright
10. Document environment variable ownership and rotation (ops)

**Top 5 strengths**
1. Deployment runbook is already structured and detailed: `docs/deploy.md`
2. Env validation exists and is used by DB client: `src/lib/db/index.ts`
3. CI workflows exist and are evolving: `.github/workflows/*`
4. Pre-deploy check suite exists: `scripts/pre-deploy-check.ts`
5. App has a health endpoint: `src/app/api/health/route.ts`

### K) Data layer & migrations
**Top 10 improvements**
1. Add/verify indexes for hot paths (transactions, rules, ingestion): `src/lib/db/schema.ts`
2. Ensure migrations are single-source-of-truth (avoid parallel migration dirs): `drizzle.config.ts`
3. Add migration verification gate (schema diff) before deploy: `scripts/verify-schema.ts`
4. Ensure tenant isolation at DB level where possible (userId scoped indexes/constraints)
5. Normalize enum usage and prevent invalid values at action boundaries: `src/lib/validators.ts`
6. Add seed strategy for taxonomy + OPEN leaf existence for new user flows: `scripts/seed-*`
7. Consider partitioning or archiving for large transaction histories (future)
8. Ensure `display` semantics are consistent (avoid using it as both flag and label): `src/lib/db/schema.ts`, `src/lib/actions/transactions.ts`
9. Reduce JSONB payload growth (classificationCandidates) and document retention: `src/lib/db/schema.ts`
10. Document backup/restore for Neon and test restore steps: `docs/ops-runbook.md`

**Top 5 strengths**
1. Drizzle schema is centralized and typed: `src/lib/db/schema.ts`
2. Clear batch/item modeling supports auditing: `src/lib/db/schema.ts`
3. Drizzle-kit scripts are present in `package.json`
4. Parity/verification scripts exist: `scripts/*`
5. Many tables include `userId` for multi-tenancy: `src/lib/db/schema.ts`

### L) Documentation & repo hygiene
**Top 10 improvements**
1. Consolidate docs IA to reduce sprawl and duplicated reports: `docs/docs-restructure-plan.md`
2. Establish “current truth” docs and archive the rest: `docs/assessment-evidence/66-md-inventory-2026-01-15.txt`
3. Add ownership metadata (owner, last verified date) to runbooks/contracts
4. Add CONTRIBUTING + local dev quickstart (single entrypoint)
5. Add “release checklist” doc and align with `release:gate`
6. Add doc link checks (CI) to avoid broken references
7. Standardize naming: avoid “ULTIMATE_FINAL_REPORT” style docs
8. Keep evidence logs in a predictable, numbered scheme per run
9. Add `SECURITY.md` pointer in README for responsible disclosure
10. Document branch workflow and PR requirement (no local-only main): `docs/assessment-evidence/67-branch-inventory.txt`

**Top 5 strengths**
1. Deploy and ops runbooks exist and are detailed: `docs/deploy.md`, `docs/ops-runbook.md`
2. Logic contract exists as a clear invariant spec: `docs/LOGIC_CONTRACT.md`
3. Extensive historical context enables auditability (even if needs curation): `docs/`
4. Assessment evidence approach is already used: `docs/assessment-evidence/*`
5. Oracle snapshots are documented and versioned: `rules/oracle/*`

## Master Findings Report (>=30)

Legend for scoring: **Impact** (H/M/L), **Likelihood** (H/M/L), **Effort** (S/M/L).

| ID | Topic | Finding | Evidence | Impact | Likelihood | Effort | Recommendation | Fix-now? | Verification |
|---|---|---|---|---|---|---|---|---|---|
| F-001 | A | “OPEN” semantics must be leaf-based; storing arbitrary fallbacks risks drift | `docs/LOGIC_CONTRACT.md`, `src/lib/actions/ingest.ts` | H | M | M | Keep `leafId` OPEN + null categories; avoid silent fallbacks | Y | Upload + commit CSV and confirm null categories in DB |
| F-002 | A | Rule matches should not trigger AI fallback or be cleared when leafId missing | `src/lib/actions/ingest.ts`, `src/lib/rules/engine.ts` | H | M | S | Gate AI fallback to “no rule matched”; preserve rule categories | Y | `docs/assessment-evidence/64-playwright-main-pass.txt` |
| F-003 | A | UI offered invalid `category1` options (not in enum), causing DB errors/drift | `src/lib/db/schema.ts`, `src/lib/constants/categories.ts`, `src/lib/constants/category1.ts` | H | H | S | Centralize allowed `category1` list and validate | Y | `docs/assessment-evidence/52-typecheck-main.txt` |
| F-004 | A | Contract-level invariants need integration tests (manualOverride, negative keywords, determinism) | `docs/LOGIC_CONTRACT.md`, `docs/assessment-evidence/54-test-unit-main.txt` | H | M | M | Add minimal DB-backed integration tests for rule reapply | N | Add CI job to run integration suite |
| F-005 | A | CSV rollback depends on evidence links; ensure linking exists for CSV imports | `src/lib/actions/ingest.ts`, `src/lib/db/schema.ts` | H | M | M | Link transactions ↔ ingestion items on CSV commit | N | Add e2e rollback assertion on DB removal |
| F-006 | A | Amount parsing must handle EU thousands separators consistently across sources | `src/lib/actions/ingest.ts`, `src/lib/ingest/parsers/*` | H | M | M | Normalize all parse paths; add fixtures for `1.234,56` | N | Unit tests for parser outputs |
| F-007 | A | Date parsing/UTC handling can drift across locale/timezone | `src/lib/ingest/parsers/*`, `src/lib/actions/ingest.ts` | M | M | M | Prefer UTC-normalized dates from parsers end-to-end | N | Snapshot test on dates |
| F-008 | A | Internal transfer display/budget exclusion logic must match contract | `docs/LOGIC_CONTRACT.md`, `src/lib/actions/transactions.ts`, `src/lib/rules/engine.ts` | H | M | M | Add contract parity checks for Interno/internalTransfer | N | Compare computed aggregates with fixtures |
| F-009 | A | Dedupe must be per-user to avoid cross-tenant suppression | `src/lib/actions/ingest.ts` | H | M | S | Ensure all dedupe queries are scoped by userId | Y | E2E import for new user succeeds |
| F-010 | A | Implicit “fallback to Outros” can misrepresent “unclassified” state | `src/lib/actions/ingest.ts`, `src/lib/actions/transactions.ts` | M | M | S | Prefer null/OPEN instead of semantic category fallback | Y | Query DB + UI shows unclassified distinct from Outros |
| F-011 | A | Currency formatting/rounding at aggregation boundaries lacks explicit tests | `src/lib/actions/transactions.ts` | M | M | M | Add unit tests for currency rounding + totals | N | New unit test suite |
| F-012 | B | Mixed concerns in pages (DB access + UI) reduce testability | `src/app/(dashboard)/*` | M | M | M | Prefer server actions for DB access; keep pages thin | N | Refactor 1 page as exemplar |
| F-013 | B | Validators were permissive for critical enums (category1) | `src/lib/validators.ts`, `src/lib/db/schema.ts` | H | H | S | Validate against enum values | Y | Typecheck + runtime validation |
| F-014 | B | Duplicate validator entrypoint was removed; avoid reintroducing | `src/lib/validators.ts`, `docs/assessment-evidence/68-main-ahead-of-origin.txt` | M | M | S | Keep single source of validation | Y | `npm run lint` |
| F-015 | B | Server actions and UI share types via `any` in several places | `src/app/(dashboard)/**`, `src/lib/actions/*` | M | H | M | Replace `any` with typed DTOs at boundaries | N | `tsc` clean with strict types |
| F-016 | B | Admin pages have broad power and need stricter authZ separation | `src/app/(dashboard)/admin/*` | H | M | M | Add role-based authorization before shipping | N | Attempt access as normal user |
| F-017 | B | `src/app/api/auth/debug` is a footgun if re-enabled in prod | `src/app/api/auth/debug/route.ts` | H | M | S | Keep prod 404 + auth gating | Y | `docs/assessment-evidence/64-playwright-main-pass.txt` |
| F-018 | B | Large monolithic components (transactions drawer, assistant) increase bundle risk | `src/components/transactions/transaction-detail-content.tsx`, `src/components/assistant/floating-assistant.tsx` | M | M | M | Split heavy components; lazy load drawers | N | Bundle analyzer run |
| F-019 | B | `main` is far ahead of `origin/main` (risk: local-only changes) | `docs/assessment-evidence/67-branch-inventory.txt` | H | H | S | Push via PR; avoid force-push; keep changelog | Y | CI green on PR |
| F-020 | B | Generic commit messages (“fix”) reduce traceability | `docs/assessment-evidence/68-main-ahead-of-origin.txt` | M | H | S | Enforce conventional commits via lint | N | Commit-msg hook/CI |
| F-021 | B | `src/lib/constants/categories.ts` mixes category1 and grouped UI categories | `src/lib/constants/categories.ts` | M | M | M | Separate “category1 configs” from “UI group configs” | N | Refactor to 2 modules |
| F-022 | C | E2E coverage exists but is sensitive to async server actions | `tests/ingestion.spec.ts`, `docs/assessment-evidence/64-playwright-main-pass.txt` | M | M | S | Wait for committed UI state before asserting | Y | Playwright green |
| F-023 | C | Release gate should be the canonical pre-merge script | `package.json`, `scripts/pre-deploy-check.ts` | M | M | S | Use `npm run release:gate` in CI | N | CI job |
| F-024 | C | `npm ci` can fail with ENOTEMPTY on some FS states | `docs/assessment-evidence/50-npm-ci-main.txt` | M | M | S | Document cleanup step; consider `npm ci` retry in CI | Y | Rerun passes (`51-*`) |
| F-025 | C | Dependency vulnerabilities present (moderate/high) | `docs/assessment-evidence/51-npm-ci-main-pass.txt` | H | M | M | Run `npm audit` triage + pin fixes | N | `npm audit` report |
| F-026 | C | E2E uses production server; ensure `PORT`/server lifecycle is stable | `playwright.config.ts`, `docs/assessment-evidence/64-playwright-main-pass.txt` | M | M | S | Keep deterministic start/stop; avoid port collisions | Y | E2E passes twice |
| F-027 | D | Large pages can regress bundle size (no size budget enforced) | `docs/assessment-evidence/55-build-main.txt` | M | M | M | Add bundle analyzer CI for PRs touching UI | N | `npm run analyze` |
| F-028 | D | Analytics queries may scan large transaction sets without indexes | `src/lib/actions/analytics.ts`, `src/lib/db/schema.ts` | H | M | M | Add indexes on `(userId,paymentDate)` etc | N | EXPLAIN plan evidence |
| F-029 | E | Server actions lack timeouts/retries for DB calls | `src/lib/actions/*` | M | M | M | Add query timeouts and retry wrappers where safe | N | Chaos testing |
| F-030 | F | Password reset must never log/return tokens | `src/lib/actions/password-reset.ts` | H | M | S | Keep enumeration-safe; remove token logging | Y | Code review + grep |
| F-031 | F | Import preview page must enforce user isolation | `src/app/(dashboard)/imports/[batchId]/preview/page.tsx` | H | M | S | Filter by `userId` and require auth | Y | Attempt cross-user access returns 404 |
| F-032 | F | Avoid `dangerouslySetInnerHTML` for assistant output | `src/components/assistant/floating-assistant.tsx` | H | M | S | Render safe subset markdown | Y | Static analysis + manual test |
| F-033 | G | Remove “dummy” numbers (balances, goals, credit limits) from UI | `src/app/page.tsx`, `src/app/(dashboard)/accounts/page.tsx` | H | H | M | Derive from DB or render `—` when unknown | Y | UI shows no placeholders |
| F-034 | G | Upload screen needed explicit success confirmation | `src/app/(dashboard)/uploads/forms.tsx` | H | H | S | Show batchId + new/duplicate counts and next steps | Y | E2E upload flow |
| F-035 | G | Single canonical logo required (no other logos) | `public/RitualFin Logo.png` | M | M | S | Remove alternate logos and use one asset | Y | Visual check + repo grep |
| F-036 | H | Ensure keyboard operation on upload dropzone and forms | `src/app/(dashboard)/uploads/forms.tsx` | M | M | S | Keep `tabIndex` and key handlers | Y | Manual keyboard test |
| F-037 | I | Add ops/runbook with day-2 commands | `docs/ops-runbook.md` | M | M | S | Keep updated with release gates and rollback | Y | Runbook referenced in deploy |
| F-038 | J | Document deploy flow + migration strategy | `docs/deploy.md` | H | M | M | Keep migration steps explicit and gated | Y | Pre-deploy checklist |
| F-039 | L | Docs sprawl requires controlled IA + migration plan | `docs/docs-restructure-plan.md`, `docs/assessment-evidence/66-md-inventory-2026-01-15.txt` | M | H | M | Execute reorg in safe PR; update links | N | Link checker + grep |

## Top 10 Fix Now (Cross-topic)
Ranked heuristically by Impact × Likelihood ÷ Effort.

1. Enforce category1 enum in UI + validation (F-003, F-013) — Verify: `npm run check` (`docs/assessment-evidence/52-typecheck-main.txt`)
2. Fix ingestion rule-match behavior to avoid AI fallback drift (F-002) — Verify: e2e import (`docs/assessment-evidence/64-playwright-main-pass.txt`)
3. Upload confirmation UX (F-034) — Verify: e2e upload (`docs/assessment-evidence/64-playwright-main-pass.txt`)
4. Remove dummy figures and render unknown as `—` (F-033) — Verify: manual UI sweep
5. Harden import preview authZ (F-031) — Verify: direct access without session redirects
6. Remove reset-token logging (F-030) — Verify: grep no token output
7. XSS hardening in assistant (F-032) — Verify: no `dangerouslySetInnerHTML`
8. Release gate script as CI-required (F-023) — Verify: CI passes `release:gate`
9. Vulnerability triage (F-025) — Verify: `npm audit` report owned + scheduled
10. Push local main via PR; avoid local-only drift (F-019) — Verify: PR merged, `origin/main` up to date

## Release Readiness
**Status**: **PASS (local)**; **FAIL (remote parity)** until changes land on `origin/main`.

Local PASS evidence:
- `docs/assessment-evidence/52-typecheck-main.txt`
- `docs/assessment-evidence/53-lint-main.txt`
- `docs/assessment-evidence/54-test-unit-main.txt`
- `docs/assessment-evidence/55-build-main.txt`
- `docs/assessment-evidence/64-playwright-main-pass.txt`

Remote parity blocker:
- Local `main` ahead of `origin/main`: `docs/assessment-evidence/67-branch-inventory.txt`

## Docs Restructure Outcome
- Migration plan only (no link-breaking move executed in this run): `docs/docs-restructure-plan.md`
