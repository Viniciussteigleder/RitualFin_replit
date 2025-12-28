# IMPLEMENTATION ROADMAP

**Project**: RitualFin
**Last Updated**: 2025-12-28
**Status**: Phase C partially complete (3/6), Deployment track starting

---

## COMPLETED WORK

### Phase A: Planning & Handoff Documentation
**Date**: 2025-12-28
**Commit**: `847c307`

- Created `IMPLEMENTATION_LOG.md`
- Created `ARCHITECTURE_AND_AI_LOGIC.md`
- Created `QUALITY_ASSURANCE_AND_DEBUG.md`
- Documented existing architecture and AI logic
- Established development workflow and quality standards

---

### Phase B: UX Overhaul (UI Implementation)
**Date**: 2025-12-28
**Commits**: `c3b72c6`, `6543e4c`, `b37bc59`

**Session 1: Critical Fixes**
- Bank logo components
- Merchant icon system
- Transaction detail modal

**Session 2: UX Polish**
- Skeleton loading states
- Onboarding modal
- Keyboard shortcuts

**Session 3: AI Assistant UI**
- Floating AI assistant button
- Chat modal interface (backend pending)

**Total**: 23 files, 2,713 insertions

---

### Phase C: Backend Services (PARTIAL)
**Date**: 2025-12-28
**Status**: ✅ 3/6 tasks complete
**Commits**: `238c91d`, `7e60e39`, `73d0f3d`

#### ✅ C.1: Account Balance Service
**Commit**: `238c91d`

**Objective**: Calculate and expose account balances via API

**Scope**:
- ✅ New endpoint: `GET /api/accounts/:id/balance`
- ✅ Returns `{ balance, currency, transactionCount }`
- ✅ Optional date filtering (`startDate`, `endDate`)
- ✅ Excludes internal transfers

**Files Modified**:
- `server/storage.ts`: +42 lines
- `server/routes.ts`: +28 lines

**Endpoints**:
- `GET /api/accounts/:id/balance`
- `GET /api/accounts/:id/balance?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Key Decisions**:
1. **Exclude internal transfers**: Avoid double-counting (e.g., transfer from savings to checking)
2. **Single currency per account**: Simplify MVP, revisit if multi-currency needed
3. **Date range filtering**: Enable future features like "balance on date X"

**Dependencies**: None
**Model Used**: Haiku

---

#### ✅ C.2: CSV Row-Level Errors
**Commit**: `7e60e39`

**Objective**: Track and expose individual CSV parsing errors

**Scope**:
- ✅ New table: `upload_errors` (uploadId, rowNumber, errorMessage, rawData)
- ✅ New endpoint: `GET /api/uploads/:id/errors`
- ✅ Automatic error saving during CSV upload
- ✅ Cascade delete when upload is deleted

**Files Modified**:
- `shared/schema.ts`: +20 lines
- `server/storage.ts`: +14 lines
- `server/routes.ts`: +78 lines
- Database: `upload_errors` table created

**Endpoints**:
- `GET /api/uploads/:id/errors` → `{ uploadId, errors: [...], count: N }`

**Key Decisions**:
1. **Store rawData**: Optional nullable field for debugging
2. **Parse error strings**: Use regex on "Linha X: error" format (MVP approach)
3. **Cascade delete**: Keep DB clean
4. **Structured response**: Include uploadId, errors array, and count

**Dependencies**: None
**Model Used**: Haiku

---

#### ✅ C.3: Merchant Icon Metadata
**Commit**: `73d0f3d`

**Objective**: Store and retrieve merchant icon/color metadata with pattern matching

**Scope**:
- ✅ New table: `merchant_metadata` (pattern, friendlyName, icon, color)
- ✅ Full CRUD endpoints
- ✅ Pattern matching with case-insensitive substring search
- ✅ Auto-normalization to uppercase

**Files Modified**:
- `shared/schema.ts`: +21 lines
- `server/storage.ts`: +55 lines
- `server/routes.ts`: +69 lines
- Database: `merchant_metadata` table created

**Endpoints**:
- `GET /api/merchant-metadata`
- `POST /api/merchant-metadata`
- `PUT /api/merchant-metadata/:id`
- `DELETE /api/merchant-metadata/:id`
- `GET /api/merchant-metadata/match?description=X`

**Key Decisions**:
1. **Substring matching**: Simple `includes()` instead of regex (faster, sufficient)
2. **Lucide icons only**: Store icon names, not URLs (consistent with app)
3. **No unique constraint**: Allow multiple patterns, first-match wins
4. **No default seeds**: Users create their own

**Dependencies**: None
**Model Used**: Haiku

---

## OPEN WORK (Phase C - NOT IMPLEMENTED)

### ⏸️ C.4: AI Usage Tracking
**Status**: Planned but not implemented
**Model**: Haiku (simple CRUD + logging)

**Objective**: Track OpenAI API usage for cost monitoring

**Scope IN**:
- Table: `ai_usage_logs` (userId, operation, tokensUsed, cost, timestamp)
- Logging wrapper for OpenAI API calls
- Endpoint: `GET /api/ai/usage?startDate=X&endDate=Y`

**Scope OUT**:
- Real-time usage alerts
- Per-user billing/quotas
- Third-party analytics integration

**Dependencies**: None

**Acceptance Criteria**:
- [ ] Logs created for each AI call (categorization, chat, bulk)
- [ ] GET /api/ai/usage returns usage summary
- [ ] Date filtering works (startDate, endDate)
- [ ] Cost calculated correctly (tokens × GPT-4 price)
- [ ] Logs include operation type (categorize, chat, bulk)

**QA Checklist**:
1. Call AI categorization endpoint
2. Verify log created in `ai_usage_logs` table
3. GET /api/ai/usage returns correct token count
4. Filter by date returns subset
5. Cost calculation matches OpenAI pricing

**Decision Log**:
- **Store tokens vs cost** (A vs B → B): Store both for transparency and future price changes
- **Aggregate endpoint** (A vs B → A): Return raw logs with totals, let frontend aggregate
- **Real-time vs batch** (A vs B → B): Log synchronously on each call (simple, no queue needed)

---

### ⏸️ C.5: Notification Backend
**Status**: Planned but not implemented
**Model**: Haiku (simple CRUD)

**Objective**: Backend support for notification system (UI exists but not functional)

**Scope IN**:
- Table: `notifications` (userId, type, message, isRead, createdAt)
- CRUD endpoints for notifications
- Mark as read/unread
- Optional: trigger notifications on events (e.g., upload complete)

**Scope OUT**:
- Email/SMS notifications
- Push notifications
- Real-time websocket updates

**Dependencies**: None

**Acceptance Criteria**:
- [ ] Create notification via POST
- [ ] GET /api/notifications returns user's notifications (sorted by createdAt DESC)
- [ ] PATCH /api/notifications/:id/read marks as read
- [ ] DELETE /api/notifications/:id removes notification
- [ ] Notifications scoped to userId

**QA Checklist**:
1. Create test notification
2. Verify it appears in GET /api/notifications
3. Mark as read, verify `isRead = true`
4. Delete, verify 404 on subsequent GET
5. Verify other users cannot see each other's notifications

**Decision Log**:
- **Auto-trigger vs manual** (A vs B → B): Start with manual creation, add auto-triggers later
- **Real-time updates** (A vs B → B): Polling for MVP, websockets in future if needed
- **Notification types** (A vs B → A): Simple enum (info, warning, error, success)

---

### ⏸️ C.6: AI Assistant Backend
**Status**: Planned but not implemented
**Model**: **Sonnet** (complex SSE streaming + OpenAI integration)

**Objective**: Streaming AI assistant backend for chat interface (frontend exists)

**Scope IN**:
- SSE endpoint: `POST /api/ai/chat` (streaming response)
- Integration with OpenAI GPT-4
- Context: user's transactions, budgets, goals
- Stream responses token-by-token
- Save conversation history (optional)

**Scope OUT**:
- Complex multi-turn memory management
- RAG/vector search over transactions
- Voice input/output

**Dependencies**:
- OpenAI API key
- C.4 (AI usage tracking) for logging

**Acceptance Criteria**:
- [ ] POST /api/ai/chat streams responses via SSE
- [ ] Frontend receives SSE events (data, done)
- [ ] Responses include transaction context
- [ ] Usage logged via C.4
- [ ] Conversation history saved (optional)

**QA Checklist**:
1. Send chat message: "Analise meus gastos este mês"
2. Verify SSE stream received in frontend
3. Check AI response includes transaction data
4. Verify usage logged in `ai_usage_logs`
5. Test error handling (invalid API key, timeout)

**Decision Log**:
- **Streaming vs batch** (A vs B → A): SSE streaming for better UX (requires Sonnet)
- **Context strategy** (A vs B → B): Query recent transactions on each request (simple, stateless)
- **Conversation history** (A vs B → A): Store in DB for future sessions (add later)
- **Model choice** (A vs B → A): GPT-4 for quality, fallback to GPT-3.5-turbo for cost

**Why Sonnet Model Required**:
- Complex SSE streaming implementation
- OpenAI integration with proper error handling
- Context assembly from multiple data sources
- Token management and chunking

---

## NEXT MAJOR TRACK: Supabase + Vercel Deployment

**Status**: Planning phase starting
**Date**: 2025-12-28

**Objective**: Set up production deployment path using Supabase (DB + Auth) and Vercel (hosting)

**Why This Track**:
- Current setup: Local PostgreSQL + development server
- Need: Production-ready hosting with scalability
- Benefits: Managed DB, built-in auth, serverless hosting

**Prerequisites**:
1. Read current architecture (`ARCHITECTURE_AND_AI_LOGIC.md`)
2. Assess compatibility with serverless constraints
3. Plan migration strategy for existing data

### Options Under Consideration

#### Option 1: Vercel Serverless + Supabase
**Pros**:
- Simple deployment (git push)
- Auto-scaling
- Low cost at small scale

**Cons**:
- 10s function timeout (may affect CSV parsing)
- Cold start latency
- Stateless (session handling changes)

**Risks**:
- CSV uploads >10MB may fail
- Long-running AI requests may timeout

**Mitigations**:
- Background jobs for large CSVs
- Streaming responses for AI
- Edge runtime where possible

---

#### Option 2: Vercel Frontend + Separate Backend
**Pros**:
- No timeout constraints on backend
- Long-running CSV parsing
- Traditional session management

**Cons**:
- More complex deployment
- Higher cost (backend hosting)
- CORS configuration needed

**Risks**:
- Two separate deployments
- Additional infrastructure

**Mitigations**:
- Use Render/Fly/Railway for backend
- Clear API boundaries
- Unified environment config

---

### Cost Implications

**Supabase** (small scale):
- Free tier: 500MB DB, 2GB transfer/month
- Pro: $25/month (8GB DB, 250GB transfer)

**Vercel** (small scale):
- Hobby: Free (100GB bandwidth, serverless functions)
- Pro: $20/month/user (1TB bandwidth, advanced analytics)

**Backend Hosting** (if Option 2):
- Render: $7-25/month
- Fly.io: ~$5-15/month
- Railway: ~$5/month base

**Total Estimated Cost**:
- Option 1: $0-45/month (Supabase + Vercel)
- Option 2: $5-65/month (Supabase + Vercel + backend)

---

### Migration & Rollback Strategy

**Migration Approach**:
1. **Schema**: Export Drizzle schema, apply to Supabase
2. **Data**: Dump existing PostgreSQL, import to Supabase (if data exists)
3. **Secrets**: Move env vars to Vercel/Supabase settings
4. **Testing**: Deploy to staging environment first

**Rollback Plan**:
1. Keep local PostgreSQL running during migration
2. Dual-write to both DBs for 24h (if critical data)
3. Revert Vercel deployment to previous commit
4. Switch DATABASE_URL back to local

**Zero-Downtime Expectations**:
- ❌ **Not realistic for first deployment** (schema changes, data migration)
- ✅ **Realistic for future deployments** (Vercel rollback is instant)

---

### Acceptance Criteria (Deployment)

**Must Have**:
- [ ] Deploy succeeds on Vercel
- [ ] API health endpoint responds (`GET /api/health`)
- [ ] Supabase DB connectivity verified
- [ ] Upload flow works with sample CSV (first 20 rows test)
- [ ] No secrets in logs or client-side code
- [ ] `npm run check` passes
- [ ] Transactions page loads with data
- [ ] Confirm page works

**Should Have**:
- [ ] Environment variables properly scoped (client vs server)
- [ ] CORS configured correctly
- [ ] Error tracking setup (Sentry or similar)
- [ ] Performance monitoring (Vercel Analytics)

**Nice to Have**:
- [ ] Preview deployments for PRs
- [ ] Automatic database backups
- [ ] Staging environment separate from production

---

### Execution Phase Gating

**Before Implementation**:
1. ✅ Document current state assessment
2. ✅ Present deployment options (A vs B)
3. ✅ Create detailed Supabase setup plan
4. ✅ Create detailed Vercel setup plan
5. ⏸️ **STOP - Wait for explicit approval**

**After Approval**:
1. Implement in small, reversible commits
2. Each commit documented in `IMPLEMENTATION_LOG.md`
3. Each commit pushed to git
4. Test after each commit
5. Deploy to staging before production

---

### Decision Log (Why This Order)

**Why Deployment Track Before C.4-C.6?**
- **Risk Mitigation**: Deployment constraints may affect C.6 (AI streaming)
- **Infrastructure First**: Need production DB before production features
- **Cost Awareness**: Know hosting limits before implementing expensive features
- **Stakeholder Value**: Production deployment shows progress

**When to Resume C.4-C.6?**
- After successful staging deployment
- After confirming serverless constraints (timeout, memory)
- After validating AI streaming works in production environment

---

## TIMELINE OVERVIEW

| Phase | Status | Date | Commits |
|-------|--------|------|---------|
| Phase A: Planning | ✅ Complete | 2025-12-28 | `847c307` |
| Phase B: UX Overhaul | ✅ Complete | 2025-12-28 | `c3b72c6`, `6543e4c`, `b37bc59` |
| Phase C.1-C.3: Backend (partial) | ✅ Complete | 2025-12-28 | `238c91d`, `7e60e39`, `73d0f3d` |
| Phase C.4-C.6: Backend (remaining) | ⏸️ Paused | TBD | - |
| Deployment: Supabase + Vercel | 🚀 Planning | 2025-12-28 | - |

---

## MAINTENANCE & FUTURE WORK

### Post-Deployment Tasks
- [ ] Set up monitoring (uptime, errors, performance)
- [ ] Configure automated backups
- [ ] Document runbook for common issues
- [ ] Create deployment checklist
- [ ] Set up staging environment

### Future Enhancements
- [ ] Complete Phase C.4-C.6
- [ ] Add email notifications
- [ ] Multi-user support (remove "demo" user)
- [ ] Mobile-responsive improvements
- [ ] PDF export for reports

---

**End of Roadmap**
