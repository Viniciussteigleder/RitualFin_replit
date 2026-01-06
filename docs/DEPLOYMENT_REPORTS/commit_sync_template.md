# Commit/Sync Deployment Report

Timestamp (UTC): <YYYY-MM-DD_HHMM>

## GitHub
- Branch: main
- Commit SHA: <short-sha>

## Environment
- Render URL: <https://...>
- Vercel URL: <https://...>
- Supabase Project Ref: <project-ref>

## Version Checks
- Render /api/health:
  - Status: <ok|degraded|error>
  - Response: <json>
- Render /api/version:
  - Response: <json>
- Vercel /version.json:
  - Response: <json>

## Smoke Flow
- Login: pass/fail
- Dashboard load: pass/fail
- Uploads page load: pass/fail
- Optional: Upload sample CSV: pass/fail

## Notes
- <any anomalies, follow-ups>
