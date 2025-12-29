# Environment Drift Notes (Codex)

## 2025-12-29T11:40:14Z (UTC)
- Local-only artifacts: .vercel/ (ignored in .gitignore).
- Local env file present: .env.local contains sensitive token values (redacted); do not log.
- Build-time env: Vite uses VITE_* vars at build time; cache invalidation required for updates.
- Assumption gaps: Local database connectivity and schema state not validated in this session.
