# Baseline Environment & Runbook

**Generated**: 2026-01-02
**Branch**: `fix/full-app-autonomous-qa-claude-2026-01-02`
**Base Commit**: `50ff59ed2c6cec9c00fbae48f35e9fa9402cdc80`
**Commit Message**: "Merge: Implementação completa Merchant Dictionary + Plano Final"

## Environment

### Runtime Versions
- **Node.js**: v22.21.1
- **npm**: 10.9.4
- **Platform**: linux (Replit)
- **OS**: Linux 4.4.0

### Repository State
- **Working Directory**: `/home/user/RitualFin_replit`
- **Git Status**: Clean working tree on QA branch
- **Remote**: Tracking `origin/main` (diverged - 5 local, 120 remote commits)

## Baseline Checks

### TypeScript Check
```bash
npm run check
```
**Result**: ✅ **PASS** - No type errors

### Production Build
```bash
npm run build
```
**Result**: ✅ **PASS**
- Client bundle: 1,165.32 kB (349.43 kB gzipped)
- CSS: 138.91 kB (21.30 kB gzipped)
- Server bundle: 1.2 MB
- Build time: ~12s

**Warnings**:
- Bundle size > 500 kB (expected for full-stack app)
- Consider code-splitting for optimization (noted as P2 improvement)

## Required Environment Variables

The following environment variables are required (values not documented for security):

### Database
- `DATABASE_URL` - PostgreSQL connection string (required)

### OpenAI (Optional - for AI features)
- `OPENAI_API_KEY` - OpenAI API key for categorization/suggestions

### Session (Production)
- `SESSION_SECRET` - Session signing secret (auto-generated in dev)

### Runtime
- `NODE_ENV` - Set by build scripts (development/production)

## Local Development Runbook

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Ensure PostgreSQL is running
# Set DATABASE_URL in .env

# Push schema to database
npm run db:push
```

### 3. Start Development Server
```bash
npm run dev
# Server: http://localhost:5000
# Client HMR: Vite dev server proxied through Express
```

### 4. Run Type Checks
```bash
npm run check
```

### 5. Build for Production
```bash
npm run build
# Output: dist/public (client) + dist/index.cjs (server)
```

### 6. Run Production Build Locally
```bash
npm start
# Serves from dist/ on port 5000
```

## Testing Commands

### Manual Smoke Tests
See `docs/QA/E2E_TEST_MATRIX.md` for comprehensive test scripts

### Automated Tests (TBD)
```bash
# Playwright E2E (to be implemented)
# npm run test:e2e

# API smoke tests (to be implemented)
# npm run test:api

# DB invariants (to be implemented)
# npm run test:db
```

## QA Scripts Location

All QA automation scripts will be located in:
- `scripts/qa/` - API smoke tests, DB invariants, helpers

## Known Baseline Issues

### P0 (Blocking)
- None detected in baseline build/check

### P1 (Important)
- Bundle size optimization needed (1.2 MB server, 1.1 MB client)
- No automated E2E tests present

### P2 (Nice to have)
- Code splitting not implemented
- Source maps size not optimized

## Deployment Notes

### Vercel Configuration Required
- Output directory: `dist/public`
- Root directory: project root
- Build command: `npm run build`
- SPA rewrites: All routes → `/index.html`
- API base: Must point to backend URL (not Vercel origin)

### Environment Variables for Production
All required env vars must be set in Vercel dashboard:
- `DATABASE_URL`
- `OPENAI_API_KEY` (optional)
- `SESSION_SECRET`
- `NODE_ENV=production`

## Health Check Endpoints

### Backend Health
```bash
GET /api/health
# Expected: 200 OK with status info
```

### Database Health
```bash
GET /api/health/db
# Expected: 200 OK with connection status
```

## Last Updated
2026-01-02 - Initial baseline documentation
