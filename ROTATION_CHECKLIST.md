# 🔐 CREDENTIAL ROTATION CHECKLIST - IN PROGRESS

**Started**: 2025-12-29
**Status**: 🟡 IN PROGRESS

---

## Step 1: Generate New Supabase Password ⏳

### Instructions:

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard
   - Login with your account

2. **Navigate to Database Settings**:
   - Click on your project (rmbcplfvucvukiekvtxb)
   - Left sidebar: **Settings** → **Database**

3. **Reset Password**:
   - Scroll to "Database Password" section
   - Click: **"Reset Database Password"**
   - Copy the new password OR generate your own strong password

4. **Save Password Securely**:
   - [ ] Saved in password manager (1Password, Bitwarden, etc.)
   - [ ] Password copied to clipboard

**New Password Format**: 32+ characters, mixed case, numbers, symbols

---

## Step 2: Update Local Environment ⏳

### Update `.env` file:

```bash
# Current (COMPROMISED):
# DATABASE_URL=postgresql://postgres.rmbcplfvucvukiekvtxb:XUUZnhU0IOKp1uVn@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

# New (after rotation):
DATABASE_URL=postgresql://postgres.rmbcplfvucvukiekvtxb:YOUR_NEW_PASSWORD_HERE@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

**Replace**: `YOUR_NEW_PASSWORD_HERE` with the new password from Step 1

### Test Connection:

```bash
# From project root:
npm run db:push
```

**Expected output**:
- ✅ "No schema changes detected" OR
- ✅ "Schema applied successfully"

**If you see errors**:
- ❌ "password authentication failed" → Wrong password in DATABASE_URL
- ❌ "ECONNREFUSED" → Wrong host/port (should be 6543)

**Checklist**:
- [ ] `.env` file updated with new password
- [ ] `npm run db:push` successful
- [ ] No connection errors

---

## Step 3: Update Backend (Render) ⏳

### Instructions:

1. **Open Render Dashboard**:
   - Go to: https://dashboard.render.com
   - Login with your account

2. **Select Backend Service**:
   - Find service: `ritualfin-api` (or whatever you named it)
   - Click to open service details

3. **Update Environment Variable**:
   - Left sidebar: **Environment**
   - Find variable: `DATABASE_URL`
   - Click: **"Edit"** button (pencil icon)
   - Paste new connection string:
     ```
     postgresql://postgres.rmbcplfvucvukiekvtxb:YOUR_NEW_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
     ```
   - Click: **"Save Changes"**

4. **Monitor Redeploy**:
   - Render will automatically redeploy (2-3 minutes)
   - Top of page: Status will show "Deploying..." → "Live"
   - Check **Logs** tab for any errors

5. **Verify Backend Health**:
   ```bash
   # Replace with your actual backend URL
   curl https://YOUR-BACKEND-URL.onrender.com/api/auth/me
   ```

   **Expected response**:
   ```json
   {"id":"...","username":"demo"}
   ```

**Checklist**:
- [ ] Render environment variable updated
- [ ] Redeploy completed (status: "Live")
- [ ] No errors in logs
- [ ] Health check passes

---

## Step 4: Update Frontend (Vercel) - If Applicable ⏳

**Note**: Only needed if you're using Vercel serverless functions with database access.

If using **split deployment** (Vercel frontend + Render backend), **SKIP THIS STEP**.

### Instructions (if applicable):

1. **Open Vercel Dashboard**:
   - Go to: https://vercel.com/dashboard
   - Login with your account

2. **Select Project**:
   - Find project: `ritualfin` (or your project name)
   - Click to open project

3. **Update Environment Variable**:
   - Top tabs: **Settings**
   - Left sidebar: **Environment Variables**
   - Find: `DATABASE_URL` (if exists)
   - Click: **"Edit"**
   - Paste new connection string
   - Click: **"Save"**

4. **Redeploy**:
   - Top tabs: **Deployments**
   - Find latest deployment
   - Click "..." menu → **"Redeploy"**
   - Wait for deployment (~2-3 minutes)

**Checklist**:
- [ ] Vercel environment variable updated (or N/A if split deployment)
- [ ] Redeployment completed (or N/A)

---

## Step 5: Verify All Systems ⏳

### 5.1 Backend Health Check

```bash
# Replace with your backend URL
curl https://YOUR-BACKEND-URL.onrender.com/api/auth/me
```

**Expected**: `{"id":"...","username":"demo"}`

**Checklist**:
- [ ] Backend API responds
- [ ] No database connection errors

---

### 5.2 Frontend Connectivity

1. Open: `https://YOUR-VERCEL-URL.vercel.app` (or your production URL)
2. Navigate to: **Dashboard** page
3. Check browser console (F12) for errors

**Expected**: Data loads, no errors

**Checklist**:
- [ ] Frontend loads
- [ ] Dashboard shows data
- [ ] No console errors

---

### 5.3 Upload Flow Test

1. Navigate to: `/uploads` page
2. Upload a small test CSV (first 20 rows)
3. Check: Upload succeeds, transactions appear

**Expected**: Upload completes successfully

**Checklist**:
- [ ] CSV upload works
- [ ] Transactions saved to database
- [ ] No errors

---

## Step 6: Clean Up ✅

### Update Documentation (Already Done)

- [x] Credentials redacted from all docs
- [x] SECURITY.md created
- [x] CREDENTIAL_ROTATION_GUIDE.md created
- [x] Changes committed and pushed to GitHub

### Final Security Check

```bash
# Verify no hardcoded credentials in codebase
grep -r "XUUZnhU0IOKp1uVn" . --exclude-dir=node_modules --exclude-dir=.git

# Should return: No results (or only this file)
```

**Checklist**:
- [ ] Old password not found in codebase
- [ ] All systems verified working
- [ ] Team notified of credential change (if applicable)

---

## ✅ COMPLETION CHECKLIST

- [ ] Step 1: New password generated and saved
- [ ] Step 2: Local `.env` updated and tested
- [ ] Step 3: Render backend updated and verified
- [ ] Step 4: Vercel updated (if applicable) or N/A
- [ ] Step 5: All systems verified working
- [ ] Step 6: Clean-up completed

---

## 🎉 ROTATION COMPLETE

**When all steps are checked**:

1. ✅ Old credentials are invalidated
2. ✅ All environments using new password
3. ✅ All systems verified working
4. ✅ Documentation is clean
5. ✅ Security improved

**Next rotation**: 2026-03-29 (90 days from now)

**Delete this file after completion**:
```bash
rm ROTATION_CHECKLIST.md
```

---

**Last Updated**: 2025-12-29
**Status**: 🟡 IN PROGRESS → 🟢 COMPLETE (when done)
