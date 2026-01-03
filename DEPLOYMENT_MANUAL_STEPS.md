# Manual Deployment Steps Required

## Current Situation

**QA Branch Ready**: All fixes complete on `claude/qa-fixes-2bTSq` (16 commits)
**Cannot Auto-Deploy**: System restrictions prevent autonomous push to `main` branch
**Manual Action Required**: You need to merge QA branch to main and configure Vercel

## Why Autonomous Merge Failed

The repository has branch protection:
- ✅ Can push to `claude/*` branches (working as intended)
- ❌ Cannot push to `main` branch (403 forbidden)
- ❌ Cannot create PR without GitHub token
- ❌ Cannot configure Vercel without access token

**This is by design for security.**

## Required Manual Steps

### Option A: Merge via GitHub UI (Recommended)

1. **Create Pull Request**
   - Go to: https://github.com/Viniciussteigleder/RitualFin_replit/pulls
   - Click "New Pull Request"
   - Base: `main`
   - Compare: `claude/qa-fixes-2bTSq`
   - Title: "Deploy QA Fixes to Production"
   - Create and merge the PR

2. **Configure Vercel Environment**
   - Go to: https://vercel.com/dashboard
   - Select project: `ritual-fin-replit`
   - Settings → Environment Variables
   - Add: **`VITE_API_URL`** = `https://ritualfin-api.onrender.com`
   - Target: Production (+ Preview + Development)
   - Save

3. **Trigger Redeployment**
   - Deployments tab
   - Latest deployment → "..." menu → "Redeploy"
   - Wait for completion
   - Verify: https://ritual-fin-replit.vercel.app/

### Option B: Merge Locally (Advanced)

```bash
# 1. Pull latest main
git checkout main
git pull origin main

# 2. Merge QA branch (resolve any conflicts)
git merge claude/qa-fixes-2bTSq

# 3. Push to main (requires write access)
git push origin main
```

Then follow steps 2-3 from Option A for Vercel configuration.

### Option C: Deploy QA Branch Directly

If you want to deploy immediately without merging to main:

1. **Change Vercel Production Branch**
   - Vercel Dashboard → Settings → Git
   - Production Branch: `claude/qa-fixes-2bTSq` (instead of `main`)
   - Save

2. **Add Environment Variable** (same as above)
   - `VITE_API_URL` = `https://ritualfin-api.onrender.com`

3. **Trigger Deploy** (will deploy from QA branch)

## What's on QA Branch

**16 Commits with All QA Fixes:**

```
9b09a9c docs(deploy): Document Vercel blank page fix - missing VITE_API_URL
31fd14f docs(deploy): Add deployment verification and status reports
27f5687 docs(deploy): Add comprehensive deployment action plan
108cad8 docs(qa): Create comprehensive QA report [Phase 8]
1b906aa docs: Complete Phase 7 documentation consistency [P3] [IAL-009]
e5c0f59 docs(security): Create comprehensive security baseline documentation [Phase 6]
3651a24 docs(qa): Mark Phase 4 Milestone 2 complete - All P1 fixes done
d89f160 test(e2e): Implement Playwright E2E test suite [P1] [IAL-006]
849bd27 docs(deploy): Add deployment documentation to key project files [P1] [IAL-005]
4e1d59f docs(qa): Mark Phase 4 Milestone 1 complete - All P0 fixes done
99bb52a fix(rules): Document keyword expression behavior [P0] [IAL-004]
8980831 fix(csv): Remove duplicate variable declarations
26cc29e fix(csv): Add Sparkasse diagnostic reporting [P0] [IAL-003]
f657de4 fix(security): Add demo auth warning banner [P0] [IAL-002]
41e34b6 fix(nav): Add Settings link to sidebar Sistema section [P0] [IAL-001]
8c12f16 docs(qa): Create comprehensive fix execution plan
```

## Post-Deployment Verification

After deployment completes:

1. **Test Frontend**
   ```bash
   curl -I https://ritual-fin-replit.vercel.app/
   # Should return 200 OK with HTML
   ```

2. **Test Login**
   - Visit: https://ritual-fin-replit.vercel.app/
   - Should show login page (not blank!)
   - Login with: demo / demo
   - Should redirect to dashboard

3. **Test Backend Connection**
   - Dashboard should load data
   - No console errors about API calls

4. **Run Verification Script**
   ```bash
   bash scripts/verify-deployment.sh
   ```

## Summary

**All code is ready and tested.** Two manual actions required:

1. ✅ **Merge QA branch to main** (via GitHub UI or local merge)
2. ✅ **Add VITE_API_URL to Vercel** (via Vercel dashboard)

Then Vercel will auto-deploy the working code and the blank page will be fixed.

---

**Branch**: `claude/qa-fixes-2bTSq`
**Status**: Ready for deployment
**Blocker**: Manual merge + environment variable configuration
**Fix Time**: ~5 minutes via GitHub/Vercel UI
