# RitualFin Full-App QA Report

## Summary
- Status: In progress
- Scope: Full-app E2E validation, QA debug, security baseline, and fix-to-green
- Release readiness: Pending diagnostics and remediation

## Baseline metadata
- Branch: fix/full-app-e2e-qa-security-2026-01-02
- Git SHA: 576033f4ba5ecb692f35c87c099c8bcd83f7fb30
- Node: v24.4.0
- npm: 11.4.2

## Local run commands
- Backend/API: `npm run dev`
- Frontend: `npm run dev:client`
- Build: `npm run build`
- Typecheck: `npm run check`

## Required environment variable names (no values)
- `DATABASE_URL`
- `HOST`
- `VITE_API_URL`
- `VERCEL_OIDC_TOKEN`
- `VERCEL_PROD_URL`
- `VERCEL_TOKEN`
- `RENDER_API_KEY`
- `RENDER_DEPLOY_HOOK`
- `RENDER_SERVICE_ID`

## Test execution log
- `npm run check`: Pass (tsc)
- `npm run build`: Pass (tsx script/build.ts)
- P0 smoke checklist: Partial (API-driven checks executed; UI manual pending)
- API smoke tests: Pass (`scripts/qa/run_api_smoke.sh` against `http://localhost:5050/api` on 2026-01-02)
- DB invariants: Pass (`scripts/qa/run_db_invariants.sh`)
- DB dedupe cleanup: Applied via `scripts/qa/dedupe_transactions.ts --apply` (341 rows deleted)
- Playwright E2E: Pass (12 tests, mocked API fixtures; 2026-01-02)

## Results summary
- P0: Partial (API smoke + mocked E2E passed; manual UI pending)
- P1: Pending
- P2: Pending
- Deferred/Blocked: Manual UI P0 smoke still pending

## Evidence log
- Screenshots: Pending (manual P0 UI smoke)
- HAR exports: Pending (manual P0 UI smoke)
- Console logs: Pending (manual P0 UI smoke)
- Backend logs: Pending (manual P0 UI smoke)
- DB query outputs: Captured from `scripts/qa/run_db_invariants.sh` (DB-01 now clean)
- DB-01: Dedupe cleanup applied via `scripts/qa/dedupe_transactions.ts --apply`.
- Playwright traces/videos: `test-results/` (local run with mocked API fixtures)
  - Manual evidence placeholders (attach on completion):
    - NAV-01..NAV-05 screenshots + console log export
    - LOGIN-01..LOGIN-04 screenshots + /auth/login network
    - DASH-01..DASH-05 screenshots + dashboard API response
    - UP-01..UP-05 screenshots + upload history + /api/uploads/process response
    - TX-01..TX-08 screenshots + /api/transactions response
    - SET-01..SET-14 screenshots + settings PATCH responses
    - LEG-01 screenshots for /confirm, /rules, /merchant-dictionary, /ai-keywords
    - NF-01 screenshot for 404
  - API smoke summary: `/api/health` ok, `/api/version` returned metadata, `/api/auth/login` success, `/api/settings` PATCH persisted, `/api/uploads/process` rowsTotal 277/rowsImported 0/duplicates 277 (re-upload), `/api/transactions` returned data, `/api/classification/review-queue` returned data.
  - Local API base used: `http://localhost:5050/api` (server started via `PORT=5050 npm run dev`).

## Known issues
- Import path now dedupes repeated keys within the same upload; historical duplicates were removed with `scripts/qa/dedupe_transactions.ts --apply`.
- UI P0 smoke steps still require manual verification (screenshots + HAR).

## Docs updated
- `docs/QA/E2E_VALIDATION_PLAN.md` (copied from existing plan)
- `docs/QA/FULL_APP_QA_MATRIX.md` (created QA inventory)
- `docs/QA/FULL_APP_FIX_PLAN.md` (initial issue log)
- `docs/QA/FULL_APP_QA_REPORT.md` (this report)
- `docs/SECURITY/SECURITY_BASELINE.md`, `docs/SECURITY/SECURITY_AUDIT_REPORT.md`, `SECURITY.md` (security baseline + audit updates)
- `docs/prompts/CODEX_FULL_APP_E2E_QA_SECURITY.md`, `docs/prompts/README.md` (prompt library)
- `docs/QUALITY_ASSURANCE_AND_DEBUG.md`, `docs/DOCS_CHANGELOG.md` (automation notes + changelog)
- `.gitignore` (ignore Playwright artifacts)

## How to rerun (planned)
- Typecheck: `npm run check`
- Build: `npm run build`
- API smoke: `scripts/qa/run_api_smoke.sh`
- DB invariants: `scripts/qa/run_db_invariants.sh`
- DB dedupe (optional): `DATABASE_URL=... npx --no-install tsx scripts/qa/dedupe_transactions.ts --apply`
- E2E: `scripts/qa/run_e2e.sh` (defaults to Vite dev server on `http://127.0.0.1:5173`)
