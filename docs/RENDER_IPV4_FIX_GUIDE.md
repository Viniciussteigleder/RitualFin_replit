# Production Database Connectivity Fix - Complete Guide

## Problem

RitualFin backend deployed on Render experiences database connectivity failures with error:

```
connect ENETUNREACH 2a05:d018:135e:1609:eafb:13ce:8b0c:1dff:5432 - Local (:::0)
```

**Impact**: All database operations fail - `/api/settings`, `/api/uploads`, `/api/uploads/process` return HTTP 500.

## Root Cause

1. **IPv6 Network Limitation**: Render's infrastructure does not support IPv6 egress connections
2. **DNS Resolution Order**: Node.js DNS resolver returns IPv6 addresses (AAAA records) before IPv4 addresses (A records) by default
3. **Connection Attempt**: PostgreSQL client (`pg`) attempts to connect to the first DNS result (IPv6), which fails with ENETUNREACH on Render
4. **Bootstrap Not Running**: Render logs show `node dist/index.cjs` executing instead of `npm start`, bypassing the IPv4 resolution in `bootstrap.cjs`

## Solution - Dual-Layer IPv4 Enforcement

### Layer 1: Bootstrap IPv4 Pre-Resolution (PRIMARY FIX)

**File**: `bootstrap.cjs` (repo root)

The bootstrap file resolves the `DATABASE_URL` hostname to an IPv4 address **before** the server starts:

```javascript
const dns = require("node:dns");
const dnsPromises = require("node:dns/promises");

// Set DNS order preference
dns.setDefaultResultOrder("ipv4first");

// Pre-resolve DATABASE_URL hostname to IPv4
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  const hostname = url.hostname;

  // Use dns.lookup with family: 4 (most reliable IPv4 enforcement)
  const { address, family } = await dnsPromises.lookup(hostname, { family: 4 });

  console.log(`[BOOTSTRAP] ✓ Resolved ${hostname} → ${address} (family: ${family})`);

  // Replace hostname with IPv4 address in DATABASE_URL
  url.hostname = address;
  process.env.DATABASE_URL = url.toString();

  // Mark that bootstrap ran successfully
  process.env.BOOTSTRAP_IPV4_RESOLVED = "true";
}

// Now launch the server
require("./dist/index.cjs");
```

**Why it works**:
1. Uses `dns.lookup(family: 4)` which **forces** IPv4 resolution (never returns IPv6)
2. Replaces the hostname in `DATABASE_URL` with the resolved IPv4 address
3. PostgreSQL pool connects directly to the IPv4 address, bypassing DNS entirely
4. Runs before any server code, ensuring no race conditions
5. Sets flag so server can verify bootstrap ran

### Layer 2: Hardened Database Connection (FALLBACK)

**File**: `server/db.ts`

If bootstrap doesn't run (Render Start Command misconfigured), the database layer provides fallback protection:

```typescript
// Parse DATABASE_URL into components
const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

// Check if bootstrap ran
const bootstrapRan = process.env.BOOTSTRAP_IPV4_RESOLVED === "true";

if (!bootstrapRan) {
  console.warn(`[DB] ⚠️  Bootstrap did NOT run - using hostname: ${dbConfig.host}`);
  console.warn(`[DB] ⚠️  Connection may fail with ENETUNREACH on Render`);
  console.warn(`[DB] ⚠️  Ensure Render Start Command is: npm start`);
}

// Create pool with explicit fields (not just connectionString)
const pool = new Pool({
  user: dbConfig.user,
  password: dbConfig.password,
  host: dbConfig.host, // IPv4 if bootstrap ran, hostname if not
  port: dbConfig.port,
  database: dbConfig.database,
  ssl: { rejectUnauthorized: false } // Required for IP-based connections
});
```

**Why explicit fields matter**: Using explicit `host`, `port`, `user`, `password` instead of `connectionString` alone bypasses some of pg's internal DNS logic that might prefer IPv6.

### Layer 3: Enhanced Diagnostic Endpoint (VERIFICATION)

**Endpoint**: `GET /api/admin/db-ping`

Returns detailed connection information for debugging:

```bash
curl -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  https://ritualfin-api.onrender.com/api/admin/db-ping
```

**Success Response**:
```json
{
  "ok": true,
  "elapsed_ms": 42,
  "db": "reachable",
  "connection": {
    "configured": true,
    "host": "54.247.26.119",
    "port": "5432",
    "database": "postgres",
    "bootstrapRan": true
  },
  "timestamp": "2026-01-05T22:00:00.000Z"
}
```

**Failure Response** (shows what went wrong):
```json
{
  "ok": false,
  "elapsed_ms": 10000,
  "db": "unreachable",
  "code": "ENETUNREACH",
  "message": "connect ENETUNREACH 2a05:...:5432",
  "connection": {
    "configured": true,
    "host": "db.rmbcplfvucvukiekvtxb.supabase.co",
    "port": "5432",
    "database": "postgres",
    "bootstrapRan": false
  },
  "timestamp": "2026-01-05T22:00:00.000Z"
}
```

**Key indicators**:
- `host` shows if IPv4 address is being used (4 numbers) or hostname (FQDN)
- `bootstrapRan: false` means bootstrap.cjs didn't execute
- `bootstrapRan: true` + hostname in `host` means DNS resolution failed in bootstrap

## Required Configuration

### 1. Render Start Command (CRITICAL)

**Navigate to**: Render Dashboard → Your Service → Settings → Build & Deploy

**Set Start Command to**:
```bash
npm start
```

**OR**:
```bash
node bootstrap.cjs
```

**DO NOT USE**:
```bash
node dist/index.cjs
```
(This bypasses bootstrap and the fix won't work!)

### 2. Environment Variables

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | `postgresql://postgres:***@db.xyz.supabase.co:5432/postgres?sslmode=require` | Supabase connection string (port 5432, NOT 6543) |
| `ADMIN_API_KEY` | Yes | `your-secure-random-key-32chars+` | Protects diagnostic endpoint |
| `NODE_ENV` | Yes | `production` | Environment identifier |
| `SESSION_SECRET` | Yes | `your-session-secret-32chars+` | Session encryption |
| `CORS_ORIGIN` | Yes | `https://ritualfin.vercel.app` | Frontend URL for CORS |
| `NODE_OPTIONS` | Recommended | `--dns-result-order=ipv4first` | Additional DNS enforcement |

**Important Notes**:
- Use Supabase's **direct connection** (port 5432), NOT the transaction pooler (port 6543)
- `NODE_OPTIONS` provides platform-level DNS enforcement (defense in depth)

## Verification Checklist

### Step 1: Check Render Logs (After Deployment)

**Success indicators** (all must be present):

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
╔══════════════════════════════════════════════════════════════╗
║                 Starting Application Server                  ║
╚══════════════════════════════════════════════════════════════╝
[DB] ✓ Bootstrap resolved hostname to IPv4: 54.247.26.119
[DB] Creating pool: postgres@54.247.26.119:5432/postgres
[DB] SSL enabled: true
[DB] ✓ PostgreSQL pool initialized successfully
```

**Failure indicators** (bootstrap didn't run):

```
[DB] ⚠️  WARNING: Bootstrap did NOT run or failed - using hostname: db.xxx.supabase.co
[DB] ⚠️  Connection may fail with ENETUNREACH on Render (IPv6 not supported)
[DB] ⚠️  Ensure Render Start Command is: npm start (not node dist/index.cjs)
```

**What to verify**:
1. ✓ Bootstrap banner appears at the top
2. ✓ `Resolved ... → <IPv4>` shows a 4-number IP (NOT hostname with colons)
3. ✓ `family: 4` confirms IPv4 resolution
4. ✓ `Bootstrap resolved hostname to IPv4: <IP>` in DB logs
5. ✓ NO warnings about "Bootstrap did NOT run"

### Step 2: Test Diagnostic Endpoint

```bash
curl -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  https://ritualfin-api.onrender.com/api/admin/db-ping
```

**Expected response**:
```json
{
  "ok": true,
  "db": "reachable",
  "connection": {
    "host": "54.247.26.119",
    "bootstrapRan": true
  }
}
```

**Check**:
- `ok: true` → Database is reachable
- `host` is IPv4 address (e.g., `54.247.26.119`), NOT hostname
- `bootstrapRan: true` → Bootstrap executed successfully
- No `code: "ENETUNREACH"` error

### Step 3: Test Upload Flow (End-to-End)

1. Navigate to your frontend: `https://ritualfin.vercel.app`
2. Go to Uploads page
3. Upload a CSV file (Amex, Miles & More, or Sparkasse format)
4. **Success**: Preview loads, transactions appear
5. Click "Processar" to import
6. **Success**: Transactions import without HTTP 500 errors

## Troubleshooting

### Error: "Bootstrap did NOT run" in logs

**Cause**: Render Start Command is misconfigured

**Fix**:
1. Go to Render → Service → Settings → Build & Deploy
2. Delete any custom Start Command OR set it to: `npm start`
3. Click "Save Changes"
4. Trigger manual deploy

**Verify**: Next deployment should show bootstrap banner in logs

### Error: Still seeing IPv6 address in ENETUNREACH

**Symptoms**:
```
connect ENETUNREACH 2a05:d018:... (colons in address = IPv6)
```

**Diagnose**:
```bash
curl -H "x-admin-key: $ADMIN_API_KEY" \
  https://ritualfin-api.onrender.com/api/admin/db-ping
```

Check response:
- If `bootstrapRan: false` → Start Command issue (see above)
- If `bootstrapRan: true` but `host` is hostname → DNS resolution failed (check Render can reach DNS servers)
- If `host` is IPv4 but error persists → Network issue (contact Render support)

### Error: SSL certificate validation failed

**Symptoms**:
```
unable to verify the first certificate
```

**Cause**: Connecting to IPv4 address with hostname-based SSL certificate

**Fix**: Already implemented! Check `server/db.ts` has:
```typescript
ssl: { rejectUnauthorized: false }
```

**Verify**: Should NOT occur with latest code

### Error: "database 'postgres' does not exist"

**Cause**: Wrong database name in DATABASE_URL

**Fix**:
1. Check DATABASE_URL has correct database name (usually `postgres`)
2. Example: `postgresql://user:pass@host:5432/postgres` (NOT `/db` or other)

## Success Criteria

✅ **All must be true**:

1. **Logs show bootstrap ran**:
   - `[BOOTSTRAP] ✓ Resolved ... → <IPv4>`
   - IPv4 is 4 dot-separated numbers (e.g., `54.247.26.119`)
   - NO colons in the IP address

2. **Diagnostic endpoint returns success**:
   ```bash
   curl -H "x-admin-key: $KEY" https://ritualfin-api.onrender.com/api/admin/db-ping
   # {"ok": true, "db": "reachable", "connection": {"host": "54.x.x.x", "bootstrapRan": true}}
   ```

3. **Upload flow works end-to-end**:
   - CSV preview loads
   - Transactions import successfully
   - NO HTTP 500 errors
   - NO ENETUNREACH errors in logs

4. **API endpoints respond**:
   - `GET /api/settings` → HTTP 200
   - `GET /api/uploads` → HTTP 200
   - `POST /api/uploads/process` → HTTP 200

## Additional Resources

- [Render IPv6 Networking Docs](https://render.com/docs/ipv6)
- [Node.js DNS Module](https://nodejs.org/api/dns.html#dnslookuphostname-options-callback)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [PostgreSQL SSL Modes](https://www.postgresql.org/docs/current/libpq-ssl.html)

## Need Help?

If the fix doesn't work:

1. **Check Render logs** for bootstrap banner and IPv4 resolution
2. **Test diagnostic endpoint** and share the full JSON response
3. **Verify Start Command** is `npm start` (not `node dist/index.cjs`)
4. **Confirm environment variables** are all set correctly
5. **Share diagnostic output**:
   ```bash
   curl -H "x-admin-key: $KEY" https://ritualfin-api.onrender.com/api/admin/db-ping | jq
   ```
