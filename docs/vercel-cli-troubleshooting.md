# Vercel CLI Troubleshooting & Alternative Deployment Paths

**Date**: 2026-01-12  
**Context**: Vercel CLI is not working in current environment  
**Objective**: Diagnose CLI issues and provide runnable alternatives

---

## Table of Contents
1. [Symptom Capture](#symptom-capture)
2. [Root Cause Analysis](#root-cause-analysis)
3. [Step-by-Step Remediation](#step-by-step-remediation)
4. [No-CLI Deployment Path](#no-cli-deployment-path)
5. [Verification Commands](#verification-commands)

---

## Symptom Capture

### Commands Attempted

```bash
# Login attempt
$ vercel login
# Expected: Browser opens for authentication
# Actual: [CAPTURE ERROR OUTPUT]

# Environment pull
$ vercel env pull
# Expected: Downloads .env.local
# Actual: [CAPTURE ERROR OUTPUT]

# Deployment
$ vercel deploy --prod
# Expected: Builds and deploys
# Actual: [CAPTURE ERROR OUTPUT]

# Project linking
$ vercel link
# Expected: Links to existing project
# Actual: [CAPTURE ERROR OUTPUT]
```

### Error Patterns to Capture

When running CLI commands, capture:
1. **Exit code**: `echo $?` (0 = success, non-zero = error)
2. **Full error message**: Copy entire output
3. **Stack trace**: If present
4. **Network errors**: Connection refused, timeout, DNS failures

**Example Error Capture**:
```bash
$ vercel login 2>&1 | tee vercel-error.log
$ echo "Exit code: $?" >> vercel-error.log
```

---

## Root Cause Analysis

### Ranked Likely Causes

#### 1. **Auth/Session Issues** (Probability: 40%)

**Symptoms**:
- `Error: Not authenticated`
- `Error: Invalid token`
- `Error: Session expired`

**Diagnosis**:
```bash
# Check for existing auth token
cat ~/.vercel/auth.json

# Check token expiry
vercel whoami
```

**Causes**:
- Token expired
- SSO/SAML authentication required
- Token scope insufficient
- Multiple Vercel accounts

---

#### 2. **Node Version Incompatibility** (Probability: 20%)

**Symptoms**:
- `Error: Unsupported Node version`
- Cryptic JavaScript errors
- Module resolution failures

**Diagnosis**:
```bash
# Check Node version
node --version
# Vercel CLI requires Node 18+ (ideally 20+)

# Check npm version
npm --version
```

**Causes**:
- Node < 18
- npm < 9
- Conflicting Node versions (nvm)

---

#### 3. **Project Linking Issues** (Probability: 15%)

**Symptoms**:
- `Error: No project found`
- `Error: .vercel directory missing`
- `Error: Project not linked`

**Diagnosis**:
```bash
# Check for .vercel directory
ls -la .vercel/

# Check project.json
cat .vercel/project.json
# Should contain: {"projectId": "...", "orgId": "..."}
```

**Causes**:
- `.vercel/` directory missing or corrupted
- Project deleted in Vercel dashboard
- Wrong directory (monorepo)

---

#### 4. **Network/Proxy Issues** (Probability: 10%)

**Symptoms**:
- `ECONNREFUSED`
- `ETIMEDOUT`
- `ENOTFOUND`
- `SSL certificate problem`

**Diagnosis**:
```bash
# Test Vercel API connectivity
curl -I https://api.vercel.com/v2/user

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY
echo $NO_PROXY

# Test DNS
nslookup api.vercel.com
```

**Causes**:
- Corporate proxy blocking
- TLS interception (corporate firewall)
- DNS issues
- VPN interference

---

#### 5. **Vercel CLI Version Bugs** (Probability: 5%)

**Symptoms**:
- Unexpected crashes
- Regression from previous version

**Diagnosis**:
```bash
# Check CLI version
vercel --version

# Check for known issues
# Visit: https://github.com/vercel/vercel/issues
```

**Causes**:
- Outdated CLI
- Known bug in specific version

---

#### 6. **Permissions Issues** (Probability**: 5%)

**Symptoms**:
- `Error: Insufficient permissions`
- `Error: Not authorized`

**Diagnosis**:
```bash
# Check Vercel team membership
vercel teams ls

# Check project access
# (requires working CLI or dashboard)
```

**Causes**:
- Not a team member
- Read-only access
- Project ownership changed

---

#### 7. **Build/Environment Issues** (Probability: 3%)

**Symptoms**:
- Build succeeds locally, fails on Vercel
- Missing environment variables
- Module not found errors

**Diagnosis**:
```bash
# Simulate Vercel build locally
NODE_ENV=production npm run build

# Check env vars
vercel env ls
# (if CLI works)
```

**Causes**:
- Missing env vars in Vercel
- Different Node version in Vercel
- Platform-specific dependencies

---

#### 8. **Database Connection Issues** (Probability: 2%)

**Symptoms**:
- `ECONNREFUSED` to Neon
- `Connection timeout`

**Diagnosis**:
```bash
# Test Neon connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check Neon IP allowlist
# Visit Neon dashboard
```

**Causes**:
- Neon IP allowlist blocking Vercel IPs
- Wrong connection string (direct vs pooled)
- Database paused/suspended

---

## Step-by-Step Remediation

### Phase 1: Environment Verification

#### Step 1.1: Verify Node and npm

```bash
# Check versions
node --version  # Should be 20.x or later
npm --version   # Should be 10.x or later

# If outdated, update
# macOS (Homebrew)
brew install node@20

# Or use nvm
nvm install 20
nvm use 20
```

**Expected Output**:
```
v20.x.x
10.x.x
```

**If Fails**: Install Node 20 before proceeding

---

#### Step 1.2: Install/Upgrade Vercel CLI

```bash
# Global install
npm install -g vercel@latest

# Verify installation
vercel --version

# Should output: Vercel CLI 33.x.x or later
```

**Expected Output**:
```
Vercel CLI 33.0.0
```

**If Fails**: Check npm permissions, try `sudo npm install -g vercel`

---

### Phase 2: Authentication

#### Step 2.1: Clear Existing Auth

```bash
# Remove old auth token
rm -rf ~/.vercel

# Verify removal
ls ~/.vercel
# Should output: No such file or directory
```

---

#### Step 2.2: Login (Interactive)

```bash
# Attempt interactive login
vercel login

# Follow browser prompts
# Select email or GitHub/GitLab
```

**Expected**: Browser opens, login succeeds, token saved

**If Fails**: Proceed to Step 2.3

---

#### Step 2.3: Login (Non-Interactive Token)

**Use Case**: Headless environment, CI/CD, or browser issues

**Steps**:
1. Go to https://vercel.com/account/tokens
2. Create new token with name "CLI-Manual"
3. Copy token (starts with `vercel_...`)
4. Set environment variable:

```bash
export VERCEL_TOKEN="vercel_xxxxxxxxxxxxx"

# Verify
vercel whoami
```

**Expected Output**:
```
> Your username or email
```

**If Fails**: Token may be invalid or expired

---

### Phase 3: Project Linking

#### Step 3.1: Check Existing Link

```bash
# Check for .vercel directory
ls -la .vercel/

# If exists, check contents
cat .vercel/project.json
```

**Expected**:
```json
{
  "projectId": "prj_xxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxx"
}
```

**If Missing**: Proceed to Step 3.2

---

#### Step 3.2: Link Project

```bash
# Interactive linking
vercel link

# Select:
# 1. Link to existing project? Yes
# 2. What's your project's name? RitualFin (or your project name)
# 3. In which directory? ./ (current directory)
```

**Expected**: Creates `.vercel/project.json`

**If Fails**: Project may not exist in Vercel dashboard

---

#### Step 3.3: Manual Link (Fallback)

If `vercel link` fails, manually create `.vercel/project.json`:

1. Get Project ID from Vercel Dashboard:
   - Go to https://vercel.com/dashboard
   - Select project
   - Settings → General → Project ID

2. Get Org ID:
   - Dashboard → Account Settings → Team ID (or Personal Account ID)

3. Create file:

```bash
mkdir -p .vercel
cat > .vercel/project.json <<EOF
{
  "projectId": "prj_YOUR_PROJECT_ID",
  "orgId": "team_YOUR_ORG_ID"
}
EOF
```

---

### Phase 4: Environment Variables

#### Step 4.1: Pull from Vercel (CLI)

```bash
# Pull production env vars
vercel env pull .env.vercel.local

# Verify
cat .env.vercel.local
```

**Expected**: File contains DATABASE_URL, AUTH_SECRET, etc.

**If Fails**: Proceed to Step 4.2

---

#### Step 4.2: Manual Download (Dashboard)

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. For each variable:
   - Click "..." → "Copy Value"
   - Paste into `.env.local`

**Example `.env.local`**:
```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

---

### Phase 5: Local Build Verification

#### Step 5.1: Build with Production Env

```bash
# Load production env vars
export $(cat .env.local | xargs)

# Build
NODE_ENV=production npm run build

# Check for errors
echo $?  # Should be 0
```

**Expected**: Build succeeds without errors

**If Fails**: Fix build errors before deploying

---

### Phase 6: Database Connectivity

#### Step 6.1: Test Neon Connection

```bash
# Install psql if needed
# macOS: brew install postgresql

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Expected Output**:
```
 ?column? 
----------
        1
(1 row)
```

**If Fails**:
- Check DATABASE_URL format
- Verify Neon database is active
- Check IP allowlist in Neon dashboard

---

#### Step 6.2: Run Migrations

```bash
# Apply migrations
npm run db:migrate

# Verify schema
npm run db:studio
# Opens Drizzle Studio in browser
```

**Expected**: Migrations apply successfully

---

### Phase 7: Deployment

#### Step 7.1: Deploy via CLI

```bash
# Deploy to production
vercel deploy --prod

# Monitor build logs
# Wait for deployment URL
```

**Expected Output**:
```
✅ Production: https://ritualfin.vercel.app [copied to clipboard]
```

**If Fails**: See Phase 8 (No-CLI Deployment)

---

## No-CLI Deployment Path

**Use Case**: Vercel CLI is completely blocked or unavailable

### Method 1: Git Integration (Recommended)

**Prerequisites**:
- GitHub repository
- Vercel project linked to GitHub

**Steps**:

1. **Verify Git Integration**:
   - Go to Vercel Dashboard → Project → Settings → Git
   - Ensure repository is connected
   - Verify branch is `main` (or your production branch)

2. **Configure Build Settings**:
   - Settings → General → Build & Development Settings
   - Framework Preset: `Next.js`
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

3. **Set Environment Variables**:
   - Settings → Environment Variables
   - Add all required vars (see [Environment Variables](#environment-variables))
   - Select "Production" environment

4. **Deploy via Git Push**:
   ```bash
   git add .
   git commit -m "Deploy: production release"
   git push origin main
   ```

5. **Monitor Deployment**:
   - Go to Vercel Dashboard → Deployments
   - Watch build logs in real-time
   - Wait for "Ready" status

**Advantages**:
- ✅ Automatic deployments
- ✅ Preview deployments for PRs
- ✅ Rollback via Git revert

**Disadvantages**:
- ❌ Requires Git push (no instant deploy)
- ❌ Less control over deployment timing

---

### Method 2: Vercel Dashboard Manual Deploy

**Use Case**: Need to deploy without Git push

**Steps**:

1. **Prepare Build Locally**:
   ```bash
   npm run build
   ```

2. **Create Deployment Archive**:
   ```bash
   # Create tarball of .next directory
   tar -czf deployment.tar.gz .next package.json package-lock.json public
   ```

3. **Upload via Dashboard**:
   - Go to Vercel Dashboard → Deployments
   - Click "..." → "Redeploy"
   - Select commit or upload archive

**Note**: This method is less common and may not be supported for all project types

---

### Method 3: GitHub Actions (CI/CD)

**Use Case**: Automate deployments with more control

**Setup**:

1. **Create Vercel Token**:
   - Go to https://vercel.com/account/tokens
   - Create token with name "GitHub Actions"
   - Copy token

2. **Add GitHub Secrets**:
   - GitHub Repo → Settings → Secrets → Actions
   - Add `VERCEL_TOKEN`
   - Add `VERCEL_ORG_ID` (from `.vercel/project.json`)
   - Add `VERCEL_PROJECT_ID` (from `.vercel/project.json`)

3. **Create Workflow** (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to Vercel

   on:
     push:
       branches: [main]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - uses: actions/setup-node@v3
           with:
             node-version: '20'
         
         - name: Install Dependencies
           run: npm ci
         
         - name: Run Tests
           run: npx tsx tests/unit/rules-engine.test.ts
         
         - name: Build
           run: npm run build
         
         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v25
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
             vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
             vercel-args: '--prod'
   ```

4. **Push to Trigger**:
   ```bash
   git push origin main
   ```

**Advantages**:
- ✅ Full CI/CD pipeline
- ✅ Automated testing before deploy
- ✅ Deployment logs in GitHub

---

## Verification Commands

### After Deployment

```bash
# Check deployment status
curl -I https://ritualfin.vercel.app

# Expected: HTTP/2 200

# Test API endpoint
curl https://ritualfin.vercel.app/api/auth/debug

# Check specific route
curl https://ritualfin.vercel.app/login
```

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

BASE_URL="https://ritualfin.vercel.app"

echo "🔍 Running Health Checks..."

# Homepage
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/)
if [ $STATUS -eq 200 ]; then
  echo "✅ Homepage: $STATUS"
else
  echo "❌ Homepage: $STATUS"
fi

# Login page
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/login)
if [ $STATUS -eq 200 ]; then
  echo "✅ Login: $STATUS"
else
  echo "❌ Login: $STATUS"
fi

# API
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/auth/debug)
if [ $STATUS -eq 200 ]; then
  echo "✅ API: $STATUS"
else
  echo "❌ API: $STATUS"
fi
```

---

## Common Error Resolutions

### Error: `ECONNREFUSED`

**Cause**: Cannot connect to Vercel API

**Fix**:
```bash
# Check network
ping api.vercel.com

# Check proxy
unset HTTP_PROXY HTTPS_PROXY

# Retry
vercel login
```

---

### Error: `Invalid token`

**Cause**: Auth token expired or invalid

**Fix**:
```bash
# Clear auth
rm -rf ~/.vercel

# Re-login
vercel login
```

---

### Error: `Project not found`

**Cause**: `.vercel/project.json` missing or incorrect

**Fix**:
```bash
# Re-link
vercel link

# Or manually create (see Step 3.3)
```

---

### Error: `Build failed`

**Cause**: TypeScript errors, missing deps, or env vars

**Fix**:
```bash
# Reproduce locally
NODE_ENV=production npm run build

# Check Vercel logs
vercel logs <deployment-url>

# Verify env vars
vercel env ls
```

---

## Summary

### If Vercel CLI Works:
1. `vercel login`
2. `vercel link`
3. `vercel env pull`
4. `vercel deploy --prod`

### If Vercel CLI Doesn't Work:
1. **Use Git Integration** (push to `main`)
2. **Use GitHub Actions** (automated CI/CD)
3. **Use Vercel Dashboard** (manual redeploy)

### Critical Requirements:
- ✅ Node 20+
- ✅ Environment variables set in Vercel Dashboard
- ✅ Database migrations applied
- ✅ Build succeeds locally

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-12  
**Status**: Ready for execution
