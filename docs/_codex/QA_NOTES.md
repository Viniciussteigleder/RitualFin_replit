# QA Notes (Codex)

## 2025-12-29T11:40:14Z (UTC)
- Environment: local
- Commands executed (READ-ONLY): repository inspection and file reads only.
- Commands executed (MUTATING): docs/_codex/ creation and .gitignore update.
- Test results: Not run (analysis-only).
- Failures: None.
- Repro steps: Not applicable.

## 2025-12-29T12:37:15Z (UTC)
- Environment: local
- Commands executed (READ-ONLY): file reads and timestamp check.
- Commands executed (MUTATING): documentation file creation and log updates under docs/_codex.
- Test results: Not run (documentation-only).
- Failures: None.
- Repro steps: Not applicable.

## 2025-12-29T12:44:32Z (UTC)
- Environment: local
- Commands executed (READ-ONLY): timestamp check only.
- Commands executed (MUTATING): documentation updates under docs/_codex.
- Test results: Not run (documentation-only).
- Failures: None.
- Repro steps: Not applicable.

## 2025-12-29T13:02:14Z (UTC)
- Environment: local
- Commands executed (READ-ONLY): mandatory file reads and timestamp check.
- Commands executed (MUTATING): documentation updates under docs/_codex.
- Test results: Not run (documentation-only).
- Failures: None.
- Repro steps: Not applicable.

## 2025-12-29T13:07:57Z (UTC)
- Environment: local
- Commands executed (READ-ONLY): timestamp check only.
- Commands executed (MUTATING): documentation updates under docs/_codex.
- Test results: Not run (documentation-only).
- Failures: None.
- Repro steps: Not applicable.

## 2025-12-29T13:50:17Z (UTC)
- Environment: local
- Commands executed (READ-ONLY): configuration scans and file reads (env usage, routes, client API wiring, deployment docs).
- Commands executed (MUTATING): `npm install`, `npm run check`, `npm run build`, attempted `npm run dev` + `curl /api/health`.
- Test results:
  - `npm run check` failed: existing TypeScript errors in `server/replit_integrations/*` (unrelated to current changes).
  - `npm run build` succeeded with chunk-size warnings.
  - `npm run dev` failed to bind `0.0.0.0:5000` (ENOTSUP) in this environment; `/api/health` could not be verified locally.
- Failures: dev server could not start due to environment socket restriction; typecheck failures pre-existing.
- Repro steps: See CODEX_ACTIVITY_LOG entry 2025-12-29T13:50:17Z.

## 2025-12-29T13:51:48Z (UTC)
- Environment: local
- Commands executed (READ-ONLY): none.
- Commands executed (MUTATING):
  - `npm run check` (initial failure, then pass after fixes)
  - `node -e "<dev smoke + health check script>"`
- Test results:
  - `npm run check` passed after fixing `p-retry` AbortError typing in `server/replit_integrations/batch/utils.ts`.
  - Dev smoke test failed: `npm run dev` exited because `DATABASE_URL` is not set.
  - Endpoint smoke test skipped because dev server failed to start.
  - No secrets printed in test output.
- Failures: Missing `DATABASE_URL` prevents dev server start.
- Repro steps: Set `DATABASE_URL`, rerun `npm run dev`, then `curl http://localhost:5000/api/health`.

## 2026-01-01
- Tests not run (not requested). Suggested: `npm run check`, `tsx script/test-imports.ts`.

## 2026-01-01
- Commands executed:
  - npm run check
  - npx tsx script/test-imports.ts
- Results:
  - TypeScript check: PASS
  - Import parsing script: PASS (Sparkasse/Amex/M&M)

## 2026-01-01
- Command: vercel --prod
- Result: Upload completed; deployment queued (command timed out at 10s). Inspect URL provided by CLI.

## 2026-01-01
- Command: npm run db:push
- Result: FAILED (DATABASE_URL not set)
- Command: npm run dev (HOST=127.0.0.1 PORT=5001)
- Result: FAILED (ENOTSUP: operation not supported on socket)
- Command: curl http://127.0.0.1:5001/api/health
- Result: FAILED (connection refused)
