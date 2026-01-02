# Full Deploy Protocol

## 1) Definitions

- Commit/Sync: A GitHub main branch update that triggers platform auto-deploys, without running the full verification workflow.
- Full Deploy: A complete, end-to-end deployment cycle that confirms the intended commit is live on Render and Vercel, with explicit version verification and smoke checks.

## 1.1) Policy Update (Enforced)

- **Full Deploy is required for all changes** (backend, frontend, and UI-only updates).
- Commit/Sync is **deprecated** and must not be used going forward.

## 2) Preconditions

- GitHub main is the source of truth for production.
- Render service is connected to GitHub main and auto-deploy is enabled.
- Vercel project is connected to GitHub main (fallback: Vercel CLI).
- Required environment variables are configured:
  - Render: `DATABASE_URL`, `NODE_ENV=production`, `SESSION_SECRET`, `CORS_ORIGIN`
  - Vercel: `VITE_API_URL` is the full Render base URL, no trailing slash, no `/api`
- Version reporting is enabled:
  - Backend: `GET /api/version` returns `{ gitSha, buildTime, env }`
  - Frontend: `/version.json` returns `{ gitSha, buildTime }`

## 3) Choose a protocol

- **Full Deploy (required)**: use for all changes, including UI-only updates.
- Commit/Sync: deprecated, do not use.

## 4) Commit/Sync Protocol (Fast Path)

**Deprecated**: Do not use this protocol. All changes must follow Full Deploy.

### 4.1 Pre-flight

1) Ensure working tree is clean and branch is `main`.
2) Run quick QA locally:
   - `npm run check`
   - `npm run build`
3) Confirm `VITE_API_URL` format (no trailing slash, no `/api`).

### 4.2 Commit & Sync

1) Commit changes to `main`.
2) `git push origin main`.
3) Wait for Render and Vercel auto-deploys.

### 4.3 Verify (Minimum)

1) Render health:
   - `curl https://<render-url>/api/health`
2) Render version:
   - `curl https://<render-url>/api/version`
3) Vercel version:
   - `curl https://<vercel-url>/version.json`
4) Smoke flow (5 minutes):
   - Open frontend, login (demo), visit dashboard, visit uploads.

### 4.4 Record Evidence

- Save the three version JSON outputs and a brief note in:
  - `docs/DEPLOYMENT_REPORTS/<YYYY-MM-DD_HHMM>_commit_sync.md`

## 5) Full Deploy Steps (End-to-End)

### 5.1 Pre-flight checks

1) Ensure working tree is clean and branch is `main`.
2) Run QA locally:
   - `npm run check`
   - `npm run build`
3) Run preflight script:
   - `scripts/deploy/full_deploy_preflight.sh`

### 5.2 Commit/Sync rules

- The commit intended for production must be on `main` and pushed to GitHub.
- Local `HEAD` must match `origin/main` before starting verification.

### 5.3 Render deploy (preferred auto-deploy)

- Preferred: push to `main` and allow Render auto-deploy.
- Fallback (manual): trigger a deploy in Render dashboard for the `main` branch.

### 5.4 Vercel deploy (preferred Git integration)

- Preferred: push to `main` and allow Vercel Git integration.
- Fallback (CLI):
  - `scripts/deploy/vercel_prod_deploy.sh`

## 6) Verification (Mandatory)

Record all versions and confirm services are live.

1) GitHub SHA intended for deploy:
   - `git rev-parse --short=12 HEAD`
2) Render deployed version:
   - `curl https://<render-url>/api/version`
3) Vercel deployed version:
   - `curl https://<vercel-url>/version.json`
4) Backend health check:
   - `curl https://<render-url>/api/health`
5) Frontend runtime API base URL:
   - Confirm frontend requests use Render base URL (no `/api/api`).
6) Smoke flow:
   - Load frontend
   - Login (demo)
   - Visit dashboard and uploads

### Automated verification

Use:
- `scripts/deploy/verify_live_versions.sh`

## 7) Post-deploy monitoring (15 minutes)

- Render logs: check for 5xx or database errors.
- Vercel logs: confirm no failed builds or missing assets.
- Frontend smoke: upload sample CSV and verify rowsImported > 0.
- Alerts: watch for CORS errors or /api calls to Vercel origin.

## 8) Troubleshooting Playbook

- Git integration broken (Vercel): use `scripts/deploy/vercel_prod_deploy.sh`.
- Render not deploying latest commit:
  - Confirm Render is connected to the correct GitHub repo and branch.
  - Trigger a manual deploy on the `main` branch.
- Cache/env issues:
  - Recheck `VITE_API_URL` and Render `CORS_ORIGIN` values.
- CORS failures:
  - Ensure Render `CORS_ORIGIN` includes the Vercel production URL.
- vercel.json conflicts:
  - Avoid mixing `routes` with `rewrites/headers/cleanUrls` in `vercel.json`.
- API base URL wrong:
  - `VITE_API_URL` must be Render base URL only (no `/api`, no trailing slash).

## 9) Acceptance Criteria Checklist

- [ ] Local QA passes: `npm run check`, `npm run build`.
- [ ] GitHub main matches intended commit SHA.
- [ ] Render shows correct `/api/version` and `/api/health` responses.
- [ ] Vercel `/version.json` matches intended commit.
- [ ] Frontend calls backend Render base URL.
- [ ] Smoke flow completed without errors.

## 10) One-Command Full Deploy

Run:
- `scripts/deploy/run_full_deploy.sh`

This script runs preflight checks, verifies version endpoints, and writes a deployment report to:
- `docs/DEPLOYMENT_REPORTS/<YYYY-MM-DD_HHMM>_full_deploy.md`

### Environment variables for scripts

- `RENDER_SERVICE_URL`: Render base URL (preferred for backend verification).
- `VERCEL_PROD_URL`: Vercel production URL (required to verify `/version.json`).
- `SUPABASE_PROJECT_REF`: Optional explicit Supabase project ref (non-secret).
- `VERCEL_TOKEN`: Required for Vercel CLI deploys in CI (store as a CI secret, never commit).

**Notes**
- Use the production URL (not a preview/`git-main` URL). Preview URLs often return 401 for `/version.json`.
