# DEPLOYMENT INSTRUCTIONS - DO NOT DEVIATE

**Date**: 2025-12-28
**Architecture**: Backend (Render) → Database (Supabase)
**Frontend**: Vercel → Backend API

---

## ✅ PRE-DEPLOYMENT CHECKLIST RESULTS

### Environment Variables Validated
**Backend (Render):**
- `DATABASE_URL` - ✅ Required
- `CORS_ORIGIN` - ✅ Optional (has safe defaults)
- `NODE_ENV` - ✅ Auto-set by platform
- `PORT` - ✅ Auto-set by Render
- `ALLOW_DEMO_AUTH_IN_PROD` - ⚠️ Demo-only bypass (leave unset for real production)
- `OPENAI_API_KEY` - ⚠️ Optional (AI features disabled without it)

**Frontend (Vercel):**
- `VITE_API_URL` - ✅ Required (backend URL from Step 1)

### Database Connection Validated
- ✅ Using Transaction Pooler (port 6543)
- ✅ NO Direct DB connection (port 5432) in code
- ✅ Connection string: `aws-1-eu-west-1.pooler.supabase.com:6543`

### CORS Configuration Validated
- ✅ `credentials: true` (authentication cookies enabled)
- ✅ Accepts comma-separated origins
- ✅ Safe localhost defaults for development

### Build Process Validated
- ✅ Production build succeeds
- ✅ Client bundle: 676 KB (gzip: 190 KB)
- ✅ Server bundle: 1.2 MB (includes all dependencies)

---

## 🚨 CRITICAL SAFETY RULES

1. **DO NOT** modify any code during deployment
2. **DO NOT** change database connection strings manually
3. **DO NOT** skip environment variable validation
4. **DO NOT** proceed if any step fails - STOP and report
5. **DO NOT** use Direct DB connection (port 5432) - ONLY Transaction Pooler (6543)

---

## STEP 1: DEPLOY BACKEND TO RENDER

### 1.1 Create Render Account & Service

**Navigate to:**
```
https://render.com
```

**Action 1: Sign Up**
- Click **"Get Started"** or **"Sign Up"**
- Choose **"Sign up with GitHub"** (RECOMMENDED)
- Authorize Render to access your GitHub account

**Action 2: Create Web Service**
- Click **"New +"** button (top right)
- Select **"Web Service"**
- **Connect Repository**:
  - If not connected: Click **"Connect GitHub"**
  - Find your repository: `YOUR_GITHUB_USERNAME/ritualfin` (or whatever your repo is named)
  - Click **"Connect"**

### 1.2 Configure Service Settings

**On the "Create a new Web Service" page, enter EXACTLY:**

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `ritualfin-api` | Can be changed, but remember it |
| **Region** | **Europe (Frankfurt)** | MUST match Supabase region (eu-west-1 → Frankfurt) |
| **Branch** | `main` | Your default branch |
| **Root Directory** | (leave blank) | Use repository root |
| **Runtime** | **Node** | Auto-detected |
| **Build Command** | `npm install && npm run build` | EXACT - do not modify |
| **Start Command** | `npm start` | EXACT - do not modify |
| **Instance Type** | **Free** | Upgrade to Starter ($7/mo) later if needed |

**DO NOT CLICK "Create Web Service" YET**

### 1.3 Configure Environment Variables

**Scroll down to "Environment Variables" section**

Click **"Add Environment Variable"** for each of the following:

#### Variable 1: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-X-REGION.pooler.supabase.com:6543/postgres
```
**CRITICAL**:
- Get from: Supabase Dashboard → Settings → Database → Connection String (Transaction Pooler)
- Port MUST be **6543** (Transaction Pooler)
- Replace YOUR_PROJECT_REF with your Supabase project reference
- Replace YOUR_PASSWORD with your database password
- Replace X-REGION with your region (e.g., aws-1-eu-west-1)
- DO NOT use port 5432

#### Variable 2: NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### Variable 3: CORS_ORIGIN (TEMPORARY - will update after Vercel deployment)
```
Key: CORS_ORIGIN
Value: http://localhost:5000
```
**NOTE**: We'll update this with the Vercel URL after Step 2

#### Variable 4: OPENAI_API_KEY (OPTIONAL - skip if you don't have one)
```
Key: OPENAI_API_KEY
Value: sk-... (your OpenAI API key, if you have one)
```
**If you DON'T have an OpenAI key**: SKIP this variable. AI features will be disabled but app will work.

### 1.4 Deploy Backend

**Action**: Click **"Create Web Service"** button (bottom of page)

**Expected behavior**:
- Page redirects to deployment logs
- Build starts automatically
- You'll see logs streaming in real-time

**Wait for deployment** (~3-5 minutes):
- Look for **"Build successful"** message
- Look for **"Live"** indicator (green)
- Look for **"Your service is live at https://ritualfin-api.onrender.com"** (URL will vary)

**STOP HERE - DO NOT PROCEED UNTIL:**
- ✅ Status shows **"Live"** (green indicator)
- ✅ You have the deployed URL (format: `https://YOURNAME.onrender.com`)
- ✅ No red error messages in logs

### 1.5 Verify Backend Health

**Copy the deployed URL** from Render dashboard (e.g., `https://ritualfin-api.onrender.com`)

**Open a new browser tab** and navigate to:
```
https://YOUR-BACKEND-URL.onrender.com/api/auth/me
```

**Expected response** (you should see JSON):
```json
{"message":"Not authenticated"}
```
or
```json
{"error":"User not found"}
```

**STOP IF**:
- ❌ You see "Application failed to respond" → Backend failed to start
- ❌ You see 502/503 errors → Build may still be in progress, wait 2 minutes
- ❌ You see database connection errors → DATABASE_URL is wrong

**If backend health check passes, SAVE THIS URL**:
```
Backend URL: https://_____________________________.onrender.com
```
(Write it down - you'll need it for Step 2)

---

## STEP 2: DEPLOY FRONTEND TO VERCEL

### 2.1 Create Vercel Account & Project

**Navigate to:**
```
https://vercel.com
```

**Action 1: Sign Up**
- Click **"Sign Up"**
- Choose **"Continue with GitHub"** (RECOMMENDED)
- Authorize Vercel to access your GitHub account

**Action 2: Import Project**
- Click **"Add New..."** button (top right)
- Select **"Project"**
- Find your repository and click **"Import"**

### 2.2 Configure Project Settings

**On the "Configure Project" page, enter EXACTLY:**

| Field | Value | Notes |
|-------|-------|-------|
| **Project Name** | `ritualfin` | Can be changed |
| **Framework Preset** | **Other** | DO NOT select Vite - we have custom config |
| **Root Directory** | `./` | Use repository root |
| **Build Command** | `npm run build` | Should be auto-filled |
| **Output Directory** | `dist/public` | CRITICAL - override default if needed |
| **Install Command** | `npm install` | Should be auto-filled |

**DO NOT CLICK "Deploy" YET**

### 2.3 Configure Environment Variables

**Click "Environment Variables" section to expand**

**Add EXACTLY ONE variable:**

#### Variable: VITE_API_URL
```
Key: VITE_API_URL
Value: https://YOUR-BACKEND-URL.onrender.com
```
**CRITICAL**:
- Replace `YOUR-BACKEND-URL` with the URL from Step 1.5
- NO trailing slash
- Example: `https://ritualfin-api.onrender.com`

**Select environments**: Check **Production**, **Preview**, **Development** (all three)

### 2.4 Deploy Frontend

**Action**: Click **"Deploy"** button

**Expected behavior**:
- Redirects to deployment page
- Build starts automatically
- Logs appear in real-time

**Wait for deployment** (~2-3 minutes):
- Look for **"Building"** → **"Deploying"** → **"Ready"**
- Look for **"Congratulations!"** message
- You'll see the deployed URL (format: `https://YOURNAME.vercel.app`)

**STOP HERE - DO NOT PROCEED UNTIL:**
- ✅ Status shows **"Ready"**
- ✅ You have the deployed URL (format: `https://YOURNAME.vercel.app`)
- ✅ No build errors

**SAVE THIS URL**:
```
Frontend URL: https://_____________________________.vercel.app
```

### 2.5 Update Backend CORS

**Critical**: Now that you have the Vercel URL, update the backend CORS setting

**Go back to Render dashboard**:
1. Navigate to **"ritualfin-api"** service
2. Click **"Environment"** (left sidebar)
3. Find **CORS_ORIGIN** variable
4. Click **"Edit"**
5. Update value to:
```
https://YOUR-VERCEL-URL.vercel.app
```
Example: `https://ritualfin.vercel.app`

6. Click **"Save Changes"**

**Expected behavior**:
- Render will automatically redeploy (this is normal)
- Wait ~1-2 minutes for redeploy to complete
- Status will briefly show "Deploying" then return to "Live"

---

## STEP 3: PRODUCTION SMOKE TESTS

**Now test the full stack end-to-end**

### Test 1: Frontend Loads
**Action**: Open your Vercel URL in browser
```
https://YOUR-VERCEL-URL.vercel.app
```

**Expected**:
- ✅ RitualFin homepage loads
- ✅ No JavaScript errors in browser console (F12)
- ✅ Navigation works (dashboard, uploads, etc.)

**STOP IF**:
- ❌ Blank page → Check browser console for errors
- ❌ "Failed to fetch" errors → CORS issue or backend down

### Test 2: API Connectivity
**Action**: While on your Vercel frontend, open browser DevTools (F12)
- Go to **Network** tab
- Navigate to `/dashboard` page
- Look for requests to your backend URL

**Expected**:
- ✅ You see requests to `YOUR-BACKEND-URL.onrender.com/api/...`
- ✅ Requests return 200 or 401 (not authenticated - this is OK)
- ✅ No CORS errors

**STOP IF**:
- ❌ Requests to `/api/` instead of full backend URL → VITE_API_URL not set
- ❌ CORS errors in console → CORS_ORIGIN on backend is wrong

### Test 3: Database Connection
**Action**: On your Vercel frontend:
1. Navigate to `/uploads` page
2. Click **"Upload CSV"** button
3. Select a small test CSV (or use sample from `attached_assets/`)
4. Click **"Process Upload"**

**Expected**:
- ✅ Upload progresses
- ✅ You see "Upload successful" or similar message
- ✅ Transactions appear in database

**STOP IF**:
- ❌ "Database error" → DATABASE_URL on backend is wrong
- ❌ Timeout → CSV too large (try smaller file)

### Test 4: Confirm Queue
**Action**: Navigate to `/confirm` page

**Expected**:
- ✅ Transactions from upload appear
- ✅ Can categorize and confirm transactions

### Test 5: Dashboard
**Action**: Navigate to `/dashboard` page

**Expected**:
- ✅ Dashboard loads with data
- ✅ Charts render
- ✅ No errors

---

## ✅ DEPLOYMENT COMPLETE CHECKLIST

- [ ] Backend deployed to Render and shows "Live" status
- [ ] Backend health check passes (`/api/auth/me` returns JSON)
- [ ] Frontend deployed to Vercel and shows "Ready" status
- [ ] Frontend loads in browser without errors
- [ ] API requests go to correct backend URL (check Network tab)
- [ ] CORS configured correctly (no CORS errors in console)
- [ ] Upload flow works (at least one test CSV)
- [ ] Confirm queue shows transactions
- [ ] Dashboard renders data

---

## 🚫 WHAT NOT TO WORRY ABOUT (YET)

**These are expected limitations in this deployment:**

1. **No real authentication** - "demo" user system is temporary
2. **No row-level security** - Will be added in Phase D
3. **AI features may not work** - If OPENAI_API_KEY not set
4. **No email notifications** - Not implemented yet (Phase C.5)
5. **No AI assistant chat** - Not implemented yet (Phase C.6)
6. **Free tier limitations**:
   - Render: Service sleeps after 15min inactivity (cold starts)
   - Vercel: 100GB bandwidth/month limit
   - Supabase: 500MB database limit

**These will be addressed in future phases**

---

## 🆘 TROUBLESHOOTING QUICK REFERENCE

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Backend shows "Deploy failed" | Build error | Check Render logs, ensure `npm run build` works locally |
| Frontend shows blank page | JavaScript error | Check browser console, verify build succeeded |
| CORS errors in browser console | CORS_ORIGIN mismatch | Update CORS_ORIGIN in Render to match Vercel URL exactly |
| "Failed to fetch" errors | Backend down or wrong URL | Verify backend is "Live", check VITE_API_URL in Vercel |
| Database connection errors | Wrong DATABASE_URL | Verify port is 6543, host is pooler.supabase.com |
| Upload fails with timeout | CSV too large | Try smaller CSV (<100 rows), or upgrade Render instance |

---

**END OF DEPLOYMENT INSTRUCTIONS**
