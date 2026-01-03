# Feature Verification Matrix

Legend: PASS / FAIL / BLOCKED

| Feature / Flow | Expected Behavior | How Tested (steps/commands) | Result |
| --- | --- | --- | --- |
| Repo build gate | Typecheck and production build succeed | `npm run check`; `npm run build` | PASS |
| Health check | `/api/health` returns ok or degraded with DB status | BLOCKED (no `DATABASE_URL`) | BLOCKED (DB not configured) |
| Auth: login | `POST /api/auth/login` creates/returns user | Static review: `server/routes.ts` | PASS (demo-only) |
| Auth: get me | `GET /api/auth/me` returns current user | Static review: `server/routes.ts` | PASS (demo-only) |
| Settings (auto-confirm) | GET/PATCH user settings | Static review: `server/routes.ts`, `client/src/pages/settings.tsx` | PASS (demo-only) |
| Notifications CRUD | List/create/update/delete notifications | Static review: `server/routes.ts`, `client/src/pages/notifications.tsx` | PASS (backend + UI) |
| Accounts CRUD | List/create/update/archive accounts | Static review: `server/routes.ts`, `client/src/pages/accounts.tsx` | PASS (code) |
| Account balance | `/api/accounts/:id/balance` returns aggregate | Static review: `server/routes.ts`, `client/src/pages/accounts.tsx` | PASS (backend + UI) |
| Upload CSV | Upload CSV, parse, dedupe, create transactions | Static review: `server/csv-parser.ts`, `server/routes.ts`, `client/src/pages/uploads.tsx` | PASS (code) |
| Upload errors detail | `/api/uploads/:id/errors` returns row errors | Static review: `server/routes.ts`, `client/src/pages/uploads.tsx` | PASS (backend + UI) |
| Transactions list | `/transactions` displays filtered month list | Static review: `client/src/pages/transactions.tsx` | PASS (code) |
| Transaction edit | Edit in dialog updates transaction | Static review: `client/src/pages/transactions.tsx`, `server/routes.ts` | PASS (code) |
| Export CSV | Exports filtered transactions | Static review: `client/src/pages/transactions.tsx` | PASS (code) |
| Confirm queue | `/confirm` lists `needsReview` items; bulk confirm | Static review: `client/src/pages/confirm.tsx`, `server/routes.ts` | PASS (code) |
| Rules CRUD | Create/update/delete rules; reapply | Static review: `client/src/pages/rules.tsx`, `server/routes.ts` | PASS (code) |
| Dashboard metrics | `/dashboard` shows totals + categories | Static review: `client/src/pages/dashboard.tsx`, `server/routes.ts` | PASS (code) |
| Dashboard -> calendar events fetch | Pulls calendar events via API | Static review: `client/src/pages/dashboard.tsx` uses API client | PASS (code) |
| Calendar view | Month view + events | Static review: `client/src/pages/calendar.tsx` uses API client | PASS (code) |
| Calendar event detail | Event detail page uses API client | Static review: `client/src/pages/event-detail.tsx` | PASS (code) |
| Budgets | CRUD monthly budgets | Static review: `client/src/pages/budgets.tsx`, `server/routes.ts` | PASS (code) |
| Goals | Monthly goals and progress | Static review: `client/src/pages/goals.tsx`, `server/routes.ts` | PASS (code) |
| Rituals | Weekly/monthly ritual flow | Static review: `client/src/pages/rituals.tsx`, `server/routes.ts` | PASS (code) |
| AI keyword analysis | Analyze and apply suggestions | Static review: `client/src/pages/ai-keywords.tsx`, `server/routes.ts` | PASS (code) |
| AI usage logs | `/api/ai/usage` returns logs | Static review: `server/routes.ts` | PASS (backend) / BLOCKED (no DB) |
| Merchant metadata | CRUD + match | Static review: `server/routes.ts`, `client/src/pages/merchant-metadata.tsx` | PASS (backend + UI) |
| AI assistant chat | SSE chat backend | Code search: no `/api/ai/chat` route | FAIL (not implemented) |
| Screenshot/image import | Upload screenshots, OCR, balances | Code search: no endpoints/UI | FAIL (not implemented) |
| Production API base routing | Client should call backend URL in prod | Static review: no direct `/api` fetches in pages | PASS (code) |

Notes
- Runtime endpoint tests were blocked because `DATABASE_URL` is not set in this environment.
- PASS (code) indicates static verification only; functional runtime verification pending DB and dev server.
