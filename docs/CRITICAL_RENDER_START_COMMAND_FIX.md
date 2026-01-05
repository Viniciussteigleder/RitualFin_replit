# ⚠️ CRITICAL: Bootstrap Not Running on Render

## Diagnostic Proof

Your `/api/admin/db-ping` endpoint confirms the issue:

```json
{
  "connection": {
    "host": "db.rmbcplfvucvukiekvtxb.supabase.co",  ← HOSTNAME (should be IPv4)
    "bootstrapRan": false  ← CRITICAL: bootstrap.cjs NOT running
  }
}
```

**This means**:
- ✗ Render is NOT running `node bootstrap.cjs`
- ✗ DNS resolution to IPv4 never happens
- ✗ PostgreSQL tries to connect to hostname
- ✗ DNS returns IPv6 address
- ✗ Connection fails with ENETUNREACH

## Root Cause

Render has a **custom Start Command** configured in the dashboard that overrides your `package.json`.

Even though `package.json` says:
```json
"start": "NODE_ENV=production node bootstrap.cjs"
```

Render is ignoring this and running something else (likely `node dist/index.cjs` directly).

## Fix Steps (5 Minutes)

### Step 1: Go to Render Dashboard

1. Log in to [https://dashboard.render.com](https://dashboard.render.com)
2. Click on your **ritualfin-api** service

### Step 2: Navigate to Settings

1. Click **"Settings"** in the left sidebar
2. Scroll down to **"Build & Deploy"** section

### Step 3: Check Start Command

Look for the **"Start Command"** field:

**If it shows**:
```
node dist/index.cjs
```

**Or**:
```
NODE_ENV=production node dist/index.cjs
```

**Or any other command** → This is the problem!

### Step 4: Fix Start Command

**Option A (Recommended)**: Delete the Start Command
1. Click "Edit" next to Start Command
2. **DELETE** all text in the field (leave it completely empty)
3. Click "Save Changes"
4. Render will now use `npm start` from package.json

**Option B (Alternative)**: Set Explicit Command
1. Click "Edit" next to Start Command
2. Replace with: `npm start`
3. Click "Save Changes"

**DO NOT USE**: `node dist/index.cjs` (this bypasses bootstrap)

### Step 5: Trigger Manual Deploy

1. Click **"Manual Deploy"** dropdown (top right)
2. Click **"Deploy latest commit"**
3. Wait for deployment to complete (2-3 minutes)

### Step 6: Verify Fix in Logs

After deployment completes, click **"Logs"** and check for the bootstrap banner at the START of the logs:

**✅ SUCCESS - You should see**:
```
╔══════════════════════════════════════════════════════════════╗
║              RitualFin Bootstrap - IPv4 Hardening            ║
╚══════════════════════════════════════════════════════════════╝
[BOOTSTRAP] DNS order preference: ipv4first
[BOOTSTRAP] Original DATABASE_URL hostname: db.rmbcplfvucvukiekvtxb.supabase.co:5432
[BOOTSTRAP] Resolving db.rmbcplfvucvukiekvtxb.supabase.co to IPv4...
[BOOTSTRAP] ✓ Resolved db.rmbcplfvucvukiekvtxb.supabase.co → 54.247.26.119 (family: 4)
[BOOTSTRAP] ✓ DATABASE_URL updated to use IPv4 address
[BOOTSTRAP] ✓ Connection will use: 54.247.26.119:5432
```

**✗ FAILURE - If you DON'T see the banner**:
- Bootstrap still isn't running
- Go back to Step 3 and verify Start Command is empty or set to `npm start`
- Check if there's a `render.yaml` file overriding the command

### Step 7: Test Diagnostic Endpoint Again

```bash
curl -H "x-admin-key: o57JnQ5hvtAZoZr6CxaFwiNQytVehCR0h" \
  https://ritualfin-api.onrender.com/api/admin/db-ping
```

**✅ Expected (SUCCESS)**:
```json
{
  "ok": true,
  "db": "reachable",
  "connection": {
    "host": "54.247.26.119",  ← IPv4 address
    "bootstrapRan": true      ← Bootstrap executed
  }
}
```

**✗ Still failing? Check**:
- `host` is IPv4 (4 numbers), not hostname
- `bootstrapRan: true`
- `ok: true` and `db: "reachable"`

### Step 8: Test Upload

1. Go to https://ritual-fin-replit.vercel.app
2. Navigate to Uploads
3. Upload CSV file
4. **Should work without HTTP 500 errors**

## Troubleshooting

### Q: I deleted Start Command but it's still failing

**A**: Check for `render.yaml` file:
1. In Render dashboard, go to Settings
2. Look for "Blueprint Instance"
3. If present, the `render.yaml` file in your repo might be overriding settings
4. Solution: Check if `render.yaml` exists in your repo root and update it

### Q: Logs don't show bootstrap banner

**A**: Render is still not running bootstrap. Try:
1. Set Start Command explicitly to: `npm start`
2. Save and redeploy
3. Check logs again from the very beginning (click "Logs" → scroll to top)

### Q: Bootstrap banner appears but still ENETUNREACH

**A**: Check what hostname it resolved to:
1. Look for line: `[BOOTSTRAP] ✓ Resolved ... → X.X.X.X`
2. If X.X.X.X is IPv4 (4 numbers) → DNS resolution worked
3. If still failing with IPv4 → Network issue, contact Render support
4. If not resolving → DNS issue, check DATABASE_URL is correct

### Q: How do I know if bootstrap is working?

**A**: Three checks:
1. **Logs**: Bootstrap banner appears at start
2. **Diagnostic endpoint**: `bootstrapRan: true` and `host` is IPv4
3. **Upload works**: No ENETUNREACH errors

## Additional Environment Variable (Optional)

Add this to Render environment variables as extra protection:

**Variable**: `NODE_OPTIONS`
**Value**: `--dns-result-order=ipv4first`

This provides platform-level DNS enforcement in addition to bootstrap.

## Summary

**The ONLY fix needed**: Make Render run `node bootstrap.cjs` instead of `node dist/index.cjs`.

**How**: Delete the custom Start Command in Render dashboard OR set it to `npm start`.

**Proof it works**: Diagnostic endpoint returns `bootstrapRan: true` and `host` is IPv4 address.

**Still not working?** Share:
1. Screenshot of Render Settings → Start Command field
2. First 50 lines of Render logs after deployment
3. Diagnostic endpoint response
