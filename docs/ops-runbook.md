# Ops Runbook (RitualFin)

**Scope**: day-2 operations for the Next.js + Neon + Auth.js deployment (local/dev, preview, production).

## Quick Commands

- Install deps: `npm ci`
- Typecheck: `npm run check`
- Lint (TS + ESLint): `npm run lint`
- Build: `npm run build`
- Start (prod server): `npm run start`
- E2E tests (Playwright): `npm run test:e2e`
- Release gate (recommended before PR): `npm run release:gate`

## Git / Release Workflow (Protected `main`)

This repo blocks direct pushes to `main` (GitHub error `GH006`). Use PRs.

**Sync + ship (happy path)**
1. `git checkout main && git fetch origin --prune`
2. `git pull --rebase origin main`
3. `git checkout -b release/<short-desc>`
4. Make changes, commit, run `npm run release:gate`
5. `git push -u origin HEAD`
6. Open PR → merge → Vercel deploy triggers from `main`

**If you see “Can’t push… Try running Pull first”**
- Run `git fetch origin --prune` then `git pull --rebase origin main`, resolve conflicts if any, and push from a PR branch (never force-push `main`).

## Environment Variables (names only)

Required at runtime (see `src/lib/env.ts`):
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

Optional:
- `AUTH_URL`
- `OPENAI_API_KEY`
- `ANALYZE`
- `PG_POOL_MAX`

## Common Incidents

### Auth redirect / “Configuration” errors
- Check `AUTH_URL` and OAuth callback/redirect URIs configured in Google.
- If debugging, use `GET /api/auth/debug` in **non-production** and **authenticated** sessions only (`src/app/api/auth/debug/route.ts`).

### DB connectivity failures
- Symptom: actions fail with connection errors; `GET /api/auth/debug` reports `DB_CONNECTIVITY=fail` (dev/preview only).
- Verify `DATABASE_URL` points to the correct Neon branch and includes required SSL options (don’t paste full URL into tickets).
- Verify connection pool limits (`src/lib/db/index.ts`) are reasonable for the environment (tunable via `PG_POOL_MAX`).

### Preview deploy checks failing (Neon branch workflow)
- Workflow: `.github/workflows/neon_workflow.yml`
- Expected behavior: PR Neon branch jobs run only when `NEON_GITHUB_BRANCHING_ENABLED=true` plus `NEON_PROJECT_ID` and `NEON_API_KEY` are configured in GitHub Actions.
- If you see **“Neon branching: Branch limit exceeded”**:
  - **Vercel Deployment Check**: this comes from the Vercel↔Neon integration (not GitHub Actions). Fix by deleting stale Neon branches or disabling per-preview branching in Vercel’s Neon integration for this project.
  - **GitHub Actions**: `.github/workflows/neon_workflow.yml` is configured to fall back and should not block PRs even if Neon rejects branch creation.

## Operational Guardrails

- Do not log secrets (DB URLs, OAuth secrets, tokens). Prefer boolean presence checks and redacted summaries.
- Treat categorization behavior as immutable per `docs/LOGIC_CONTRACT.md` and `rules/oracle/*`.

## Generated Reports (Don’t Commit)

Some scripts generate local reports like `docs/pre-deploy-report.json` and `docs/rules-parity-report.md` for troubleshooting. Treat them as build artifacts unless a PR explicitly calls for committing them.
