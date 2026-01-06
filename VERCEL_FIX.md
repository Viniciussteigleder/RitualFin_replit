# Vercel Blank Page Fix

## Problem Diagnosed

**URL**: https://ritual-fin-replit.vercel.app/
**Symptom**: Blank page
**Root Cause**: Missing `VITE_API_URL` environment variable in Vercel deployment

## Technical Analysis

### What's Happening

1. **Frontend builds without backend URL**
   - Vercel build process doesn't have `VITE_API_URL` set
   - `client/src/lib/api.ts` defaults to `/api` (relative URL)
   - Frontend tries to call APIs on same domain as itself

2. **API calls fail**
   - Browser requests: `https://ritual-fin-replit.vercel.app/api/auth/me`
   - Vercel returns HTML (SPA routing rule) instead of JSON
   - JavaScript gets JSON parse errors
   - App fails to render → blank page

3. **Code is correct**
   - ✅ Build completes successfully
   - ✅ HTML structure correct
   - ✅ JS/CSS bundles exist and load
   - ❌ Runtime API connection broken

## Fix Required

Add environment variable in Vercel dashboard:

**Variable Name**: `VITE_API_URL`
**Value**: `https://ritualfin-api.onrender.com`

### Step-by-Step Instructions

1. Go to https://vercel.com/dashboard
2. Select project: `ritual-fin-replit`
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://ritualfin-api.onrender.com`
   - **Environment**: Production, Preview, Development (all)
5. Click "Save"
6. Go to Deployments → Click "..." on latest deployment → "Redeploy"
7. Wait for new deployment to complete
8. Test: https://ritual-fin-replit.vercel.app/

### Verification

After redeployment, the app should:
- ✅ Load login page
- ✅ Show RitualFin branding
- ✅ Accept demo credentials (username: demo, password: demo)
- ✅ Redirect to dashboard
- ✅ Display data from backend

## Code Status

**All QA fixes are complete and ready**:
- Branch: `claude/qa-fixes-2bTSq`
- Commits: 15 commits with all P0/P1 fixes
- Build: ✅ Tested and working locally
- Backend: Expected on Render (https://ritualfin-api.onrender.com)

**No code changes needed** - this is purely a deployment configuration issue.

## Alternative: Redeploy from QA Branch

If you want to deploy the latest QA fixes simultaneously:

1. In Vercel dashboard → Settings → Git
2. Change Production Branch from `main` to `claude/qa-fixes-2bTSq`
3. Add `VITE_API_URL` environment variable (as above)
4. Trigger redeploy

This will deploy the QA branch with all fixes directly to production.

---

**Created**: 2026-01-03
**Issue**: Vercel blank page
**Status**: Diagnosed - awaiting environment variable configuration
