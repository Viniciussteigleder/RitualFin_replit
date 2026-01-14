# Deployment Runbook

**Date**: 2026-01-12  
**Target Platform**: Vercel  
**Database**: Neon (PostgreSQL)  
**Framework**: Next.js 16.1.1

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Migration Strategy](#database-migration-strategy)
4. [Deployment Flow](#deployment-flow)
5. [Parity Gates](#parity-gates)
6. [Rollback Procedure](#rollback-procedure)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- Node.js 20.x or later
- npm 10.x or later
- Git
- Vercel account with project linked
- Neon database provisioned

### Required Access
- GitHub repository write access
- Vercel project admin access
- Neon database admin access
- Environment variable management access

---

## Environment Variables

### Required Variables

| Variable | Description | Example | Where to Set |
|----------|-------------|---------|--------------|
| `DATABASE_URL` | Neon connection string (pooled) | `postgresql://user:pass@host/db?sslmode=require` | Vercel Dashboard |
| `AUTH_SECRET` | Auth.js secret (32+ chars) | `openssl rand -base64 32` | Vercel Dashboard |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | `123456789-abc.apps.googleusercontent.com` | Vercel Dashboard |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | `GOCSPX-...` | Vercel Dashboard |
| `AUTH_URL` | Canonical app URL | `https://ritualfin.vercel.app` | Auto-set by Vercel |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `ANALYZE` | Enable bundle analyzer | `false` |
| `PG_POOL_MAX` | Postgres pool max connections | `5` |

### Validation Script

Create `lib/env.ts`:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  AUTH_GOOGLE_ID: z.string().min(1, 'AUTH_GOOGLE_ID is required'),
  AUTH_GOOGLE_SECRET: z.string().min(1, 'AUTH_GOOGLE_SECRET is required'),
  AUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
```

Add to `app/layout.tsx` or `middleware.ts`:
```typescript
import { env } from '@/lib/env';
// Will throw on startup if env vars are invalid
```

---

## Database Migration Strategy

### Current State
- Migrations stored in `migrations/` directory
- 5 migration files present
- Drizzle Kit configured (`drizzle.config.ts`)

### Recommended Strategy: **Pre-Deploy Manual Migration**

#### Why Manual?
1. Vercel build environment may not have DB access during build
2. Migrations should be controlled and auditable
3. Allows for rollback before code deploy

#### Migration Workflow

**Step 1: Generate Migration (Development)**
```bash
# After schema changes in src/lib/db/schema.ts
npm run db:generate
# Creates new migration file in migrations/
```

**Step 2: Review Migration**
```bash
# Inspect generated SQL
cat migrations/XXXX_migration_name.sql
```

**Step 3: Test Locally**
```bash
# Apply to local DB
npm run db:migrate
# Verify schema
npm run db:studio
```

**Step 4: Apply to Production DB (Pre-Deploy)**
```bash
# Set DATABASE_URL to production Neon DB
export DATABASE_URL="postgresql://..."
npm run db:migrate

# Verify
npx drizzle-kit studio
```

**Step 5: Deploy Code**
```bash
git push origin main
# Vercel auto-deploys
```

### Alternative: CI-Based Migration

Add to `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - name: Run Migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npm run db:migrate
  
  deploy:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Migration Rollback

**Option 1: Revert Migration File**
```bash
# Remove last migration
rm migrations/XXXX_last_migration.sql
# Re-generate from schema
npm run db:generate
npm run db:migrate
```

**Option 2: Manual SQL Rollback**
```sql
-- Connect to Neon DB
-- Run inverse of migration (e.g., DROP TABLE, ALTER TABLE DROP COLUMN)
```

---

## Deployment Flow

### Automated (Git Push)

**Trigger**: Push to `main` branch

**Vercel Workflow**:
1. Webhook triggered on GitHub push
2. Vercel clones repository
3. Installs dependencies (`npm ci`)
4. Runs `next build`
5. Deploys to production
6. Assigns production URL

**Prerequisites**:
- Vercel project linked to GitHub repo
- Environment variables set in Vercel Dashboard
- Database migrations already applied

### Manual (Vercel Dashboard)

**Use Case**: Hotfix or manual trigger

**Steps**:
1. Go to Vercel Dashboard → Project → Deployments
2. Click "Redeploy" on desired commit
3. Select "Production" environment
4. Click "Redeploy"

---

## Parity Gates

### Pre-Deployment Checklist

Run this script before every production deploy:

**`scripts/pre-deploy-check.ts`**:
```typescript
#!/usr/bin/env npx tsx

import { execSync } from 'child_process';

console.log('🔍 Running Pre-Deployment Checks...\n');

const checks = [
  {
    name: 'TypeScript',
    command: 'npm run check',
    critical: true,
  },
  {
    name: 'Build',
    command: 'npm run build',
    critical: true,
  },
  {
    name: 'Unit Tests',
    command: 'npx tsx tests/unit/rules-engine.test.ts',
    critical: true,
  },
  {
    name: 'DB Parity (if network available)',
    command: 'npx tsx scripts/verify-db-parity.ts',
    critical: false, // May fail if no DB access
  },
];

let failed = false;

for (const check of checks) {
  try {
    console.log(`Running: ${check.name}...`);
    execSync(check.command, { stdio: 'inherit' });
    console.log(`✅ ${check.name} PASSED\n`);
  } catch (error) {
    console.error(`❌ ${check.name} FAILED\n`);
    if (check.critical) {
      failed = true;
    }
  }
}

if (failed) {
  console.error('🚨 Critical checks failed. DO NOT DEPLOY.');
  process.exit(1);
} else {
  console.log('✅ All checks passed. Safe to deploy.');
  process.exit(0);
}
```

**Usage**:
```bash
npx tsx scripts/pre-deploy-check.ts
```

### CI Integration

Add to `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run check
      - run: npm run build
      - run: npx tsx tests/unit/rules-engine.test.ts
      - name: DB Parity Check
        if: env.DATABASE_URL != ''
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npx tsx scripts/verify-db-parity.ts
```

---

## Rollback Procedure

### Immediate Rollback (Vercel)

**Scenario**: Production is broken, need instant rollback

**Steps**:
1. Go to Vercel Dashboard → Deployments
2. Find last known good deployment
3. Click "..." → "Promote to Production"
4. Confirm

**Time**: < 2 minutes

### Code Rollback (Git)

**Scenario**: Need to revert code changes

**Steps**:
```bash
# Identify bad commit
git log --oneline

# Revert commit
git revert <commit-hash>

# Push to trigger redeploy
git push origin main
```

### Database Rollback

**Scenario**: Migration caused issues

**Steps**:
1. Identify migration to revert
2. Write inverse migration SQL
3. Apply manually to Neon DB
4. Update schema.ts to match
5. Regenerate migrations

**Example**:
```sql
-- If migration added column:
ALTER TABLE transactions DROP COLUMN new_column;

-- If migration created table:
DROP TABLE new_table;
```

---

## Post-Deployment Verification

### Automated Health Check

**`scripts/health-check.ts`**:
```typescript
#!/usr/bin/env npx tsx

const BASE_URL = process.env.VERCEL_URL || 'https://ritualfin.vercel.app';

const checks = [
  { name: 'Homepage', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'API Health', path: '/api/auth/debug' },
];

for (const check of checks) {
  const url = `${BASE_URL}${check.path}`;
  const response = await fetch(url);
  
  if (response.ok) {
    console.log(`✅ ${check.name}: ${response.status}`);
  } else {
    console.error(`❌ ${check.name}: ${response.status}`);
  }
}
```

### Manual Verification

1. **Authentication**: Log in with Google OAuth
2. **Dashboard**: Verify metrics load
3. **Transactions**: Upload CSV, verify import
4. **Rules**: Create/edit rule, verify save
5. **Database**: Check Neon dashboard for connections

---

## Troubleshooting

### Build Fails on Vercel

**Symptom**: `next build` fails in Vercel logs

**Common Causes**:
1. TypeScript errors
2. Missing environment variables
3. Dependency issues

**Debug Steps**:
```bash
# Reproduce locally
NODE_ENV=production npm run build

# Check Vercel logs
vercel logs <deployment-url>

# Verify env vars
vercel env ls
```

### Database Connection Fails

**Symptom**: `ECONNREFUSED` or `ETIMEDOUT`

**Causes**:
1. DATABASE_URL not set
2. Neon IP allowlist blocking Vercel
3. Connection string incorrect (pooled vs direct)

**Fix**:
1. Verify DATABASE_URL in Vercel Dashboard
2. Use **pooled connection string** from Neon
3. Check Neon IP allowlist (Vercel IPs change)

### Migrations Not Applied

**Symptom**: Schema mismatch errors

**Causes**:
1. Migrations not run before deploy
2. Migration failed silently

**Fix**:
```bash
# Manually apply migrations
export DATABASE_URL="<neon-url>"
npm run db:migrate

# Verify schema
npx drizzle-kit studio
```

### OAuth Redirect Mismatch

**Symptom**: Google OAuth fails with redirect URI error

**Causes**:
1. AUTH_URL not set correctly
2. Google Console redirect URIs not updated

**Fix**:
1. Set AUTH_URL to production URL in Vercel
2. Add to Google Console:
   - `https://<your-domain>/api/auth/callback/google`
   - `https://<your-domain>.vercel.app/api/auth/callback/google`

---

## Deployment Checklist

### Pre-Deploy
- [ ] All tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Build succeeds locally
- [ ] Database migrations applied to production
- [ ] Environment variables verified in Vercel
- [ ] DB parity check passes (if accessible)
- [ ] Code reviewed and approved

### Deploy
- [ ] Merge to `main` branch
- [ ] Monitor Vercel deployment logs
- [ ] Verify build completes successfully

### Post-Deploy
- [ ] Run health check script
- [ ] Manual smoke test (login, dashboard, transactions)
- [ ] Check error logs in Vercel
- [ ] Verify database connections in Neon dashboard
- [ ] Monitor for errors (first 10 minutes)

### Rollback (if needed)
- [ ] Identify issue
- [ ] Promote previous deployment in Vercel
- [ ] Revert database migrations if necessary
- [ ] Notify team
- [ ] Create incident report

---

## Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Neon Support**: support@neon.tech
- **GitHub Support**: support@github.com

---

## Appendix: Vercel Configuration

**`vercel.json`**:
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "DATABASE_URL": "@database-url",
    "AUTH_SECRET": "@auth-secret",
    "AUTH_GOOGLE_ID": "@auth-google-id",
    "AUTH_GOOGLE_SECRET": "@auth-google-secret"
  }
}
```

**Note**: `@variable-name` references Vercel environment variables

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-12  
**Maintained By**: Platform Team
