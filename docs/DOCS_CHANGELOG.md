# Docs Changelog

## 2026-01-02
- Added QA backbone docs: `docs/QA/E2E_VALIDATION_PLAN.md`, `docs/QA/FULL_APP_QA_MATRIX.md`, `docs/QA/FULL_APP_FIX_PLAN.md`, `docs/QA/FULL_APP_QA_REPORT.md`.
- Added security baseline docs: `docs/SECURITY/SECURITY_BASELINE.md`, `docs/SECURITY/SECURITY_AUDIT_REPORT.md`.
- Added reusable prompt artifact: `docs/prompts/CODEX_FULL_APP_E2E_QA_SECURITY.md` and indexed in `docs/prompts/README.md`.
- Added Playwright configuration and initial E2E specs under `tests/e2e/` plus QA scripts in `scripts/qa/`.
- Updated QA guide with automation shortcuts for smoke/E2E/DB checks: `docs/QUALITY_ASSURANCE_AND_DEBUG.md`.
- Updated security policy with dependency audit note and current review date: `SECURITY.md`.
- Updated QA report with Playwright run status and evidence links: `docs/QA/FULL_APP_QA_REPORT.md`.
- Updated QA matrix/fix plan with automated status and blocked items: `docs/QA/FULL_APP_QA_MATRIX.md`, `docs/QA/FULL_APP_FIX_PLAN.md`.
- Updated security baseline/audit with secret scans and post-`npm audit fix` results: `docs/SECURITY/SECURITY_BASELINE.md`, `docs/SECURITY/SECURITY_AUDIT_REPORT.md`.
- Added CORS validation notes (local) to security audit/baseline.
- Added Playwright artifacts to `.gitignore` to avoid committing `test-results` and `playwright-report`.
- Added scripted DB invariants runner guidance and updated QA docs to reflect DB-01 failure: `docs/QUALITY_ASSURANCE_AND_DEBUG.md`, `docs/QA/FULL_APP_QA_REPORT.md`, `docs/QA/FULL_APP_QA_MATRIX.md`, `docs/QA/FULL_APP_FIX_PLAN.md`.
- Documented DB dedupe runner and updated QA artifacts after duplicate cleanup: `docs/QUALITY_ASSURANCE_AND_DEBUG.md`, `docs/QA/FULL_APP_QA_REPORT.md`, `docs/QA/FULL_APP_QA_MATRIX.md`, `docs/QA/FULL_APP_FIX_PLAN.md`.
- Updated QA report with latest API smoke and Playwright results: `docs/QA/FULL_APP_QA_REPORT.md`.
- Added manual P0 UI smoke evidence placeholders and pending markers: `docs/QA/FULL_APP_QA_REPORT.md`, `docs/QA/FULL_APP_QA_MATRIX.md`.
- Added API contract test runner and updated QA docs with latest contract results: `scripts/qa/run_api_contracts.ts`, `scripts/qa/run_api_contracts.sh`, `docs/QA/FULL_APP_QA_REPORT.md`, `docs/QA/FULL_APP_QA_MATRIX.md`, `docs/QUALITY_ASSURANCE_AND_DEBUG.md`.
- Updated QA fix plan baseline to current main SHA: `docs/QA/FULL_APP_FIX_PLAN.md`.
- Recorded input validation checks in security audit/baseline: `docs/SECURITY/SECURITY_AUDIT_REPORT.md`, `docs/SECURITY/SECURITY_BASELINE.md`.
- Updated security status in QA matrix based on completed checks: `docs/QA/FULL_APP_QA_MATRIX.md`.
- Documented demo-auth production guardrail and new env var across security/QA/deployment docs: `SECURITY.md`, `docs/SECURITY/SECURITY_AUDIT_REPORT.md`, `docs/SECURITY/SECURITY_BASELINE.md`, `docs/FULL_DEPLOY_PROTOCOL.md`, `docs/DEPLOYMENT_INSTRUCTIONS.md`, `docs/DEPLOYMENT_CONNECTIVITY_FIX.md`, `docs/QA/FULL_APP_QA_REPORT.md`.
- Updated security audit SHA after guardrail rollout: `docs/SECURITY/SECURITY_AUDIT_REPORT.md`.
- Documented dependency remediation strategy for `xlsx` and `drizzle-kit`: `docs/SECURITY/SECURITY_AUDIT_REPORT.md`.
- Made API contract tests tolerate empty transactions arrays with warning: `scripts/qa/run_api_contracts.ts`.
- Updated dependency remediation note to reflect client-side `xlsx` usage: `docs/SECURITY/SECURITY_AUDIT_REPORT.md`, `docs/SECURITY/SECURITY_BASELINE.md`.
- Removed client-side `xlsx` usage by switching rules and merchant dictionary workflows to CSV: `client/src/lib/csv.ts`, `client/src/pages/rules.tsx`, `client/src/pages/merchant-dictionary.tsx`, `docs/SECURITY/SECURITY_AUDIT_REPORT.md`, `docs/SECURITY/SECURITY_BASELINE.md`.
