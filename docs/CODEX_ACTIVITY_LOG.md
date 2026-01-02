# Codex Activity Log

## 2025-01-01

### Plan
1) Review existing deployment docs/scripts and current deploy architecture for duplication and constraints.
2) Add minimal version reporting (backend endpoint + frontend build artifact) to enable reliable verification.
3) Create deployment protocol documentation and deploy scripts (preflight, verify, fallback deploy).
4) Wire a one-command full deploy runner that records a report artifact.
5) Run required QA commands and record results.

### Decision Log
- A) Add only backend /api/version and embed backend info in frontend build vs B) Add backend /api/version + frontend /version.json.
  - Chosen: B for clearer separation and direct frontend version verification without coupling to backend runtime.
  - Revisit if frontend build pipeline cannot write to public output safely.

### Files Touched
- docs/CODEX_ACTIVITY_LOG.md
- docs/FULL_DEPLOY_PROTOCOL.md
- docs/DEPLOYMENT_REPORTS/.gitkeep
- script/build.ts
- server/routes.ts
- scripts/deploy/full_deploy_preflight.sh
- scripts/deploy/vercel_prod_deploy.sh
- scripts/deploy/render_verify.sh
- scripts/deploy/verify_live_versions.sh
- scripts/deploy/run_full_deploy.sh
- vercel.json

### Commands Executed
- git checkout -b fix/full-deploy-protocol
- npm run check
- npm run build
- ALLOW_NON_MAIN=1 ALLOW_DIRTY=1 scripts/deploy/full_deploy_preflight.sh

### QA Results
- npm run check: PASS
- npm run build: PASS (bundle size warnings only)
- scripts/deploy/full_deploy_preflight.sh: PASS (overrides used for non-main/dirty tree)

### How To Run Full Deploy Protocol
- scripts/deploy/run_full_deploy.sh

### Notes
- Corrected branch to fix/full-deploy-protocol before proceeding.

## 2026-01-02

### Work Log
- Localized remaining UI labels and accessibility strings.
- Added Vite vendor chunk splitting to reduce bundle size warnings.
- Ran full deploy protocol with live verification.

### Commands Executed
- npm run check
- npm run build
- RENDER_SERVICE_URL=https://ritualfin-api.onrender.com VERCEL_PROD_URL=https://ritual-fin-replit.vercel.app scripts/deploy/run_full_deploy.sh

### QA Results
- npm run check: PASS
- npm run build: PASS

### Deployment Reports
- docs/DEPLOYMENT_REPORTS/2026-01-02_1733_full_deploy.md
