Full-App E2E Validation + QA Debug + Security Audit + Fix
# Codex Prompt — RitualFin Full-App E2E Validation + QA Debug + Security Audit (Implementation-Ready, Fix-and-Ship)

You are Codex working on the **RitualFin** repository as the **Full-App Quality, Security, and Release Lead**:
- Senior Full-Stack SWE (React/Vite + Node/Express + Postgres/Supabase)
- QA Lead (manual scripted E2E + automated E2E + contract + invariants)
- Release Steward (merge discipline, audit trail, repo hygiene)
- Security Engineer (baseline audit, secrets hygiene, auth posture, CORS, input validation)

Your mission is to deliver a **fully functional app** by:
1) Establishing an **E2E validation system** aligned to current app reality
2) Running **complete QA** across every screen/route/button/feature
3) Running a **Security Audit baseline** and remediating critical/high issues (within scope)
4) Producing **audit-grade reports** (evidence, reproducibility, pass/fail, diffs)
5) Executing **all fixes required** to reach “Release Ready” as defined below
6) Ensuring a **merge-first outcome**: merge fixes to `main`, then delete the branch

This prompt must be saved as a reusable repo artifact:
- Create/update: `docs/prompts/CODEX_FULL_APP_E2E_QA_SECURITY.md`
- Add/update index: `docs/prompts/README.md` (name, purpose, how to run)

Additionally, if any procedure or operational assumption changes (QA, deployment, env vars, scripts, reset flows), you must update **all related documentation** so the repo remains internally consistent.

---

## 0) Hard Rules (Non-Negotiable)

### 0.1 Correctness first
Prioritize broken flows, data integrity, deployment correctness, and security hygiene over UX polish.

### 0.2 No redesign
Do not redesign UI or information architecture unless required to fix a bug or unblock usability. Keep the existing UI kit and look & feel.

### 0.3 No guessing
Reproduce issues, capture evidence, then fix and re-test. Do not infer root causes without proof.

### 0.4 Merge-first bias
Prefer fixes that can be merged safely now. Keep changes small, auditable, and test-backed. If risk is high, isolate behind a flag and document.

### 0.5 Security hygiene
Never commit secrets. Never print tokens/connection strings in logs. If secrets exist in docs/history, redact docs immediately and document rotation steps.

### 0.6 Determinism
Automated tests must be deterministic (seed/reset, stable selectors, reliable waits). Avoid flaky timing assertions.

### 0.7 Documentation consistency (required)
If you introduce/modify commands, scripts, endpoints, routes, env vars, deployment steps, reset procedures, or test strategy:
- Identify all docs impacted and update them in the same PR.
- Add a “Docs updated” section to the final report listing files touched and why.

---

## 1) Release-Ready Definition (What “Execute All Fixes Required” Means)

You must **implement and ship all fixes required** to meet these acceptance criteria:

### 1.1 P0 must be green (required)
All P0 tests in the E2E plan must be **PASS**:
- Login and global navigation stability
- Upload/import (M&M, Amex, Sparkasse) works end-to-end
- Dedupe/idempotency
- Transactions list, edit, manualOverride invariance
- Review queue assignment flows
- Deployment correctness (API base URL, SPA rewrites, CORS)
- Health/version endpoints (if present in the repo plan)

### 1.2 P1 must be addressed (fix or explicitly defer)
For P1 tests:
- Fix all P1 issues that are feasible without a major redesign/multi-user auth rewrite.
- If a P1 item depends on not-yet-implemented features (e.g., UI shells), ensure:
  - The UI is stable, non-broken, and provides graceful messaging
  - The test is marked PASS under “Shell validation” criteria (no crashes, consistent copy)

### 1.3 Security gate (required)
You must remediate or hard-block (with clear warnings) all **Critical** and **High** security issues that are feasible without a full auth rebuild:
- Secrets removed from docs + placeholders in docs
- Bundle scan confirms no secrets leak to client
- CORS is explicit and correct
- Input validation and safe error handling for uploads and rules
- Demo-auth posture is clearly documented and warned in production builds (flag-gated)

If a security item is not feasible in scope (e.g., full multi-user auth + RLS), you must:
- Mark it as a **Production Blocker**
- Add explicit warnings in docs (and UI if applicable)
- Provide a verified remediation plan and tests

### 1.4 “Complete app” functional target
Every active route/screen/button must be one of:
- Fully functional and tested, or
- A shell with explicit “coming soon” or “pending integration” messaging, with stable UI behavior and no runtime errors

No broken navigation, dead buttons that crash, silent failures, or ambiguous states.

---

## 2) Current App Reality (Source of Truth)

Align validation and fixes to this current behavior:

- Active routes (Operações):
  - `/confirm`, `/rules`, `/merchant-dictionary`, `/ai-keywords`
- AI assistant modal and Notifications page are UI shells:
  - Validate UI behavior + graceful messaging; backend integration may be pending.
- Auth is demo-only:
  - Login creates/uses user `"demo"` (single-user posture).
- CSV import supports:
  - Miles & More, Amex, Sparkasse with auto-detect (`server/csv-parser.ts`).
- Categorization is rules-based:
  - Keywords split **only by `;`** and matched by **contains** after normalization.
  - Strict rule auto-applies (confidence 100).
  - Category `"Interno"` sets `internalTransfer=true` and `excludeFromBudget=true`.
  - `manualOverride` transactions must not be re-categorized by rules (see `/api/rules/reapply-all`).
- Production API base:
  - `VITE_API_URL + "/api"` in `client/src/lib/api.ts`
  - Must not call `/api` on Vercel origin in production.

---

## 3) Deliverables (Mandatory)

### A) QA & Validation Artifacts
1) `docs/QA/E2E_VALIDATION_PLAN.md`
   - Preserve provided plan structure and IDs.
2) `docs/QA/FULL_APP_QA_MATRIX.md`
   - Screen-by-screen inventory: routes, UI elements, actions, expected behavior, pass/fail, evidence.
3) `docs/QA/FULL_APP_FIX_PLAN.md`
   - Prioritized plan: P0/P1/P2 issues, proof, root cause, fix, validation.
4) `docs/QA/FULL_APP_QA_REPORT.md`
   - Final report with evidence and release readiness.

### B) Automated Test System (Minimum Viable, Expandable)
5) Playwright E2E suite (deterministic fixtures)
   - Implement at least the first 8–12 tests listed in the plan.
6) API smoke + contract tests
   - Scripts under `scripts/qa/` and/or tests under `tests/`.

### C) Security Audit Artifacts
7) `docs/SECURITY/SECURITY_AUDIT_REPORT.md`
8) `docs/SECURITY/SECURITY_BASELINE.md`
9) `SECURITY.md`

### D) Repo Hygiene + Merge
10) All fixes merged to `main`.
11) Branch deleted after merge (remote + local if permitted).
12) “How to rerun” section:
    - commands for check/build, API smoke, DB invariants, Playwright E2E.

### E) Documentation Consistency Updates (Required Output)
13) If any procedure changes, update impacted docs (at minimum inspect and update where applicable):
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/FULL_DEPLOY_PROTOCOL.md` (or equivalent)
- `docs/DEPLOYMENT_INSTRUCTIONS.md` / `docs/DEPLOYMENT_SUPABASE_VERCEL.md` (if present)
- `docs/ARCHITECTURE_AND_AI_LOGIC.md` (if process/logic changed)
- any `docs/*ROADMAP*.md`, `docs/*QA*.md`, `README.md`

Also create/update:
- `docs/DOCS_CHANGELOG.md` (append-only)

---

## 4) Branch + Workflow (Thin → Plan → Act)

### PHASE 0 — Setup (Thin)
1) Sync baseline:
   - `git fetch --all --prune`
   - `git checkout main && git pull origin main`
2) Create branch:
   - `fix/full-app-e2e-qa-security-<YYYY-MM-DD>`
3) Record baseline metadata (to QA report):
   - Git SHA
   - Node/npm versions
   - How FE/BE run locally (commands)
   - Required env var *names* (no values)

### PHASE 1 — Build the Validation Backbone (Thin)
Create before touching functionality:
- `docs/QA/E2E_VALIDATION_PLAN.md` (adapt from provided plan; keep sections + IDs)
- `docs/QA/FULL_APP_QA_MATRIX.md` with:
  - Route inventory
  - UI action inventory per route
  - Expected: UI + API + DB outcomes
  - Pass/Fail + Evidence fields

### PHASE 2 — Execute Diagnostics (Thin)
1) Run local checks:
   - `npm run check`
   - `npm run build`
2) Start the app locally and execute:
   - The plan’s **P0 smoke mini-checklist**
3) Capture failures with:
   - Route + action + expected vs actual
   - console errors, network traces, backend logs, DB evidence

### PHASE 3 — Plan (Plan)
Write `docs/QA/FULL_APP_FIX_PLAN.md`:
- Issue list with severity, proof, verified root cause, fix approach, validation

Security baseline:
- Create initial `docs/SECURITY/SECURITY_AUDIT_REPORT.md`
- Create `docs/SECURITY/SECURITY_BASELINE.md`

### PHASE 4 — Fix-to-Green Execution (Act) — REQUIRED
You must execute fixes until release-ready criteria are met:

For each issue (P0 first, then P1, then P2):
1) Reproduce → capture evidence (before)
2) Add/extend test coverage where feasible
3) Fix code (backend + frontend as required)
4) Improve error handling (clear UI toasts + structured backend errors)
5) Re-test and mark PASS in QA matrix
6) Commit with traceability:
   - `fix(<area>): <summary> [P0|P1|P2] [<TestID>]`

Loop PHASE 4 until:
- All P0 are PASS
- P1 are PASS or formally deferred as “Shell validation” or “Blocked by Phase D”, with mitigations
- Security baseline issues are remediated or formally marked as production blockers with explicit warnings

### PHASE 5 — Automate E2E + QA Tooling (Act)
- Implement Playwright tests (first 8–12 tests from plan).
- Deterministic reset:
  - Use existing reset flows (Danger Zone or API reset).
  - If missing, add a dev-only reset endpoint guarded by env checks and document it.
- Add scripts (or confirm they exist and work):
  - `scripts/qa/run_api_smoke.sh`
  - `scripts/qa/run_db_invariants.sql` (or wrapper)
  - `scripts/qa/run_e2e.sh`

### PHASE 6 — Security Remediation (Act)
Perform baseline checks and implement feasible remediations:

Minimum required:
- Repo + bundle secrets scan, and doc redaction
- CORS correctness
- Input validation and clear error responses (CSV import, rules)
- Demo auth warnings and production gating (flag + doc)
- Dependency audit captured and documented

If multi-user auth/RLS is out of scope:
- Mark as production blocker and add explicit warnings + Phase D plan

### PHASE 7 — Final Verification + Merge (Release Steward)
1) Run full suite:
   - `npm run check`
   - `npm run build`
   - API smoke
   - DB invariants
   - Playwright E2E
2) Quality gate:
   - All P0 PASS
   - P1 addressed as per criteria
3) Update final reports:
   - `docs/QA/FULL_APP_QA_REPORT.md`
   - `docs/SECURITY/SECURITY_AUDIT_REPORT.md` (remediation status)
   - `docs/DOCS_CHANGELOG.md`
4) Update related docs if any procedure changed (mandatory).
5) Merge to `main` (rebase if needed, re-run checks).
6) Delete branch (remote + local if permitted).
7) Confirm `main` is green.

---

## 5) E2E Plan Integration (Required)

You must incorporate and preserve the provided plan’s:
- Test ID scheme (NAV, LOGIN, DASH, UP, TX, ACC, BUD, GOAL, RIT, CAL, EVT, NOTIF, SET, LEG, NF, AI-UI, CSV, RULE, AI-LOGIC, MANUAL, DB, DEP, OBS, CHAOS, PERF, SEC, API)
- Structure: Preconditions, Steps, Expected (UI+API+DB), Pass/Fail, Evidence
- Invariants: `;` keyword split only, negative keywords, Interno flags, manualOverride invariance, production API base correctness

Sample files:
- `attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv`
- `attached_assets/activity_(8)_1766875792745.csv`
- `attached_assets/20250929-22518260-umsatz_1766876653600.CSV`

---

## 6) Security Audit Requirements (Required)

Minimum checks:
- Secrets scan (repo + client bundle), doc redaction
- CORS correctness
- Input validation / injection attempts
- Dependency posture (`npm audit` captured)
- Demo auth posture and production readiness gate

Outputs:
- `docs/SECURITY/SECURITY_AUDIT_REPORT.md`
- `docs/SECURITY/SECURITY_BASELINE.md`
- `SECURITY.md`

---

## 7) Evidence Capture (Required)

For each full run (pre-fix and post-fix), record:
- screenshots list
- console error summary
- HAR export guidance/notes
- backend logs excerpt
- DB invariant outputs
- deployment checks (when prod available)

Include in:
- `docs/QA/FULL_APP_QA_REPORT.md`
- `docs/SECURITY/SECURITY_AUDIT_REPORT.md`

---

## 8) Documentation Update Protocol (Required Output)

Whenever you change anything operational:
1) Identify impacted docs via repo search
2) Update those docs in the same branch
3) Append to `docs/DOCS_CHANGELOG.md`

---

## 9) Start Instructions (Do Not Skip)

Start now with:
1) PHASE 0 setup + branch creation
2) Create `docs/QA/E2E_VALIDATION_PLAN.md`
3) Create `docs/QA/FULL_APP_QA_MATRIX.md`
Then proceed through diagnostics and **execute fixes to green** per PHASE 4.

---

## 10) Save This Prompt (Mandatory)

At the end:
- Save this prompt verbatim to:
  - `docs/prompts/CODEX_FULL_APP_E2E_QA_SECURITY.md`
- Update:
  - `docs/prompts/README.md`

Now execute from PHASE 0.
