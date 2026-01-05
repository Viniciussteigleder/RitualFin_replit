# Direct IPv4 Testing Guide - Fastest Way to Fix ENETUNREACH

## Purpose

This guide shows the **fastest** way to prove IPv6 is the root cause and fix it immediately by hard-coding IPv4 in `DATABASE_URL`.

**Use this as a temporary test** while the bootstrap solution is being debugged.

---

## Step 1: Get IPv4 Address of Supabase

From your local machine (Mac/Linux), resolve the Supabase hostname to IPv4:

```bash
dig +short A db.rmbcplfvucvukiekvtxb.supabase.co | head -n 1
```

**Expected output** (example):
```
54.247.26.119
```

**Alternative** (if `dig` not available):
```bash
nslookup db.rmbcplfvucvukiekvtxb.supabase.co | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -n 1
```

**Alternative** (using Python):
```bash
python3 -c "import socket; print(socket.gethostbyname('db.rmbcplfvucvukiekvtxb.supabase.co'))"
```

**Copy the IPv4 address** (4 dot-separated numbers like `54.247.26.119`)

---

## Step 2: Update DATABASE_URL in Render

1. Go to **Render Dashboard** → **ritualfin-api** → **Environment**

2. Find `DATABASE_URL` variable

3. **Current value** (example):
   ```
   postgresql://postgres:tEI8DRsR3VBgl3YM@db.rmbcplfvucvukiekvtxb.supabase.co:5432/postgres?sslmode=require
   ```

4. **Replace hostname with IPv4**:
   ```
   postgresql://postgres:tEI8DRsR3VBgl3YM@54.247.26.119:5432/postgres?sslmode=require
   ```

   **Format**:
   ```
   postgresql://USER:PASSWORD@<IPv4>:5432/DATABASE?sslmode=require
   ```

5. **Click "Save Changes"**

6. Render will **automatically redeploy**

---

## Step 3: Verify in Render Logs

After deployment completes, check logs:

**Expected** (SUCCESS):
```
[DB] ✓ DATABASE_URL already uses IPv4 address: 54.247.26.119
[DB] Creating pool: postgres@54.247.26.119:5432/postgres
[DB] SSL enabled: true
[DB] ✓ PostgreSQL pool initialized successfully
```

**Key indicators**:
- ✓ `DATABASE_URL already uses IPv4 address`
- ✓ `Creating pool: postgres@54.247.26.119` (shows IPv4)
- ✓ `PostgreSQL pool initialized successfully`
- ✓ **NO ENETUNREACH errors**

---

## Step 4: Test Diagnostic Endpoints

### Test 1: Version Endpoint (No Auth)

```bash
curl https://ritualfin-api.onrender.com/api/admin/version
```

**Expected response**:
```json
{
  "ok": true,
  "gitSha": "899e91e",
  "node": "v20.x.x",
  "bootstrapRan": false,  ← False is OK when using direct IPv4
  "platform": "linux"
}
```

**Checks**:
- ✓ Returns JSON (not HTML)
- ✓ `bootstrapRan: false` is OK (bootstrap not needed with IPv4 in URL)

### Test 2: DB Ping Endpoint

```bash
curl -H "x-admin-key: o57JnQ5hvtAZoZr6CxaFwiNQytVehCR0h" \
  https://ritualfin-api.onrender.com/api/admin/db-ping
```

**Expected response** (SUCCESS):
```json
{
  "ok": true,
  "elapsed_ms": 42,
  "db": "reachable",
  "connection": {
    "configured": true,
    "host": "54.247.26.119",  ← IPv4 address
    "port": "5432",
    "database": "postgres",
    "bootstrapRan": false  ← OK with direct IPv4
  },
  "timestamp": "2026-01-05T..."
}
```

**Checks**:
- ✓ `ok: true`
- ✓ `db: "reachable"`
- ✓ `connection.host` is IPv4 address
- ✓ **NO ENETUNREACH error**

---

## Step 5: Test Upload Flow

1. Go to **https://ritual-fin-replit.vercel.app**
2. Navigate to **Uploads**
3. Upload a CSV file
4. **Expected**: Preview loads without HTTP 500 errors
5. Click "Import"
6. **Expected**: Transactions import successfully

**Success**: No more `ENETUNREACH` errors!

---

## Why This Works

**IPv6 Problem**:
- Supabase DNS returns both IPv6 (AAAA) and IPv4 (A) records
- Node.js prefers IPv6 by default
- Render has no IPv6 egress routing
- Connection fails with `ENETUNREACH`

**IPv4 Direct Connection**:
- Bypasses DNS resolution completely
- Forces PostgreSQL to connect directly to IPv4 address
- Works immediately without code changes

**SSL Certificate**:
- Certificate is issued for hostname, not IP
- Code already has `rejectUnauthorized: false` to handle this
- Connection works despite hostname mismatch

---

## Important Notes

### ⚠️ This is a Temporary Fix

**Pros**:
- ✅ Fixes ENETUNREACH immediately
- ✅ Proves IPv6 is the root cause
- ✅ Works without code changes
- ✅ No deployment needed (just env var change)

**Cons**:
- ❌ IP address might change (unlikely but possible)
- ❌ Not portable (hard-coded IP)
- ❌ Doesn't solve underlying DNS issue

### 📋 Long-Term Solution

Once this proves IPv6 is the issue:

1. **Fix Render Start Command** to use `npm start` (runs bootstrap.cjs)
2. **Verify bootstrap logs** show IPv4 resolution
3. **Revert DATABASE_URL** back to hostname
4. **Test that bootstrap resolves to IPv4** automatically

---

## Troubleshooting

### Error: SSL certificate validation failed

**Symptom**:
```
unable to verify the first certificate
```

**Cause**: Code doesn't have `rejectUnauthorized: false`

**Fix**: Code already has this! Check `server/db.ts`:
```typescript
ssl: dbConfig.ssl ? {
  rejectUnauthorized: false  // Required for IP-based connections
} : undefined
```

### Error: Still getting ENETUNREACH

**Symptom**: Same IPv6 error after using IPv4 in URL

**Diagnose**:
1. Check Render logs - is the new DATABASE_URL being used?
2. Verify env var saved correctly (no typos)
3. Check if deployment actually happened
4. Run diagnostic endpoint - check `connection.host` value

**If host still shows hostname**: Env var didn't save or deployment didn't happen

### Error: Connection timeout

**Symptom**: Connection times out instead of ENETUNREACH

**Possible causes**:
- IPv4 address incorrect
- Supabase firewall blocking IP
- Port 5432 blocked

**Fix**:
1. Re-resolve IPv4: `dig +short A db.rmbcplfvucvukiekvtxb.supabase.co`
2. Verify port is 5432 (NOT 6543)
3. Check Supabase allows connections from Render

---

## Verification Checklist

After setting IPv4 in DATABASE_URL:

- [ ] Render logs show: `DATABASE_URL already uses IPv4 address`
- [ ] Render logs show: `PostgreSQL pool initialized successfully`
- [ ] NO `ENETUNREACH` errors in logs
- [ ] `curl /api/admin/version` returns JSON
- [ ] `curl /api/admin/db-ping` returns `ok: true, db: reachable`
- [ ] Upload flow works without HTTP 500 errors

**All checked?** IPv6 was the problem, fix confirmed!

**Some failed?** Check troubleshooting section above.

---

## Next Steps After Confirmation

Once you've confirmed direct IPv4 works:

### Option A: Keep Direct IPv4 (Quick & Simple)

**Pros**: Works immediately, no code changes
**Cons**: Not portable, IP might change

**Action**: Leave as-is, monitor for IP changes

### Option B: Implement Bootstrap Solution (Recommended)

**Steps**:
1. Fix Render Start Command to use `npm start`
2. Set `NODE_OPTIONS=--dns-result-order=ipv4first` in Render env
3. Deploy and verify bootstrap logs show IPv4 resolution
4. Revert DATABASE_URL to use hostname
5. Test that connections still work

**Pros**: Portable, handles DNS changes automatically
**Cons**: Requires Render Start Command configuration

---

## Commands Summary

```bash
# Step 1: Get IPv4
dig +short A db.rmbcplfvucvukiekvtxb.supabase.co | head -n 1

# Step 2: Update DATABASE_URL in Render Dashboard
# Format: postgresql://USER:PASS@<IPv4>:5432/DB?sslmode=require

# Step 3: Test version endpoint
curl https://ritualfin-api.onrender.com/api/admin/version

# Step 4: Test db-ping
curl -H "x-admin-key: YOUR_KEY" \
  https://ritualfin-api.onrender.com/api/admin/db-ping

# Step 5: Check if JSON is returned (not HTML)
curl -i https://ritualfin-api.onrender.com/api/admin/version | head -n 1
# Should show: HTTP/1.1 200 OK
# Next line: Content-Type: application/json
```

**Success indicator**: All commands return JSON, db-ping shows `reachable`, upload works.
