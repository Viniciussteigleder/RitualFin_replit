# DEPLOY NOW - Vercel CLI Instructions

**Status**: ⚠️ **BLOCKED BY MISSING VERCEL TOKEN**
**Created**: 2025-12-29 19:15 UTC
**Commit Ready**: dd85e96 (merged to main)

---

## Why Autonomous Deployment Failed

**Issue**: Vercel CLI requires authentication via:
- Interactive browser login (not available in this environment), OR
- `VERCEL_TOKEN` environment variable (not present)

**Command Attempted**:
```bash
vercel whoami
# Error: No existing credentials found. Please run `vercel login` or pass "--token"
```

---

## SOLUTION: You Must Deploy Manually

You have **3 options** to complete deployment:

---

## OPTION 1: Vercel CLI from Your Local Machine (RECOMMENDED)

**Requirements**: You have git and npm installed locally

### Steps:

```bash
# 1. Clone/pull latest code
git clone https://github.com/Viniciussteigleder/RitualFin_replit.git
cd RitualFin_replit
git checkout main
git pull origin main

# Verify you have commit dd85e96
git log -1 --oneline
# Should show: dd85e96 or later

# 2. Install Vercel CLI globally
npm install -g vercel

# 3. Login to Vercel
vercel login
# Follow browser prompts to authenticate

# 4. Deploy to production
vercel --prod

# 5. CLI will output production URL
# Example: ✓ Production: https://ritualfin-abc123.vercel.app
```

**Expected Output**:
```
🔍  Inspect: https://vercel.com/...
✅  Production: https://ritualfin-xyz.vercel.app [copied to clipboard]
```

---

## OPTION 2: Use Vercel Token in This Environment

**If you have a Vercel token**, you can set it here:

### Steps:

```bash
# Get your Vercel token from:
# https://vercel.com/account/tokens
# Create new token with name "CLI Deployment"

# Set token in environment
export VERCEL_TOKEN="your-token-here"

# Deploy
vercel --prod --token "$VERCEL_TOKEN"
```

**Security Note**: Do NOT commit this token to git. Use it only for this deployment session.

---

## OPTION 3: Vercel Dashboard Manual Import (Fallback)

**If CLI doesn't work**, use Vercel web dashboard:

### Steps:

1. **Go to Vercel Dashboard**:
   ```
   https://vercel.com/new
   ```

2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Select: `Viniciussteigleder/RitualFin_replit`
   - Branch: `main`

3. **Configure Project**:
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

4. **Set Environment Variables**:
   ```
   VITE_API_URL=https://ritualfin-api.onrender.com
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build (~2-3 minutes)
   - Copy production URL when deployment completes

---

## What Happens During Deployment

### Build Process:
```bash
npm install          # Install dependencies
npm run build        # Build client + server
# Output:
# - dist/public/      (frontend static files)
# - dist/index.cjs    (server bundle - not used by Vercel)
```

### Vercel Configuration:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**SPA Routing**: All routes (`/dashboard`, `/transactions`, etc.) serve `index.html`

---

## After Deployment - Verification Steps

Once deployment completes, Vercel will give you a production URL.

### Test 1: Frontend Loads
```bash
# Replace with your actual Vercel URL
export FRONTEND_URL="https://ritualfin-xyz.vercel.app"

curl -I $FRONTEND_URL
# Expected: HTTP 200, Content-Type: text/html
```

### Test 2: Static Assets Load
```bash
curl -I $FRONTEND_URL/assets/index-*.css
# Expected: HTTP 200, CSS file
```

### Test 3: SPA Routing Works
```bash
curl -I $FRONTEND_URL/dashboard
# Expected: HTTP 200, returns index.html (not 404)
```

### Test 4: API Calls Work (Browser Test)
```
1. Open https://<your-vercel-url>.vercel.app
2. Open DevTools → Network tab
3. Attempt login
4. Verify API calls go to: https://ritualfin-api.onrender.com/api/auth/login
5. Check for CORS errors (should be none)
```

---

## Environment Variables in Vercel

**REQUIRED**:
```bash
VITE_API_URL=https://ritualfin-api.onrender.com
```

**How to Set** (if using dashboard):
```
Vercel Dashboard → Your Project → Settings → Environment Variables
Add:
  Name: VITE_API_URL
  Value: https://ritualfin-api.onrender.com
  Environment: Production
```

**How to Set** (if using CLI):
```bash
vercel env add VITE_API_URL production
# When prompted, enter: https://ritualfin-api.onrender.com
```

---

## Troubleshooting

### Issue: "Deployment not found"
**Solution**: You may have a different production URL. Check:
```
Vercel Dashboard → Deployments → Latest Production
Copy the actual URL from there
```

### Issue: "API calls returning 404"
**Solution**: Check that `VITE_API_URL` is set correctly:
```bash
# In Vercel dashboard
Settings → Environment Variables → VITE_API_URL
# Should be: https://ritualfin-api.onrender.com
# NOT: https://ritualfin-api.onrender.com/api (no /api suffix!)
```

### Issue: "CORS errors in browser"
**Solution**: Backend needs frontend URL in CORS_ORIGIN:
```bash
# In Render dashboard for backend
Environment → CORS_ORIGIN
# Add: https://your-vercel-url.vercel.app
# Then redeploy backend
```

### Issue: "Build fails in Vercel"
**Solution**: Check build logs in Vercel dashboard:
```
Common issues:
- Missing dependencies → Check package.json
- TypeScript errors → Run npm run check locally first
- Out of memory → Upgrade Vercel plan
```

---

## What's Already Working

✅ **Backend Deployed**: https://ritualfin-api.onrender.com
✅ **Database Connected**: Supabase PostgreSQL
✅ **Health Checks**: `/api/health` returning OK
✅ **Code Quality**: All tests passing
✅ **Git**: Latest code pushed to main (dd85e96)

**Only frontend deployment remaining!**

---

## Quick Reference

**Backend URL**: `https://ritualfin-api.onrender.com`
**Backend Health**: `https://ritualfin-api.onrender.com/api/health`
**Git Commit**: `dd85e96` (merged fix/deployment-connectivity)
**Required Env Var**: `VITE_API_URL=https://ritualfin-api.onrender.com`

---

## Next Steps

1. Choose deployment method (CLI recommended)
2. Follow steps above
3. Copy production URL when deployment completes
4. Test using verification steps
5. Share production URL for final validation

---

**All code is ready. Backend is ready. You just need to trigger the Vercel deployment.**
