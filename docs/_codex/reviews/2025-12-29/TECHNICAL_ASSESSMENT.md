# Technical Assessment

Architecture Overview
- Frontend: React + Vite, Wouter routing, TanStack Query. API client uses VITE_API_URL via `client/src/lib/api.ts`.
- Backend: Express (TypeScript, tsx), routes in `server/routes.ts`, storage in `server/storage.ts` via Drizzle ORM.
- Data: PostgreSQL schema in `shared/schema.ts` with users, transactions, rules, uploads, accounts, goals, budgets, rituals, etc.
- AI: OpenAI SDK optional via `OPENAI_API_KEY`. AI keyword analysis endpoints exist; AI assistant chat not implemented.

Repo & Runtime Baseline
- Scripts: `npm run dev`, `npm run build`, `npm run check`, `npm run db:push`.
- Required env var names (detected): `DATABASE_URL`, `OPENAI_API_KEY`, `CORS_ORIGIN`, `PORT`, `VITE_API_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`.
- App can start without DB (health returns degraded), but all data operations will fail.

Key Risks

Security
- Demo auth only: login auto-creates a user and there is no session/auth middleware (release blocker).
- No authorization on endpoints; all queries are for demo user or unrestricted.
- Request logging in `server/index.ts` now redacts response bodies and logs only keys.
- No rate limiting or CSRF protection (acceptable for demo but not production).

Reliability
- Split deployment risk mitigated: client pages now use API client and VITE_API_URL consistently.
- CSV pipeline: N+1 duplicate checks, row-by-row inserts; can be slow for large CSVs.
- No retry or circuit-breaker for OpenAI calls; failures surface as generic errors.

Performance
- Large client bundle (676KB JS) with warning; likely affects time-to-interactive.
- Transactions list now paginated (50/page); virtualized list still absent for very large datasets.
- Server-side dashboard endpoints likely compute aggregates without caching.

Maintainability
- Category icons/colors duplicated across pages; risk of drift.
- API client usage is now consistent across major pages.
- Copy normalization is mostly complete; minor inconsistencies remain.

Deployment Readiness Notes
- `vercel.json` rewrites all routes to `index.html` and does not proxy `/api`; frontend must use VITE_API_URL for all API calls.
- Health endpoint supports degraded mode when DB is not configured; good for smoke tests.
- No explicit error boundaries in UI; runtime errors may break pages without fallback.

Observability / Logging Gaps
- Structured logging exists for upload pipeline (`server/logger.ts`), but most endpoints do not log business events.
- Request logger redacts response content; still lacks per-endpoint context.
- No metrics or tracing (response times, DB latency) beyond basic request logging.
