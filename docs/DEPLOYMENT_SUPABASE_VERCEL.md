# Supabase + Vercel Deployment Plan

**Project**: RitualFin
**Last Updated**: 2025-12-28
**Status**: Planning phase (no code changes yet)
**Reading Time**: ~15 minutes

---

## A) CURRENT STATE ASSESSMENT

### Server Architecture

**Entry Point**: `server/index.ts`
- Express server on port 5000 (configurable via `PORT` env var)
- HTTP server (not HTTPS in dev)
- Development: `tsx server/index.ts` (TypeScript execution)
- Production: `node dist/index.cjs` (compiled bundle)

**Routing**:
- All routes in `server/routes.ts` (monolithic)
- API routes: `/api/*`
- Static serving: `dist/` (production) or Vite dev server (development)

**Database Layer**:
- **ORM**: Drizzle ORM (`drizzle-orm`)
- **Client**: PostgreSQL via `pg` driver
- **Connection**: Direct connection pool (`server/db.ts`)
- **Schema Management**: `drizzle-kit push` (no migrations, direct schema sync)
- **Schema Location**: `shared/schema.ts` (shared with client for types)

**Current Environment Variables**:
```
DATABASE_URL=postgresql://...         # Required
OPENAI_API_KEY=sk-...                 # Optional (for AI features)
NODE_ENV=development|production       # Set by scripts
PORT=5000                             # Default, configurable
```

**Session/Auth Approach**:
- **Current**: Simplified "demo" user system
- **Implementation**: Auto-creates user with username="demo", password="demo"
- **Session Store**: In-memory (`memorystore`) for development
- **Production Ready?**: ❌ NO - needs proper auth before production

**File Upload Handling**:
- CSV files sent as JSON payload (base64 or string)
- Size limit: 10MB (`express.json({ limit: "10mb" })`)
- Processing: Synchronous in-memory parsing
- No file system writes
- CSV formats: Miles & More, American Express, Sparkasse

**Long-Running Operations**:
- CSV parsing: Synchronous, can take 2-5s for 500+ rows
- AI categorization: OpenAI API calls (1-3s per request)
- Bulk operations: Sequential processing of transaction arrays

**Runtime Assumptions**:
- Node.js 20.x
- Single-threaded event loop
- No background job queue
- No caching layer (besides TanStack Query on client)

---

## B) TARGET DEPLOYMENT ARCHITECTURE (ALTERNATIVES)

### Option 1: Vercel Serverless + Supabase Postgres ⚠️ **NOT RECOMMENDED**

**Architecture**:
```
User → Vercel Edge/Serverless Functions → Supabase PostgreSQL
                                        ↓
                                   Supabase Auth (future)
```

**Pros**:
- ✅ Simple deployment (git push)
- ✅ Auto-scaling
- ✅ Low cost at small scale ($0-25/month)
- ✅ Built-in CDN
- ✅ Preview deployments for PRs

**Cons**:
- ❌ **10-second function timeout** (Hobby plan)
- ❌ **25-second timeout** (Pro plan, still risky)
- ❌ Cold start latency (500ms-2s)
- ❌ Stateless (session handling requires external store)
- ❌ 4.5MB bundle size limit (serverless)
- ❌ 1MB response size limit (edge)

**Constraints**:
| Constraint | Current App | Impact |
|------------|-------------|---------|
| Function timeout | CSV parsing: 2-5s | ⚠️ **May fail for 500+ row CSVs** |
| Bundle size | ~5-10MB after bundling | ⚠️ **May exceed serverless limit** |
| Response size | JSON responses < 500KB | ✅ OK |
| Cold start | First request slow | ⚠️ Poor UX for infrequent users |

**Risks**:
1. **CSV uploads timeout**: 500+ rows may exceed 10s limit
2. **AI requests timeout**: OpenAI streaming may exceed timeout
3. **Bundle size**: Dependencies (Drizzle, OpenAI SDK, etc.) may exceed 4.5MB
4. **Session management**: Requires external store (Vercel KV, Supabase, etc.)

**Mitigations** (if chosen):
- Use Edge Runtime for faster cold starts (but more restrictions)
- Background jobs via Vercel Cron or Queue (Pro plan only)
- Streaming responses for AI (SSE)
- Paginate CSV processing (20 rows at a time)
- Client-side chunking for large CSVs

**Verdict**: ⚠️ **High Risk** - Current architecture not compatible with serverless constraints

---

### Option 2: Vercel Frontend + Separate Backend Runtime ✅ **RECOMMENDED**

**Architecture**:
```
User → Vercel (React SPA) → API Backend (Render/Fly/Railway)
                                     ↓
                              Supabase PostgreSQL
                                     ↓
                              Supabase Auth (future)
```

**Pros**:
- ✅ **No timeout constraints** on backend
- ✅ Long-running CSV parsing (10s+)
- ✅ Traditional session management (express-session + pg-simple)
- ✅ WebSocket support (for future real-time features)
- ✅ Easier debugging (persistent logs)
- ✅ Familiar deployment model

**Cons**:
- ❌ Higher cost (~$7-25/month for backend)
- ❌ Two separate deployments (frontend + backend)
- ❌ CORS configuration needed
- ❌ More infrastructure to manage

**Backend Hosting Options**:
| Service | Free Tier | Paid | Pros | Cons |
|---------|-----------|------|------|------|
| Render | 750h/month | $7/mo | Easy setup, auto-deploy | Slow cold start on free tier |
| Fly.io | Yes | ~$5-15/mo | Fast, global edge | Pricing complexity |
| Railway | $5 credit/mo | ~$5-10/mo | Simple, good DX | No free tier anymore |
| Replit | Current host | $20/mo | Already familiar | More expensive |

**Recommended**: **Render** (Web Service, $7/month starter)
- Always-on (no cold starts)
- Auto-deploy from GitHub
- Health checks
- Logs

**Constraints**:
| Constraint | Current App | Impact |
|------------|-------------|---------|
| Request timeout | Configurable (60s+) | ✅ OK for all operations |
| Memory | 512MB-4GB | ✅ OK (app uses <500MB) |
| Response size | Unlimited | ✅ OK |
| WebSocket | Supported | ✅ Future-ready |

**Risks**:
1. **CORS complexity**: Need to configure allowed origins
2. **Two deployments**: Coordination required for changes
3. **Cost**: ~$32/month total (Supabase Pro + Vercel + Render)

**Mitigations**:
- CORS middleware in Express with env var for allowed origin
- Monorepo with separate CI/CD for frontend/backend
- Start with free tiers, upgrade as needed

**Verdict**: ✅ **Low Risk** - Current architecture compatible with minimal changes

---

### Cost Comparison (Small Scale: <1000 users, <50GB DB)

| Component | Option 1 (Serverless) | Option 2 (Split) |
|-----------|----------------------|------------------|
| **Supabase** | $0-25/mo | $0-25/mo |
| **Vercel** | $0-20/mo | $0 (Hobby) |
| **Backend** | N/A | $7/mo (Render) |
| **Total** | $0-45/mo | $7-32/mo |

**Recommendation**: **Option 2** - More predictable costs, lower risk

---

## C) SUPABASE SETUP PLAN (DETAILED)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Sign up/Log in
2. Click "New Project"
3. Settings:
   - **Organization**: Create new or select existing
   - **Project Name**: `ritualfin-prod` (or `ritualfin-dev` for staging)
   - **Database Password**: Generate strong password (save in password manager)
   - **Region**: Choose closest to users (e.g., `eu-central-1` for Europe)
   - **Pricing Plan**: Start with **Free** ($0/month), upgrade to **Pro** ($25/month) when needed

4. Wait for provisioning (~2 minutes)

---

### Step 2: Configure Database

**Connection Strings** (from Supabase Dashboard → Settings → Database):
```bash
# Direct connection (for migrations, local dev)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Transaction pooler (for serverless, if using Option 1)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true

# Session pooler (for long-lived connections, Option 2)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Use Session Pooler (Port 5432)** for Option 2 (recommended).

**IPv6 Support**: Supabase databases support IPv6 (Vercel requires this).

---

### Step 3: Apply Schema/Migrations (Drizzle Strategy)

**Current Approach**: `drizzle-kit push` (direct schema sync, no migrations)

**Recommendation for Production**: Continue with `push` but:
1. Always test on staging environment first
2. Backup database before pushing schema changes
3. Consider switching to migrations later for auditability

**Steps**:
```bash
# 1. Update local .env with Supabase DATABASE_URL
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# 2. Test connection
npm run check

# 3. Apply schema
npm run db:push

# Expected output:
# [✓] Pulling schema from database...
# [✓] Changes applied
```

**Schema Validation**:
- Go to Supabase Dashboard → Table Editor
- Verify all tables exist:
  - `users`, `settings`, `accounts`, `uploads`, `upload_errors`
  - `merchant_metadata`, `transactions`, `rules`
  - `budgets`, `calendarEvents`, `eventOccurrences`
  - `goals`, `categoryGoals`, `rituals`

---

### Step 4: Seed Strategy

**Current Seeds**: None (users created dynamically via "demo" user)

**Recommendation**:
1. **Dev/Staging**: Seed with test data
   - Create seed script: `server/seed.ts`
   - Load sample CSVs
   - Create demo rules

2. **Production**: No seeds initially
   - Users create their own accounts via auth
   - Import their own data via CSV uploads

**Seed Script Template**:
```typescript
// server/seed.ts
import { storage } from "./storage";

async function seed() {
  console.log("Seeding database...");

  // Create demo user
  const user = await storage.createUser({
    username: "demo",
    password: "demo" // Hash in production!
  });

  // Create sample rules (from AI_SEED_RULES)
  // ...

  console.log("Seeding complete!");
}

seed().catch(console.error);
```

**Run Seeds**:
```bash
# Dev/staging only
tsx server/seed.ts
```

---

### Step 5: Auth Plan (Staged Approach)

**Current State**: Simplified "demo" user (NOT production-ready)

**Staging Strategy (Now)**:
1. Keep "demo" user approach for initial deployment
2. Add env var gate: `ENABLE_DEMO_AUTH=true` (dev only)
3. Add warning banner in UI: "Demo mode - do not use with real data"

**Production Strategy (Later - Phase D)**:
1. Enable Supabase Auth:
   - Email/password authentication
   - Social logins (Google, GitHub) optional
2. Update backend to use Supabase Auth JWT
3. Remove "demo" user code
4. Migrate existing data to proper user accounts

**Auth Implementation Checklist** (for future):
- [ ] Enable Supabase Auth in dashboard
- [ ] Configure auth providers (email, social)
- [ ] Install `@supabase/supabase-js` on client
- [ ] Replace Express session with Supabase Auth
- [ ] Update API routes to validate JWT
- [ ] Add signup/login/logout flows in UI

---

### Step 6: Security Baseline

#### Row Level Security (RLS)

**Current State**: No RLS (all queries filter by userId in application code)

**Recommendation - Staged Rollout**:

**Phase 1 (Now)**: Disable RLS, rely on application-level security
- Safer for initial deployment (avoid lockouts)
- All tables created with RLS disabled
- Service role key used for backend (full access)

**Phase 2 (After Auth)**: Enable RLS with policies
```sql
-- Example RLS policy for transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own transactions"
  ON transactions
  FOR ALL
  USING (user_id = auth.uid());
```

**Tables Requiring RLS (Future)**:
- `transactions`, `rules`, `budgets`, `goals`, `rituals`
- `uploads`, `upload_errors`, `merchant_metadata`
- `accounts`, `calendarEvents`, `notifications` (if implemented)

**Tables NOT Requiring RLS**:
- `users` (managed by Supabase Auth)

#### Service Role Key Usage Policy

**Service Role Key**: Full database access, bypasses RLS
- **Use**: Backend API only (server-side)
- **Never**: Expose to client-side code
- **Storage**: Environment variable (`SUPABASE_SERVICE_ROLE_KEY`)
- **Rotation**: Monthly (manual via Supabase dashboard)

**Anon Key**: Limited access, respects RLS
- **Use**: Client-side (if using Supabase Auth)
- **Public**: Safe to expose in client bundle
- **Storage**: Environment variable (`SUPABASE_ANON_KEY`)

**Current Plan** (Option 2):
- Backend uses **Service Role Key** via `DATABASE_URL` (direct connection)
- Client does NOT use Supabase directly (all API calls go through backend)
- No Supabase JS SDK on client (yet)

---

## D) VERCEL SETUP PLAN (DETAILED)

### Step 1: Vercel Project Setup

1. Go to [vercel.com](https://vercel.com) → Sign up/Log in
2. Click "Add New..." → Project
3. Import Git Repository:
   - Connect GitHub account
   - Select repository: `your-username/ritualfin`
   - Click "Import"

---

### Step 2: Build/Output Config

**Framework Preset**: Vite
- Vercel auto-detects Vite from `package.json`

**Build Command**:
```bash
npm run build
```

**Output Directory**:
```
dist/
```

**Install Command** (default):
```bash
npm install
```

**Root Directory**: `.` (repository root)

---

### Step 3: Environment Variables

**Add in Vercel Dashboard** → Project → Settings → Environment Variables:

| Name | Value | Environments | Encrypted |
|------|-------|--------------|-----------|
| `NODE_ENV` | `production` | Production | No |
| `DATABASE_URL` | `postgresql://...` | All | **Yes** |
| `OPENAI_API_KEY` | `sk-...` | All | **Yes** |
| `SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` | All | No |
| `SUPABASE_ANON_KEY` | `eyJhbG...` | All | No |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | All | **Yes** |

**Notes**:
- `DATABASE_URL`: From Supabase (Session Pooler, port 5432)
- `SUPABASE_SERVICE_ROLE_KEY`: Only for backend API routes
- `OPENAI_API_KEY`: Optional (AI features disabled if not set)

**For Option 2 (Split Backend)**:
| Name | Value | Environments | Notes |
|------|-------|--------------|-------|
| `VITE_API_URL` | `https://api.ritualfin.com` | All | Backend API base URL |

---

### Step 4: Node Runtime Requirements

**Option 1 (Serverless)**:
- Runtime: Node.js 20.x (default)
- Functions: Auto-detected from `api/` folder (if using Vercel Functions)
- **Not recommended** - see Option 2

**Option 2 (Frontend Only)** ✅:
- Runtime: Node.js 20.x
- Build: Vite static output
- No serverless functions needed

---

### Step 5: CORS Considerations

**Option 1 (Serverless)**: No CORS needed (same-origin)

**Option 2 (Split Backend)** ✅:
Backend needs CORS middleware:

```typescript
// server/routes.ts (add at top)
import cors from "cors";

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5000",
  credentials: true
}));
```

**Environment Variable**:
```bash
# Backend (.env)
ALLOWED_ORIGIN=https://ritualfin.vercel.app
```

**Install**:
```bash
npm install cors @types/cors
```

---

### Step 6: Monorepo Configuration

**Current Structure**: Monorepo (client + server in same repo)

**Vercel Configuration** (for Option 2):

**Option A**: Deploy Frontend Only (Recommended)
- Ignore `server/` folder in build
- Set `Build Command`: `npm run build` (already builds client only)

**Option B**: Separate Vercel Projects
- Create two Vercel projects:
  1. `ritualfin-client` (frontend)
  2. `ritualfin-api` (serverless functions)
- More complex, not recommended

**Recommended**: Option A (deploy frontend only, backend on Render)

---

## E) ENV VARS & SECRETS POLICY

### Environment Variable Definitions

| Variable | Purpose | Required | Used By | Example Value |
|----------|---------|----------|---------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | Backend | `postgresql://postgres:password@db.supabase.co:5432/postgres` |
| `OPENAI_API_KEY` | OpenAI API access | Optional | Backend | `sk-...` |
| `SUPABASE_URL` | Supabase project URL | Future | Client | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase public API key | Future | Client | `eyJhbG...` (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin API key | ✅ Yes | Backend | `eyJhbG...` (secret) |
| `NODE_ENV` | Environment mode | ✅ Yes | Both | `production` |
| `PORT` | Server port | Optional | Backend | `5000` (default) |
| `ALLOWED_ORIGIN` | CORS allowed origin | ✅ Yes (Option 2) | Backend | `https://ritualfin.vercel.app` |
| `VITE_API_URL` | Backend API URL | ✅ Yes (Option 2) | Client | `https://api.ritualfin.com` |

---

### Where Each Variable Should Live

#### Local Development (`.env` file)
```bash
# .env (never commit!)
DATABASE_URL=postgresql://postgres:password@localhost:5432/ritualfin
OPENAI_API_KEY=sk-...
NODE_ENV=development
PORT=5000
```

#### Backend Hosting (Render/Fly/Railway)
**Add via Dashboard** → Environment Variables:
```bash
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NODE_ENV=production
PORT=10000  # Render assigns this
ALLOWED_ORIGIN=https://ritualfin.vercel.app
```

#### Vercel (Frontend)
**Add via Dashboard** → Project Settings → Environment Variables:
```bash
VITE_API_URL=https://ritualfin-api.onrender.com
# OR
VITE_API_URL=https://api.ritualfin.com  # if custom domain
```

#### Supabase Settings
**Dashboard** → Settings → API:
- `SUPABASE_URL`: Auto-generated, copy from dashboard
- `SUPABASE_ANON_KEY`: Auto-generated, copy from dashboard
- `SUPABASE_SERVICE_ROLE_KEY`: Auto-generated, **keep secret**

---

### Secrets Management Best Practices

1. **Never Commit Secrets**:
   - Add `.env` to `.gitignore` (already done)
   - Use `.env.example` with placeholders

2. **Rotate Regularly**:
   - `OPENAI_API_KEY`: Every 90 days
   - `SUPABASE_SERVICE_ROLE_KEY`: Every 30 days
   - `DATABASE_URL`: After suspected leak

3. **Scope Appropriately**:
   - Client-side: Only `VITE_*` vars (public)
   - Server-side: All other vars (private)

4. **Logging**:
   - **Never** log full env vars
   - Mask secrets in logs: `DATABASE_URL=postgresql://***:***@db.supabase.co:5432/postgres`

5. **Access Control**:
   - Limit who can view env vars in dashboards
   - Use separate projects for staging/production

---

## F) MIGRATION + ROLLBACK STRATEGY

### Pre-Migration Checklist

- [ ] Backup current database (if any production data exists)
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```
- [ ] Test schema on fresh Supabase DB (staging)
- [ ] Document all environment variables
- [ ] Create rollback plan
- [ ] Set up monitoring (Vercel Analytics, Supabase Logs)

---

### Migration Steps (First Deployment)

**Assumption**: No existing production data (greenfield deployment)

1. **Apply Schema to Supabase**:
   ```bash
   DATABASE_URL=postgresql://... npm run db:push
   ```

2. **Deploy Backend** (Option 2 - Render):
   - Connect GitHub repo
   - Set environment variables
   - Deploy from `main` branch
   - Wait for build (~3-5 minutes)
   - Test health endpoint: `curl https://api.ritualfin.com/health`

3. **Deploy Frontend** (Vercel):
   - Connect GitHub repo
   - Set `VITE_API_URL` environment variable
   - Deploy from `main` branch
   - Wait for build (~2-3 minutes)
   - Test homepage loads

4. **Smoke Test**:
   - [ ] Homepage loads
   - [ ] Dashboard loads (no data yet)
   - [ ] CSV upload works (upload small test file)
   - [ ] Transactions appear in table
   - [ ] Confirm queue works

5. **DNS Setup** (if custom domain):
   - Point `ritualfin.com` → Vercel (frontend)
   - Point `api.ritualfin.com` → Render (backend)
   - Wait for DNS propagation (~5-60 minutes)

---

### Migration Steps (With Existing Data)

**Assumption**: Existing PostgreSQL DB with user data

1. **Dump Existing Database**:
   ```bash
   pg_dump $DATABASE_URL > migration_$(date +%Y%m%d).sql
   ```

2. **Restore to Supabase**:
   ```bash
   psql $SUPABASE_DATABASE_URL < migration_$(date +%Y%m%d).sql
   ```

3. **Verify Data**:
   - Check row counts: `SELECT COUNT(*) FROM transactions;`
   - Spot-check recent records
   - Verify foreign key relationships

4. **Dual-Write Period** (optional, for zero-downtime):
   - Deploy backend with dual-write logic (write to both DBs)
   - Monitor for 24 hours
   - Switch reads to Supabase
   - Stop writes to old DB
   - **Complexity**: High, only if critical data

5. **Cutover**:
   - Update `DATABASE_URL` to Supabase
   - Restart backend
   - Verify application works
   - Keep old DB running for 7 days (rollback window)

---

### Rollback Plan

**Scenario 1: Deployment Fails (Build Errors)**
1. Fix issue in code
2. Commit and push
3. Automatic redeployment on Vercel/Render

**Scenario 2: Deployment Succeeds but App Broken**
1. **Vercel**: Click "Rollback" in Deployments tab → select previous working deployment
2. **Render**: Redeploy previous commit from dashboard
3. Rollback takes ~30 seconds
4. Investigate issue in dev/staging

**Scenario 3: Database Migration Failed**
1. Drop all tables in Supabase:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
2. Restore from backup:
   ```bash
   psql $SUPABASE_DATABASE_URL < backup_YYYYMMDD.sql
   ```
3. Re-run `npm run db:push`

**Scenario 4: Data Loss/Corruption**
1. Immediately revert `DATABASE_URL` to old DB (if still running)
2. Restart backend
3. Investigate Supabase DB state
4. Restore from backup if needed

---

### Zero-Downtime Expectations

**First Deployment**: ❌ **NOT realistic**
- Schema migration required
- Environment variable changes
- Potential for issues

**Future Deployments**: ✅ **Realistic**
- Vercel: Instant rollback to previous version
- Render: ~30s restart for new deploy
- Database: Schema changes via migrations (zero-downtime with careful design)

**Strategy for Future Zero-Downtime**:
1. Use database migrations with backward-compatible changes
2. Deploy backend first (new code compatible with old schema)
3. Run migration
4. Deploy frontend
5. Blue-green deployment (if critical)

---

## G) ACCEPTANCE CRITERIA (TESTABLE)

### Must Have ✅

- [ ] **Deploy succeeds on Vercel**
  - Test: Check Vercel dashboard shows "Ready" status
  - URL: `https://ritualfin.vercel.app` (or custom domain)

- [ ] **API health endpoint responds**
  - Test: `curl https://api.ritualfin.com/api/health` → 200 OK
  - Add health endpoint to `server/routes.ts`:
    ```typescript
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    ```

- [ ] **Supabase DB connectivity verified**
  - Test: Check Supabase dashboard → Table Editor shows all tables
  - Test: Health endpoint queries DB:
    ```typescript
    app.get("/api/health", async (req, res) => {
      const result = await storage.getUser("test");
      res.json({ status: "ok", dbConnected: true });
    });
    ```

- [ ] **Upload flow works with sample CSV**
  - Test: Upload small CSV (first 20 rows) via `/uploads` page
  - Expected: Transactions appear in `/transactions` page
  - Verify: No timeout errors, no database errors

- [ ] **No secrets in logs**
  - Test: Check Vercel logs for `DATABASE_URL`, `OPENAI_API_KEY`
  - Test: Check Render logs for secret values
  - Expected: Secrets masked or not logged

- [ ] **`npm run check` passes**
  - Test: Run locally before deploy
  - Expected: No TypeScript errors

---

### Should Have 🟡

- [ ] **Environment variables properly scoped**
  - Client-side: Only `VITE_*` vars (check browser dev tools)
  - Server-side: All other vars (not exposed to client)

- [ ] **CORS configured correctly** (Option 2 only)
  - Test: Frontend can call backend API
  - Test: Other origins blocked (e.g., `https://evil.com`)

- [ ] **Error tracking setup**
  - Option 1: Sentry (free tier: 5k events/month)
  - Option 2: Vercel Error Tracking (Pro plan)
  - Option 3: Custom logging to Supabase table

- [ ] **Performance monitoring**
  - Vercel Analytics: Free on Hobby plan
  - Render Metrics: Built-in (response time, memory)
  - Supabase Database Health: Dashboard → Performance

---

### Nice to Have 🔵

- [ ] **Preview deployments for PRs**
  - Vercel auto-creates preview URLs for each PR
  - Test: Create test PR → check preview URL

- [ ] **Automatic database backups**
  - Supabase: Daily backups on Pro plan ($25/month)
  - Free tier: Manual backups via dashboard
  - Recommended: Enable when on Pro plan

- [ ] **Staging environment separate from production**
  - Create second Supabase project: `ritualfin-staging`
  - Create second Vercel project (or use preview deployments)
  - Create second Render service (or use review apps)

---

## H) EXECUTION PHASE GATING

### Before Implementation ⏸️ **STOP HERE**

This plan documents the deployment strategy **WITHOUT making any code or config changes**.

**Required Approvals**:
1. ✅ Review current state assessment
2. ✅ Choose deployment option (Option 1 or **Option 2 recommended**)
3. ✅ Approve Supabase setup plan
4. ✅ Approve Vercel setup plan
5. ✅ Approve environment variable strategy
6. ✅ Approve migration/rollback strategy
7. ⏸️ **EXPLICIT APPROVAL REQUIRED** before proceeding to implementation

---

### After Approval (Implementation Checklist)

**Phase 1: Supabase Setup** (~30 minutes)
- [ ] Create Supabase project
- [ ] Configure database connection
- [ ] Apply schema via `npm run db:push`
- [ ] Verify tables created
- [ ] Test connection from local dev
- [ ] Document connection strings (save in password manager)
- [ ] Commit: "Docs: Add Supabase connection info to README"

**Phase 2: Backend Deployment** (~45 minutes, Option 2 only)
- [ ] Add CORS middleware to `server/routes.ts`
- [ ] Add health endpoint to `server/routes.ts`
- [ ] Create Render account
- [ ] Connect GitHub repo
- [ ] Configure environment variables
- [ ] Deploy backend
- [ ] Test health endpoint
- [ ] Commit: "Feat: Add CORS and health endpoint for deployment"

**Phase 3: Frontend Deployment** (~30 minutes)
- [ ] Update API base URL in client (if Option 2)
- [ ] Create Vercel account
- [ ] Connect GitHub repo
- [ ] Configure environment variables
- [ ] Deploy frontend
- [ ] Test homepage loads
- [ ] Commit: "Feat: Configure frontend for production deployment"

**Phase 4: Integration Testing** (~30 minutes)
- [ ] Run smoke tests (upload CSV, view transactions, confirm queue)
- [ ] Check logs for errors
- [ ] Verify no secrets leaked
- [ ] Test on mobile device
- [ ] Document any issues in `IMPLEMENTATION_LOG.md`
- [ ] Commit: "Docs: Add deployment smoke test results"

**Phase 5: DNS & Custom Domain** (~60 minutes, optional)
- [ ] Purchase domain (if not already owned)
- [ ] Configure Vercel custom domain
- [ ] Configure Render custom domain
- [ ] Update CORS `ALLOWED_ORIGIN`
- [ ] Wait for DNS propagation
- [ ] Test production URL
- [ ] Commit: "Feat: Configure custom domain"

**Total Time Estimate**: 3-4 hours

---

## DECISION LOG

### Why Option 2 (Split Backend) Over Option 1 (Serverless)?

**Factors Considered**:
1. **Current Architecture**: Designed for long-running Node.js process
2. **CSV Parsing**: Can take 5-10s for 500+ rows (exceeds serverless timeout)
3. **AI Streaming**: SSE responses may exceed timeout
4. **Session Management**: Express-session easier than external KV store
5. **Future Features**: WebSocket support for real-time updates

**Risk Assessment**:
- Option 1: **High risk** of timeouts, requires significant refactoring
- Option 2: **Low risk**, minimal code changes

**Cost**:
- Option 1: $0-45/month (but may need Pro plan for 25s timeout)
- Option 2: $7-32/month (more predictable)

**Decision**: Choose **Option 2** for lower risk and easier implementation.

---

### Why Session Pooler (Port 5432) Over Transaction Pooler (Port 6543)?

**Factors**:
- **Session Pooler**: Long-lived connections, full PostgreSQL compatibility
- **Transaction Pooler**: Connection pooling, faster cold starts, but limited features

**Current App**:
- Uses prepared statements (incompatible with transaction pooler)
- Uses transactions (works with both, but session is more reliable)

**Decision**: Use **Session Pooler** (port 5432) for compatibility.

---

### Why Render Over Fly.io/Railway?

**Factors**:
| Factor | Render | Fly.io | Railway |
|--------|--------|--------|---------|
| Free tier | 750h/month | Yes | $5 credit |
| Pricing | $7/month (always-on) | ~$5-15/month | ~$5-10/month |
| Auto-deploy | Yes | Yes | Yes |
| Logs | Built-in | Built-in | Built-in |
| Learning curve | Low | Medium | Low |

**Decision**: Choose **Render** for simplicity and predictable pricing.

---

**End of Deployment Plan**

**Next Steps**: Get approval, then proceed with implementation using checklist above.
