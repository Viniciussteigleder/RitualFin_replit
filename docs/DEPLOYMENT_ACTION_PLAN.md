# Deployment Action Plan - QA Fixes

**Date**: 2026-01-02
**Branch**: `claude/qa-fixes-2bTSq`
**Target**: Production (Vercel + Render + Supabase)

---

## Current Deployment Status

**Existing Deployments**:
- ✅ Frontend: https://ritual-fin-replit.vercel.app (Active - 200 OK)
- ⚠️ Backend: https://ritualfin-api.onrender.com (503 - Sleeping/Starting)
- ✅ Database: Supabase (aws-1-eu-west-1.pooler.supabase.com)

**Branch Status**:
- ✅ QA Branch: `claude/qa-fixes-2bTSq` (13 commits, all pushed)
- ⚠️ Main Branch: Diverged (19 local vs 120 remote commits)

---

## Option 1: Deploy via GitHub PR (Recommended)

### Step 1: Create Pull Request

```bash
# Already available at:
https://github.com/Viniciussteigleder/RitualFin_replit/pull/new/claude/qa-fixes-2bTSq
```

### Step 2: Review PR

- Review all 13 commits
- Check QA Report at `docs/QA/QA_REPORT.md`
- Verify no conflicts with main branch

### Step 3: Merge PR

- **Method**: Squash and merge OR Merge commit (recommended for audit trail)
- **Branch**: Merge `claude/qa-fixes-2bTSq` → `main`

### Step 4: Automatic Deployment

**Vercel** (Frontend):
- Monitors `main` branch
- Auto-deploys on push to main
- Build time: ~2-3 minutes
- URL: https://ritual-fin-replit.vercel.app

**Render** (Backend):
- Monitors `main` branch
- Auto-deploys on push to main
- Build time: ~3-5 minutes
- URL: https://ritualfin-api.onrender.com

---

## Option 2: Manual Deployment from QA Branch

### Vercel Deployment

```bash
# Install Vercel CLI (if not already)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from current branch
vercel --prod

# Or deploy specific branch
vercel --prod --branch claude/qa-fixes-2bTSq
```

### Render Deployment

**Via Dashboard**:
1. Go to https://dashboard.render.com
2. Select service: `ritualfin-api`
3. Manual Deploy → Deploy from branch: `claude/qa-fixes-2bTSq`

**Via API** (requires RENDER_API_KEY):
```bash
curl -X POST \
  https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"branch": "claude/qa-fixes-2bTSq"}'
```

---

## Option 3: Force Push to Main (Not Recommended)

**DANGER**: This will overwrite remote main branch history

```bash
# Checkout main
git checkout main

# Merge QA branch
git merge claude/qa-fixes-2bTSq

# Force push to origin
git push --force origin main
```

**Why Not Recommended**:
- Loses 120 commits from remote main
- No audit trail
- Irreversible without backup

---

## Pre-Deployment Checklist

- [x] All P0 issues fixed
- [x] All P1 issues fixed
- [x] TypeScript check passes (`npm run check`)
- [x] Production build succeeds (`npm run build`)
- [x] Security baseline established
- [x] E2E tests implemented
- [x] Documentation updated
- [ ] Environment variables configured (verify in Render/Vercel dashboards)
- [ ] CORS_ORIGIN includes production frontend URL
- [ ] DATABASE_URL points to Supabase Transaction Pooler
- [ ] SESSION_SECRET is strong (32+ chars)
- [ ] OPENAI_API_KEY configured (if using AI features)

---

## Environment Variables Verification

### Vercel (Frontend)

**Required**:
```bash
VITE_API_URL=https://ritualfin-api.onrender.com
```

**Verification**:
1. Go to https://vercel.com/dashboard
2. Select project: `ritual-fin-replit`
3. Settings → Environment Variables
4. Verify `VITE_API_URL` is set

### Render (Backend)

**Required**:
```bash
DATABASE_URL=postgresql://postgres.[PROJECT]:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
CORS_ORIGIN=https://ritual-fin-replit.vercel.app,https://ritual-fin-replit-git-main.vercel.app
NODE_ENV=production
SESSION_SECRET=[32+ character random string]
```

**Optional**:
```bash
OPENAI_API_KEY=sk-...  # For AI features
```

**Verification**:
1. Go to https://dashboard.render.com
2. Select service: `ritualfin-api`
3. Environment → Environment Variables
4. Verify all required variables are set

---

## Post-Deployment Verification

### Backend Health Check

```bash
# Check if backend is responding
curl https://ritualfin-api.onrender.com/api/auth/me

# Expected: {"message":"Not authenticated"} or similar
```

**If 503 Error**:
- Render free tier sleeps after 15 min inactivity
- First request wakes it up (~30 seconds)
- Retry after 30 seconds

### Frontend Health Check

```bash
# Check if frontend loads
curl -I https://ritual-fin-replit.vercel.app

# Expected: HTTP/2 200
```

### CORS Verification

```bash
# From browser console (on frontend):
fetch('https://ritualfin-api.onrender.com/api/auth/me', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)

# Expected: No CORS errors
```

### End-to-End Test

1. **Navigate to**: https://ritual-fin-replit.vercel.app
2. **Verify**:
   - ✅ Dashboard loads
   - ✅ Demo auth warning banner visible (amber)
   - ✅ Settings link in sidebar (Sistema section)
   - ✅ All navigation links work
3. **Test CSV Import**:
   - Upload sample CSV
   - Verify parsing and import
4. **Test Rules**:
   - Create rule with keyword
   - Verify categorization

---

## Monitoring Commands

### Watch Backend Logs (Render)

**Via Dashboard**:
1. Go to https://dashboard.render.com
2. Select service: `ritualfin-api`
3. Logs tab (live tail)

**Via CLI** (requires render-cli):
```bash
render logs --service ritualfin-api --follow
```

### Watch Frontend Logs (Vercel)

**Via Dashboard**:
1. Go to https://vercel.com/dashboard
2. Select deployment
3. Functions → Logs

---

## Troubleshooting

### Issue: Backend 503 Error (Sleeping)

**Cause**: Render free tier sleeps after 15 min inactivity
**Solution**:
1. Wait 30 seconds for wake-up
2. Retry request
3. Consider upgrading to paid tier ($7/mo) to prevent sleep

### Issue: CORS Errors

**Symptoms**: Browser console shows "CORS policy" errors
**Fix**:
1. Check CORS_ORIGIN in Render includes frontend URL
2. Verify format: `https://ritual-fin-replit.vercel.app` (no trailing slash)
3. Redeploy backend after changing env vars

### Issue: Build Failures

**Vercel**:
- Check build logs in dashboard
- Verify `VITE_API_URL` is set
- Check for TypeScript errors

**Render**:
- Check build logs in dashboard
- Verify `DATABASE_URL` is correct
- Check Node version matches local (22.21.1)

---

## Rollback Plan

### If Deployment Fails

**Vercel**:
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Render**:
1. Go to Events tab
2. Find previous successful deploy
3. Click "Redeploy" on that commit

---

## Recommended Deployment Flow

**For This Session**:

1. **Create PR** from `claude/qa-fixes-2bTSq` to `main`
2. **Review** QA Report and commits
3. **Merge** PR (GitHub interface handles conflicts better)
4. **Wait** for auto-deployments (Vercel ~2 min, Render ~4 min)
5. **Verify** backend wakes up (first request ~30 sec)
6. **Test** critical user flows
7. **Monitor** logs for 1 hour

**Expected Total Time**: 15-20 minutes

---

## Next Steps

Choose one:

**A. Via GitHub PR (Recommended)**:
```bash
# Open PR URL in browser:
# https://github.com/Viniciussteigleder/RitualFin_replit/pull/new/claude/qa-fixes-2bTSq

# Then:
# 1. Review changes
# 2. Click "Create Pull Request"
# 3. Click "Merge Pull Request"
# 4. Wait for auto-deployments
```

**B. Via Vercel/Render Dashboards**:
```bash
# 1. Login to Vercel dashboard
# 2. Manual deploy from claude/qa-fixes-2bTSq branch
# 3. Login to Render dashboard
# 4. Manual deploy from claude/qa-fixes-2bTSq branch
```

**C. Via CLI** (requires setup):
```bash
vercel --prod
# Then manually deploy Render via dashboard
```

---

**Prepared by**: Autonomous QA Agent
**Date**: 2026-01-02
**Status**: Ready for deployment
