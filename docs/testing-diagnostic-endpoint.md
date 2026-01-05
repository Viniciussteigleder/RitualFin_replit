# Testing the Diagnostic Endpoint

## Problem with Your curl Command

Your curl command is missing a **space after the colon** in the header:

❌ **WRONG** (won't work):
```bash
curl -H "x-admin-key:o57JnQ5hvtAZoZr6CxaFwiNQytVehCR0h" https://your-app.onrender.com/api/admin/db-ping
```

✅ **CORRECT** (add space after colon):
```bash
curl -H "x-admin-key: o57JnQ5hvtAZoZr6CxaFwiNQytVehCR0h" https://ritualfin-api.onrender.com/api/admin/db-ping
```

## Steps to Test

### 1. Find Your Render URL

Go to your Render dashboard → ritualfin-api service → look for the URL (usually `https://ritualfin-api.onrender.com` or similar).

### 2. Test the Endpoint

Replace `ritualfin-api.onrender.com` with your actual Render URL:

```bash
curl -H "x-admin-key: o57JnQ5hvtAZoZr6CxaFwiNQytVehCR0h" https://YOUR-ACTUAL-URL.onrender.com/api/admin/db-ping
```

### 3. Expected Responses

**Success** (database reachable):
```json
{
  "ok": true,
  "elapsed_ms": 42,
  "db": "reachable",
  "timestamp": "2026-01-05T21:40:00.000Z"
}
```

**Failure** (database unreachable):
```json
{
  "ok": false,
  "elapsed_ms": 10000,
  "db": "unreachable",
  "code": "ENETUNREACH",
  "message": "connect ENETUNREACH 2a05:...",
  "timestamp": "2026-01-05T21:40:00.000Z"
}
```

**Forbidden** (wrong API key):
```json
{
  "ok": false,
  "error": "forbidden"
}
```

## Alternative: Test in Browser

1. Install a browser extension like "ModHeader" or "Simple Modify Headers"
2. Add header: `x-admin-key: o57JnQ5hvtAZoZr6CxaFwiNQytVehCR0h`
3. Navigate to: `https://YOUR-ACTUAL-URL.onrender.com/api/admin/db-ping`

## Check Render Logs

After deployment, check Render logs for the startup sanity check:

```
=== RitualFin Startup Sanity Check ===
Node Version: v20.x.x
Environment: production
DNS Resolution Order: ipv4first (forced)
DATABASE_URL configured: true
ADMIN_API_KEY configured: true
Session Store: PostgreSQL
CORS Origins: https://ritualfin.vercel.app
=====================================
```

**What to verify**:
- ✓ DNS Resolution Order shows `ipv4first (forced)`
- ✓ DATABASE_URL configured: `true`
- ✓ ADMIN_API_KEY configured: `true`
- ✓ Session Store shows `PostgreSQL` (not MemoryStore)

If you see these, the bootstrap is working correctly.
