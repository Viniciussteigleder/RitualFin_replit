# MANUAL VERCEL DEPLOYMENT GUIDE
**CRITICAL: Vercel Git Integration Not Working - Deploy Directly**

---

## 🚨 SITUATION

**Problem**: Vercel is not detecting new commits from GitHub
**Root Cause**: Git integration is broken or disconnected
**Solution**: Deploy directly using Vercel CLI (bypasses Git)

---

## ✅ OPTION 1: AUTOMATED SCRIPT (EASIEST)

### For Mac/Linux Users:

```bash
# Open terminal in project root
cd /home/runner/workspace

# Run the deployment script
./DEPLOY_NOW.sh
```

The script will:
1. Verify code is ready
2. Login to Vercel (opens browser)
3. Link to your project
4. Deploy to production
5. Give you the production URL

---

## ✅ OPTION 2: MANUAL STEP-BY-STEP

### Step 1: Open Terminal

**Mac/Linux**:
- Open Terminal app
- Navigate to project: `cd /path/to/RitualFin_replit`

**Windows**:
- Open Command Prompt or PowerShell
- Navigate to project: `cd C:\path\to\RitualFin_replit`

### Step 2: Verify Code is Ready

```bash
git log -1 --oneline
```

**Expected output**:
```
c97afd9 🚨 VERCEL DEPLOYMENT FIX - v1.0.1 - DEPLOY THIS COMMIT NOW
```

If you see this, the fix is ready. ✅

### Step 3: Login to Vercel

```bash
vercel login
```

**What happens**:
1. Browser window opens
2. You'll see "Verify Your Vercel CLI"
3. Click **"Verify"** or **"Continue"**
4. Close browser, return to terminal

**Expected output**:
```
> Success! Email verified
```

### Step 4: Link to Your Project

```bash
vercel link
```

**You'll be prompted with questions**:

```
? Set up and deploy "~/RitualFin_replit"? (Y/n)
→ Type: Y (press Enter)

? Which scope should contain your project?
→ Select your team/account (use arrow keys, press Enter)

? Link to existing project? (Y/n)
→ Type: Y (press Enter)

? What's the name of your existing project?
→ Type: ritualfin (or your project name, press Enter)
```

**Expected output**:
```
✔ Linked to youraccount/ritualfin (created .vercel and added to .gitignore)
```

### Step 5: Deploy to Production

```bash
vercel --prod --yes
```

**What happens**:
1. Code is uploaded to Vercel
2. Build starts (you'll see logs in real-time)
3. Deployment completes
4. Production URL is printed

**Expected output (final lines)**:
```
✔ Deployment ready [2-3 min]
https://ritual-fin-replit.vercel.app
```

### Step 6: Verify Deployment

```bash
# Copy the URL from output above
# Open in browser
# DevTools (F12) → Network tab
# Attempt login
# Verify request URL: https://ritualfin-api.onrender.com/api/auth/login
```

---

## 🔍 TROUBLESHOOTING

### Error: "vercel: command not found"

**Cause**: Vercel CLI not installed

**Fix**:
```bash
npm install -g vercel
```

Then retry from Step 3.

---

### Error: "No existing projects found"

**Cause**: Project name mismatch or you're in wrong team

**Fix**:
```bash
# List all your projects
vercel ls

# Look for your project name in the list
# Use exact name when linking
vercel link
```

---

### Error: "Authentication failed"

**Cause**: Browser authentication didn't complete

**Fix**:
```bash
# Logout and try again
vercel logout
vercel login
```

Ensure you complete the browser verification step.

---

### Error: Build fails during deployment

**Cause**: Missing dependencies or build errors

**Check**:
```bash
# Test build locally first
npm run build
```

If local build fails, fix errors before deploying.

---

## 📊 VERIFICATION CHECKLIST

After deployment completes:

**1. Check Deployment URL**
```
Vercel should output: https://your-project.vercel.app
Open this in your browser
```

**2. DevTools → Sources**
```
Press F12 → Sources tab
Press Ctrl+Shift+F (Cmd+Opt+F on Mac)
Search for: "ritualfin-api.onrender.com"
Expected: ✅ Found in built JavaScript
```

**3. DevTools → Network**
```
Press F12 → Network tab
Filter: "login"
Attempt login
Click on POST request
Expected URL: https://ritualfin-api.onrender.com/api/auth/login
Expected Status: 200 or 401 (NOT 404)
```

**4. Login Works**
```
Enter credentials
Click Login
Expected: ✅ Redirect to dashboard, no errors
```

---

## ❌ IF DEPLOYMENT STILL FAILS

### Last Resort: Create New Vercel Project

1. Go to: https://vercel.com/new
2. Import Git Repository
3. Select: Viniciussteigleder/RitualFin_replit
4. Configure:
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`
5. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://ritualfin-api.onrender.com`
   - Environments: All (Production, Preview, Development)
6. Click **Deploy**
7. Wait 2-3 minutes
8. Test as above

---

## 🆘 SUPPORT

**If all else fails, you can**:
1. Share the exact error message from Vercel CLI
2. Share screenshot of Vercel dashboard → Settings → Git
3. Verify GitHub repository is public or Vercel has access

---

## ✅ EXPECTED SUCCESS OUTPUT

```bash
$ vercel --prod --yes

🔍  Inspect: https://vercel.com/...
✅  Production: https://ritual-fin-replit.vercel.app [2m 34s]

📝  Deployed to production. Run `vercel --prod` to overwrite later.
💡  To change the domain or build command, go to https://vercel.com/...
```

After seeing this:
1. Open production URL
2. Run verification checklist
3. Confirm login works

---

**START NOW WITH STEP 1 ABOVE**
