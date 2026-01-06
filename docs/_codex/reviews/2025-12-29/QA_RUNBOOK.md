# QA Runbook

Preflight
1) Install deps (if needed): `npm install`
2) Typecheck: `npm run check`
3) Build: `npm run build`

Environment (names only)
- Required: `DATABASE_URL`
- Optional: `OPENAI_API_KEY`, `CORS_ORIGIN`, `PORT`, `VITE_API_URL`
- Optional (Replit integrations): `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

Database Setup (if DB available)
1) Set `DATABASE_URL`
2) Apply schema: `npm run db:push`

Run Dev Server
- `npm run dev`
- Expect server on `http://localhost:5000`

Smoke Tests (curl)
- Health: `curl http://localhost:5000/api/health`
- Auth: `curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"demo","password":"demo"}'`
- Me: `curl http://localhost:5000/api/auth/me`
- Dashboard: `curl "http://localhost:5000/api/dashboard?month=2025-12"`
- Accounts: `curl http://localhost:5000/api/accounts`
- Uploads list: `curl http://localhost:5000/api/uploads`
- Transactions list: `curl "http://localhost:5000/api/transactions?month=2025-12"`
- Confirm queue: `curl http://localhost:5000/api/transactions/confirm-queue`
- Rules list: `curl http://localhost:5000/api/rules`
- Budgets list: `curl "http://localhost:5000/api/budgets?month=2025-12"`
- Goals list: `curl "http://localhost:5000/api/goals?month=2025-12"`
- Calendar events list: `curl http://localhost:5000/api/calendar-events`
- Rituals list: `curl "http://localhost:5000/api/rituals?type=weekly&period=2025-W01"`
- Notifications list: `curl http://localhost:5000/api/notifications`

Upload Flow (manual)
1) Start dev server.
2) Open `/uploads` in browser.
3) Upload sample CSV (M&M, Amex, Sparkasse).
4) Verify upload history updated and confirm queue populated.
5) Open `/confirm` and confirm items.

AI Keyword Analysis (requires OPENAI_API_KEY)
- POST `http://localhost:5000/api/ai/analyze-keywords`
- POST `http://localhost:5000/api/ai/apply-suggestions`

What "Done" Means
- `npm run check` and `npm run build` pass
- Health endpoint returns `ok` when DB is configured
- Core flows (upload -> confirm -> dashboard) complete without errors
- No production routing issues (all client calls use VITE_API_URL)
