# DEPLOYMENT GUIDE: Vercel + Render + Supabase

**Last Updated**: 2025-12-28
**Architecture**: Split deployment (Frontend on Vercel, Backend on Render, Database on Supabase)

See also: `docs/FULL_DEPLOY_PROTOCOL.md` for the ongoing deployment protocol (Commit/Sync vs Full Deploy).

**Policy**: Full Deploy is required for all changes (backend and UI-only). Commit/Sync is deprecated.

---

## Prerequisites

✅ Completed:
- Supabase project created (project-ref: YOUR_PROJECT, region: eu-west-1)
- Database schema applied (16 tables)
- Codebase configured for split deployment
- CORS enabled for cross-origin requests

📝 Required Accounts:
- [x] Supabase account (database)
- [ ] Vercel account (frontend hosting)
- [ ] Render account (backend hosting)
- [ ] GitHub repo linked

---

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Vercel    │ ──────> │    Render    │ ──────> │  Supabase   │
│  (Frontend) │  HTTPS  │  (Backend)   │   PG    │  (Database) │
│  Static SPA │         │  Express API │         │  PostgreSQL │
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for auto-deploy)
3. Authorize Render to access your repository

### 1.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ritualfin-api` (or your choice)
   - **Region**: Choose same as Supabase (Europe - Frankfurt for eu-west-1)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter $7/mo for better performance)

### 1.3 Configure Environment Variables

In Render dashboard → Environment, add:

```bash
# Database (get from Supabase Dashboard → Settings → Database → Connection String)
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-X-REGION.pooler.supabase.com:6543/postgres

# CORS (add your Vercel URL after deployment)
CORS_ORIGIN=https://YOUR-VERCEL-URL.vercel.app

# Node Environment
NODE_ENV=production

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=<generate-random-secret>

# OpenAI (Optional - for AI features)
# OPENAI_API_KEY=sk-...
```

### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait for build (~3-5 minutes)
3. Copy the deployed URL (e.g., `https://ritualfin-api.onrender.com`)

### 1.5 Verify Backend Health
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/auth/me
# Expected: {"message":"Not authenticated"} or similar
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repository

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Other (we have custom config)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install` (default)

### 2.3 Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```bash
# Backend API URL (from Step 1.4)
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com

# Supabase (Optional - for future Supabase Auth integration)
# NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Copy the deployed URL (e.g., `https://ritualfin.vercel.app`)

### 2.5 Update Backend CORS

Go back to Render → ritualfin-api → Environment:
```bash
# Update CORS_ORIGIN to include your Vercel URL
CORS_ORIGIN=https://YOUR-VERCEL-URL.vercel.app,https://YOUR-VERCEL-URL-git-main.vercel.app
```

Click **"Save Changes"** (this will trigger a redeploy)

---

## Step 3: Verification & QA

### 3.1 Frontend Health Check
1. Visit your Vercel URL: `https://YOUR-VERCEL-URL.vercel.app`
2. Expected: RitualFin homepage loads

### 3.2 API Connectivity Check
1. Open browser DevTools → Network tab
2. Navigate to dashboard page
3. Expected: API calls to `YOUR-BACKEND-URL.onrender.com` succeed

### 3.3 Upload Flow Test (Critical)
1. Go to `/uploads` page
2. Upload a small CSV file (first 20 rows from sample)
3. Expected: Upload succeeds, transactions appear in `/confirm` queue

### 3.4 Database Verification
1. Go to Supabase dashboard → Table Editor
2. Check `uploads` table has new entry
3. Check `transactions` table has parsed data

---

## Step 4: Post-Deployment Configuration

### 4.1 Custom Domain (Optional)
**Vercel**:
1. Settings → Domains → Add Domain
2. Follow DNS configuration instructions

**Render**:
1. Settings → Custom Domain → Add Domain
2. Update CORS_ORIGIN with new domain

### 4.2 Environment-Specific Settings

**Production .env (Render)**:
```bash
DATABASE_URL=<supabase-transaction-pooler>
CORS_ORIGIN=https://ritualfin.com,https://www.ritualfin.com
NODE_ENV=production
SESSION_SECRET=<strong-random-secret>
```

**Production .env (Vercel)**:
```bash
VITE_API_URL=https://api.ritualfin.com
```

---

## Rollback Strategy

### If Deployment Fails

**Frontend (Vercel)**:
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Backend (Render)**:
1. Go to Events tab
2. Find previous successful deploy
3. Click "Redeploy" on that commit

**Database (Supabase)**:
- Database schema is immutable (drizzle-kit push)
- No rollback needed unless data corruption

---

## Monitoring & Logs

### Vercel Logs
- Dashboard → Deployments → [Select deployment] → Function Logs
- Real-time logs during deployment

### Render Logs
- Dashboard → Logs tab
- Real-time server logs
- Filter by severity (Info, Warning, Error)

### Supabase Logs
- Dashboard → Database → Logs
- Query performance metrics
- Connection pool stats

---

## Cost Summary

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| Render | Free | $0 |
| **Total** | | **$0/month** |

### Upgrade Paths
- Supabase Pro: $25/mo (8GB DB, better performance)
- Vercel Pro: $20/mo/user (analytics, custom domains)
- Render Starter: $7/mo (better instance, no sleep)

**Recommended first upgrade**: Render Starter ($7/mo) to avoid cold starts

---

## Troubleshooting

### Issue: CORS Errors

**Symptoms**: Browser console shows "CORS policy" errors

**Fix**:
1. Check CORS_ORIGIN in Render includes exact Vercel URL
2. Verify no trailing slash in URLs
3. Include all preview URLs (e.g., `*-git-main-yourproject.vercel.app`)

### Issue: API Calls Fail with 404

**Symptoms**: Frontend loads but API calls return 404

**Fix**:
1. Check VITE_API_URL in Vercel is correct
2. Verify backend is running (check Render dashboard)
3. Test backend directly: `curl https://backend-url.onrender.com/api/auth/me`

### Issue: Database Connection Timeout

**Symptoms**: 500 errors, "connection timeout" in Render logs

**Fix**:
1. Verify DATABASE_URL uses Transaction Pooler (port 6543)
2. Check Supabase project is not paused (free tier auto-pauses after 7 days inactivity)
3. Test connection from local: `DATABASE_URL=<url> npm run db:push`

### Issue: Session/Auth Issues

**Symptoms**: "Not authenticated" errors after login

**Fix**:
1. Verify `credentials: "include"` in all fetch calls
2. Check SESSION_SECRET is set in Render
3. Verify CORS allows credentials (`credentials: true`)
4. For cross-domain: Cookies may not work (consider JWT)

---

## Security Checklist

- [ ] SESSION_SECRET is strong random value (32+ chars)
- [ ] DATABASE_URL uses Transaction Pooler (not direct connection)
- [ ] CORS_ORIGIN only includes trusted domains
- [ ] No API keys in client-side code
- [ ] Supabase RLS disabled (relying on app-level auth for now)
- [ ] HTTPS enforced (Vercel/Render handle this automatically)

---

## Next Steps

After successful deployment:

1. **Monitor for 24 hours**:
   - Check Render logs for errors
   - Monitor Supabase connection pool
   - Verify no CORS issues

2. **Configure monitoring** (Optional):
   - Set up Sentry for error tracking
   - Configure Vercel Analytics
   - Set up uptime monitoring (UptimeRobot, Pingdom)

3. **Resume Phase C.4-C.6** (Backend features):
   - AI Usage Tracking
   - Notification Backend
   - AI Assistant Streaming

4. **Plan Phase D** (Future):
   - Replace demo auth with Supabase Auth
   - Enable Row Level Security (RLS)
   - Multi-user support

---

**End of Deployment Guide**
