# Repository Assessment (E2E) — RitualFin

**Date**: 2026-01-14  
**Role**: Next.js Principal Architect + Release Owner  
**Non-negotiables honored**:
- No changes to `docs/LOGIC_CONTRACT.md` or `rules/oracle/*`
- No secrets printed or committed (only presence checks / redacted outputs)
- Evidence-driven: commands + logs stored under `docs/assessment-evidence/`

## Baseline Evidence

**Toolchain**
- `docs/assessment-evidence/00-toolchain.txt`

**Install**
- `npm ci` log: `docs/assessment-evidence/01-npm-ci.txt`

**Quality gates**
- Typecheck: `docs/assessment-evidence/02-typecheck.txt`
- Lint: `docs/assessment-evidence/03-lint.txt`
- Build: `docs/assessment-evidence/04-build.txt`

## Repo Map (Short)

- Next.js App Router: `src/app/*` (pages + layouts + route handlers)
- Auth.js / NextAuth: `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- DB / ORM: Drizzle + `pg.Pool`: `src/lib/db/schema.ts`, `src/lib/db/index.ts`
- Server Actions: `src/lib/actions/*` (e.g. ingest, rules, transactions)
- Rules engine + oracle snapshots: `src/lib/rules/*`, `rules/oracle/*`
- Env validation: `src/lib/env.ts` imported from `src/app/layout.tsx`
- Deploy: Vercel config `vercel.json`, CI workflows under `.github/workflows/`

## Architecture (Diagram in Words)

**Neon Postgres** → **Drizzle ORM** (`src/lib/db/*`) → **Server Actions** (`src/lib/actions/*`) and **Route Handlers** (`src/app/api/*`) → **App Router UI** (`src/app/(dashboard)/*`, `src/app/(auth)/*`) → **Client Components** (`src/components/*`).

**Business-logic boundary**
- Categorization invariants are documented in `docs/LOGIC_CONTRACT.md` and backed by `rules/oracle/*`.

## Route / Screen Inventory (Build output)

Captured from `next build` output in `docs/assessment-evidence/04-build.txt`:
- `/` (dashboard)
- `/_not-found`
- `/accounts`
- `/admin/import`
- `/admin/rules`
- `/ai-keywords`
- `/analytics`
- `/api/auth/[...nextauth]`
- `/api/auth/debug`
- `/budgets`
- `/calendar`
- `/calendar/events/[id]`
- `/confirm`
- `/diagnose`
- `/goals`
- `/icon.png`
- `/imports/[batchId]/preview`
- `/login`
- `/rituals`
- `/rules`
- `/settings`
- `/settings/exclusions`
- `/settings/rules`
- `/settings/taxonomy`
- `/signup`
- `/transactions`
- `/uploads`

## Product Flow Notes (High-confidence from code)

- Auth: `/login` (Google + credentials) → `/` on success (`src/app/(auth)/login/page.tsx`)
- Signup: `/signup` form calls `registerUser` server action (`src/app/(auth)/signup/page.tsx`)
- Imports: `/uploads` upload client + batch history (`src/app/(dashboard)/uploads/page.tsx`)
- Review/discovery: `/confirm` shows rule discovery cards + high-confidence review queue (`src/app/(dashboard)/confirm/page.tsx`)
- Transaction management: `/transactions` filters + bulk actions + per-tx actions + AI analyst chat (`src/app/(dashboard)/transactions/page.tsx`)
- Rules: `/rules` rules manager (`src/app/(dashboard)/rules/page.tsx`), plus an admin studio `/admin/rules` (`src/app/(dashboard)/admin/rules/page.tsx`)

## Master Findings (>=30)

Each item includes evidence pointers; severity is qualitative.

### Correctness & business invariants
1. **Rules contract mismatch risk**: negative keyword override is required by `docs/LOGIC_CONTRACT.md` §1.2; confirm implementation parity before changing behavior. Evidence: `docs/LOGIC_CONTRACT.md`, `src/lib/rules/classification-utils.ts`, `src/lib/rules/engine.ts`.
2. **leafId cascade required** by contract (§2.1) is not visibly implemented in `src/lib/rules/engine.ts` (likely handled elsewhere); verify parity before modifying. Evidence: `docs/LOGIC_CONTRACT.md`, `src/lib/rules/engine.ts`.
3. **Manual override invariant** (§5) must be enforced wherever rules are re-applied; verify in re-run flows. Evidence: `docs/LOGIC_CONTRACT.md`, `src/components/transactions/re-run-rules-button.tsx`, `src/lib/actions/categorization.ts`.
4. **Import amount parsing** uses `parseFloat(str.replace(',', '.'))` which can mis-handle thousands separators; changing it may change imported values (STOP before changing). Evidence: `src/lib/actions/ingest.ts`.

### Code quality & architecture
5. **ESLint execution was broken** for this repo’s Next.js 16 CLI (no `next lint`), requiring direct ESLint usage. Evidence: `./node_modules/.bin/next --help`, `docs/assessment-evidence/05-next-lint.txt`.
6. **Validator module collision** (`src/lib/validators.ts` vs `src/lib/validators/index.ts`) risks incorrect imports. Evidence: `src/lib/actions/transactions.ts`, `src/lib/actions/bulk-operations.ts`.
7. **Calendar page hits DB directly** instead of routing through action layer, complicating caching/testing boundaries. Evidence: `src/app/(dashboard)/calendar/page.tsx`.
8. **Diagnostics page contained hard-coded IDs** (dev-only debugging) and lacked auth gating. Evidence: `src/app/(dashboard)/diagnose/page.tsx`.

### Testing & release gates
9. **No unit test runner** in scripts; only Playwright e2e is wired. Evidence: `package.json`, `playwright.config.ts`.
10. **Protected main branch requires PR merges**; direct push is rejected. Evidence: git push error (local), CI/PR workflow.
11. **Neon PR branch workflow was failing** when Neon secrets/vars aren’t configured, blocking PR merges. Evidence: `.github/workflows/neon_workflow.yml`, PR checks.

### Performance
12. **Ingestion dedupe is N+1** DB queries per row (scales poorly). Evidence: `src/lib/actions/ingest.ts`.
13. **Large server-rendered pages** (e.g., dashboard) likely heavy; use bundle analyzer when needed. Evidence: `src/app/page.tsx`, `next.config.ts`, `docs/assessment-evidence/04-build.txt`.

### Reliability
14. **Ingestion partial-failure risk**: multiple inserts without a transaction can leave partial data on crash. Evidence: `src/lib/actions/ingest.ts`.
15. **DB pool defaults** can be unsafe for serverless/Neon; configure limits. Evidence: `src/lib/db/index.ts`.

### Security & privacy
16. **Public env diagnostics endpoint** existed (`/api/auth/debug`); must be gated for prod and auth. Evidence: `src/app/api/auth/debug/route.ts`.
17. **Secrets hygiene**: `.env.local` exists locally but is not tracked; ensure never committed. Evidence: `git ls-files .env*` shows only `.env.example`.
18. **No CSP configured**; consider CSP (report-only first) to reduce XSS risk. Evidence: `next.config.ts`.

### UX / UI
19. **Broken login logo**: referenced missing `/ritualfin-logo.png` asset. Evidence: `src/app/(auth)/login/page.tsx`, `public/`.
20. **Event detail page is “wow dummy”**: edit/delete buttons have no backing behavior. Evidence: `src/app/(dashboard)/calendar/events/[id]/page.tsx`.
21. **AI Keywords screen appears static** with placeholder actions. Evidence: `src/app/(dashboard)/ai-keywords/page.tsx`.

### Accessibility
22. **Anchor used for internal routing** in `/confirm` empty state (fixed). Evidence: `src/app/(dashboard)/confirm/page.tsx`.
23. **`<img>` warnings**: multiple `<img>` tags; consider `next/image`. Evidence: `docs/assessment-evidence/03-lint.txt`.

### Docs / repo hygiene
24. **Docs sprawl**: 182 markdown files detected, with overlapping reports. Evidence: `docs/assessment-evidence/07-md-inventory.txt`.
25. **Multiple “reports of reports”** in root and `docs/` reduce discoverability. Evidence: `docs/assessment-evidence/07-md-inventory.txt`.

### Deployment / parity
26. **CI preview depends on Vercel secrets**; build uses env placeholders during build phase. Evidence: `.github/workflows/ci.yml`, `src/lib/env.ts`.
27. **Two migrations locations** (`migrations/` and `db/migrations/`) risks drift. Evidence: `drizzle.config.ts`, filesystem layout.

### Additional findings (to reach breadth)
28. **Mixed locale defaults** (`pt-PT` in HTML `lang` vs settings default `pt-BR` in schema). Evidence: `src/app/layout.tsx`, `src/lib/db/schema.ts`.
29. **Auth linking risk**: `allowDangerousEmailAccountLinking: true` may not be desired. Evidence: `src/auth.ts` (requires product decision).
30. **Lack of health endpoint** aside from auth debug. Evidence: `src/app/api/*`.
31. **No explicit request correlation ID**; errors generate `errorId` but not propagated everywhere. Evidence: `src/lib/errors.ts`.
32. **ESLint warnings indicate potential perf/quality issues** (fonts, image optimization). Evidence: `docs/assessment-evidence/03-lint.txt`.

## Top 10 “Fix Now” (Impact × Likelihood ÷ Effort)

1. Gate `/api/auth/debug` to non-production + auth (done). Verify: request returns 404 in prod; 401 without session.
2. Make Neon PR branch workflow optional when Neon isn’t configured (done). Verify: PR checks no longer fail due to Neon step.
3. Restore reproducible linting (done). Verify: `npm run lint` passes.
4. Fix broken login logo reference (done). Verify: `/login` shows image from `public/`.
5. Use validated env + pool limits in DB client (done). Verify: builds and runtime connect consistently.
6. Remove validator module ambiguity (done by removing `src/lib/validators/index.ts`). Verify: imports resolve to `src/lib/validators.ts`.
7. Stop exposing hard-coded diagnose IDs outside dev and require auth (done). Verify: `/diagnose` requires session and hides IDs outside dev.
8. Replace internal `<a href>` with `next/link` where detected (done). Verify: lint passes.
9. Document ops/runbook basics (done). Verify: `docs/ops-runbook.md` exists.
10. **STOP**: Align rules engine behavior with `docs/LOGIC_CONTRACT.md` only with explicit approval + parity verification (not done).

## Release Readiness (Current Branch)

**PASS with warnings** (no lint/typecheck/build failures on this branch). Evidence:
- `docs/assessment-evidence/02-typecheck.txt`
- `docs/assessment-evidence/03-lint.txt`
- `docs/assessment-evidence/04-build.txt`

**Blockers to certify “logic correctness”**
- Contract parity for categorization (negative keyword override, leafId cascade, manualOverride). Requires explicit verification plan and (if needed) behavior changes aligned to `docs/LOGIC_CONTRACT.md`.

