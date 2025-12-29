# 🔐 Credential Rotation Guide

**URGENT**: Follow this guide immediately after credentials have been exposed in git history.

---

## 🚨 IMMEDIATE ACTION: Rotate Exposed Credentials

### Step 1: Rotate Supabase Database Password

**Time Required**: 5 minutes
**Risk Level**: HIGH (requires downtime if not coordinated)

#### 1.1 Generate New Password

1. Go to: https://supabase.com
2. Login to your account
3. Select project: `rmbcplfvucvukiekvtxb` (or your project)
4. Navigate: **Settings** → **Database**
5. Click: **"Reset Database Password"**
6. **Generate Strong Password**:
   - Use password manager (1Password, Bitwarden, etc.)
   - Length: 32+ characters
   - Include: uppercase, lowercase, numbers, symbols
   - Example generator: `openssl rand -base64 32`

7. **IMPORTANT**: Save password in password manager before proceeding
8. Copy new password to clipboard

#### 1.2 Update Connection String

**Format**:
```
postgresql://postgres.YOUR_PROJECT_REF:YOUR_NEW_PASSWORD@aws-X-REGION.pooler.supabase.com:6543/postgres
```

**Your Project Details**:
- Project Ref: `rmbcplfvucvukiekvtxb` (from Supabase URL)
- Region: `aws-1-eu-west-1` (check Supabase dashboard)
- Port: `6543` (Transaction Pooler)

**New DATABASE_URL** (example):
```
postgresql://postgres.rmbcplfvucvukiekvtxb:YOUR_NEW_32_CHAR_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

---

### Step 2: Update All Environments

#### 2.1 Local Development

**File**: `.env`

```bash
# Update this line
DATABASE_URL=postgresql://postgres.rmbcplfvucvukiekvtxb:YOUR_NEW_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

**Test Connection**:
```bash
npm run db:push
# Expected: "No schema changes detected" or schema applied successfully
```

---

#### 2.2 Backend (Render)

**Steps**:
1. Go to: https://dashboard.render.com
2. Select service: `ritualfin-api` (or your backend service)
3. Navigate: **Environment** (left sidebar)
4. Find variable: `DATABASE_URL`
5. Click: **"Edit"** button
6. Paste new connection string
7. Click: **"Save Changes"**

**Expected Behavior**:
- Render will automatically redeploy (2-3 minutes)
- Monitor logs for "Live" status
- Check for database connection errors

**Verify**:
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/health
# Expected: {"status":"ok"}
```

---

#### 2.3 Frontend (Vercel) - If Using Vercel Functions

**Note**: If using split deployment (Vercel frontend + Render backend), skip this step.

**Steps** (if applicable):
1. Go to: https://vercel.com/dashboard
2. Select project: `ritualfin`
3. Navigate: **Settings** → **Environment Variables**
4. Find: `DATABASE_URL`
5. Click: **"Edit"**
6. Paste new connection string
7. Click: **"Save"**
8. Navigate: **Deployments**
9. Click: **"Redeploy"** on latest deployment

---

### Step 3: Verify All Systems

#### 3.1 Backend Health Check

```bash
# Replace with your backend URL
curl https://ritualfin-api.onrender.com/api/auth/me

# Expected response:
# {"id":"...","username":"demo"}

# Should NOT see:
# "database connection error"
# "ECONNREFUSED"
# "password authentication failed"
```

#### 3.2 Frontend Connectivity

1. Open: `https://YOUR-VERCEL-URL.vercel.app`
2. Navigate to: **Dashboard** page
3. Check browser console (F12) for errors
4. Expected: Data loads, no errors

#### 3.3 Upload Flow Test

1. Go to: `/uploads` page
2. Upload small test CSV (first 20 rows)
3. Expected: Upload succeeds, no database errors

---

### Step 4: Update Documentation

**Files to check for hardcoded credentials**:
- ✅ `docs/DEPLOYMENT_INSTRUCTIONS.md` (already redacted)
- ✅ `docs/DEPLOYMENT_GUIDE.md` (already redacted)
- ✅ `docs/DEPLOYMENT_SUPABASE_VERCEL.md` (check)
- ✅ `.env.example` (should use placeholders)
- ❌ `.env` (local only, in .gitignore)

**Search for exposed credentials**:
```bash
# From project root
grep -r "XUUZnhU0IOKp1uVn" . --exclude-dir=node_modules --exclude-dir=.git

# Should return: no results (or only .env which is gitignored)
```

---

### Step 5: Prevent Future Exposure

#### 5.1 Install Git Secrets Detection (Optional but Recommended)

**Option A: Using `detect-secrets`**:
```bash
# Install
pip install detect-secrets

# Scan repository
detect-secrets scan --baseline .secrets.baseline

# Audit baseline
detect-secrets audit .secrets.baseline
```

**Option B: Using `git-secrets`**:
```bash
# Install (macOS)
brew install git-secrets

# Configure
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'postgresql://[^:]+:[^@]+@'
git secrets --add 'sk-[A-Za-z0-9]{32,}'
```

#### 5.2 Add Pre-Commit Hook (Manual)

**File**: `.git/hooks/pre-commit`

```bash
#!/bin/bash

# Check for exposed secrets before commit
if grep -r "postgresql://postgres\." . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" | grep -v "YOUR_"; then
  echo "❌ ERROR: Real database credentials detected!"
  echo "Please replace with placeholders before committing."
  exit 1
fi

if grep -r "sk-[A-Za-z0-9]{32,}" . --exclude-dir=node_modules --exclude-dir=.git; then
  echo "❌ ERROR: OpenAI API key detected!"
  echo "Please remove before committing."
  exit 1
fi

echo "✅ No secrets detected"
exit 0
```

**Make executable**:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 🔄 Regular Rotation Schedule

### Database Password

**Frequency**: Every 90 days (recommended)
**Method**: Follow Step 1-3 above

**Schedule**:
- Q1: January 1
- Q2: April 1
- Q3: July 1
- Q4: October 1

### OpenAI API Key

**Frequency**: Every 90 days
**Method**:
1. Go to: https://platform.openai.com/api-keys
2. Click: **"Create new secret key"**
3. Copy new key
4. Update: `OPENAI_API_KEY` in all environments
5. Click: **"Revoke"** on old key

### Session Secret (After Phase D)

**Frequency**: Every 30 days (production)
**Method**:
```bash
# Generate new secret
openssl rand -base64 32

# Update SESSION_SECRET in backend environment
```

---

## 🚨 Emergency Rotation (Suspected Leak)

If you suspect credentials have been compromised:

1. **IMMEDIATELY rotate credentials** (follow steps above)
2. **Check Supabase logs** for unauthorized access
   - Dashboard → Logs → Database Logs
   - Look for: Unknown IP addresses, unusual queries
3. **Review git commit history** for exposed secrets
4. **Notify team members** of credential change
5. **Document incident** in security log

---

## ✅ Post-Rotation Checklist

- [ ] New password generated (32+ chars)
- [ ] Password saved in password manager
- [ ] Local `.env` updated
- [ ] Backend (Render) environment updated
- [ ] Backend redeployed and healthy
- [ ] Frontend (Vercel) updated (if applicable)
- [ ] Health checks passing
- [ ] Upload flow tested
- [ ] Documentation updated (no hardcoded credentials)
- [ ] Pre-commit hooks installed (optional)
- [ ] Team notified of credential change
- [ ] Old credentials confirmed revoked

---

## 📞 Support

If you encounter issues during rotation:

1. **Check Render logs**: Dashboard → Logs
2. **Check Vercel logs**: Dashboard → Deployments → [deployment] → Functions
3. **Test connection locally**: `npm run db:push`
4. **Verify connection string format**: Match example above exactly

**Common Issues**:
- "password authentication failed" → Wrong password in DATABASE_URL
- "ECONNREFUSED" → Wrong host/port in DATABASE_URL
- "service unavailable" → Supabase project paused (free tier, inactive 7+ days)

---

**Last Updated**: 2025-12-29
**Next Rotation**: 2026-03-29 (90 days)
