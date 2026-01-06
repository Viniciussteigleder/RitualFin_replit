# Production Database Connectivity Fix

## Problem

RitualFin backend deployed on Render was experiencing database connectivity failures when connecting to Supabase PostgreSQL with the error:

```
connect ENETUNREACH 2a05:d018:135e:1609:eafb:13ce:8b0c:1dff:5432 - Local (:::0)
```

## Root Cause

1. **IPv6 Network Limitation**: Render's infrastructure does not support IPv6 egress connections
2. **DNS Resolution Order**: Node.js DNS resolver returns IPv6 addresses (AAAA records) before IPv4 addresses (A records) by default
3. **Connection Attempt**: PostgreSQL client (`pg`) attempts to connect to the first DNS result (IPv6), which fails with ENETUNREACH on Render

## Solution

The fix uses an **aggressive pre-resolution strategy** to force IPv4 connections:

### Bootstrap DNS Pre-Resolution (Primary Fix)

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

  // Resolve using dns.resolve4 (IPv4 A records only)
  const addresses = await dnsPromises.resolve4(hostname);
  const ipv4 = addresses[0];

  // Replace hostname with IPv4 address in DATABASE_URL
  url.hostname = ipv4;
  process.env.DATABASE_URL = url.toString();
  console.log(`✓ Resolved ${hostname} → ${ipv4}`);
}

// Now launch the server with IPv4-resolved DATABASE_URL
require("./dist/index.cjs");
```

**Why it works**:
1. Uses `dns.resolve4()` which **only** returns IPv4 addresses (A records), never IPv6
2. Replaces the hostname in `DATABASE_URL` with the resolved IPv4 address
3. PostgreSQL pool connects directly to the IPv4 address, bypassing DNS entirely
4. Runs before any server code, ensuring no race conditions

### Database Pool Configuration

**File**: `server/db.ts`

The database pool now uses the pre-resolved IPv4 address from `DATABASE_URL`:

```typescript
export const pool = isDatabaseConfigured
  ? new Pool({
      connectionString: process.env.DATABASE_URL, // Already contains IPv4 address
      ssl: { rejectUnauthorized: true },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : null;
```

### Runtime DNS Preference (Defense in Depth)

**File**: `server/index.ts`

Sets DNS order preference at runtime (additional safety layer):

```typescript
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
```

## Required Environment Variables

### Backend (Render)

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | `postgresql://postgres:***@db.xyz.supabase.co:5432/postgres?sslmode=require` | Direct connection to Supabase (port 5432, NOT 6543 pooler) |
| `ADMIN_API_KEY` | Yes | `your-secure-random-key-here` | Protects diagnostic endpoint |
| `NODE_ENV` | Yes | `production` | Environment identifier |
| `SESSION_SECRET` | Yes | `32+-char-random-string` | Session encryption |
| `CORS_ORIGIN` | Yes | `https://ritualfin.vercel.app` | Frontend URL for CORS |

**Important**: Use Supabase's **direct connection** (port 5432), NOT the transaction pooler (port 6543). Render blocks the pooler port.

## Diagnostic Endpoint

### `/api/admin/db-ping`

Protected endpoint for testing database connectivity without shell access.

**Request**:
```bash
curl -H "x-admin-key: YOUR_ADMIN_API_KEY" \
  https://your-app.onrender.com/api/admin/db-ping
```

**Success Response**:
```json
{
  "ok": true,
  "elapsed_ms": 42,
  "db": "reachable",
  "timestamp": "2026-01-05T10:30:00.000Z"
}
```

**Failure Response**:
```json
{
  "ok": false,
  "elapsed_ms": 10000,
  "db": "unreachable",
  "code": "ENETUNREACH",
  "message": "connect ENETUNREACH ...",
  "timestamp": "2026-01-05T10:30:00.000Z"
}
```

**Security**: Returns 403 if `x-admin-key` header doesn't match `ADMIN_API_KEY` environment variable.

## Startup Logging

On successful startup, the application logs show the DNS resolution and sanity check:

### Bootstrap Phase (First)
```
DNS order: ipv4first (bootstrap)
✓ Resolved db.rmbcplfvucvukiekvtxb.supabase.co → 54.247.26.119
✓ DATABASE_URL updated to use IPv4 address
```

### Application Startup (Second)
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

**What to check**:
1. **Bootstrap logs show IPv4 resolution**: `✓ Resolved [hostname] → [IPv4 address]`
2. **No IPv6 addresses**: The resolved IP should be four dot-separated numbers (e.g., `54.247.26.119`), NOT colons
3. `DNS Resolution Order` shows `ipv4first (forced)`
4. `DATABASE_URL configured` is `true`
5. `Session Store` shows `PostgreSQL` in production

**If DNS resolution fails**:
- Bootstrap will log: `✗ Failed to resolve DATABASE_URL hostname: [error]`
- Server will proceed with original hostname (may still fail with ENETUNREACH)
- Check that Render can reach public DNS servers

## Testing Steps

1. **Deploy to Render** with all required environment variables
2. **Check startup logs** for sanity check output
3. **Test diagnostic endpoint**:
   ```bash
   curl -H "x-admin-key: $ADMIN_API_KEY" \
     https://your-app.onrender.com/api/admin/db-ping
   ```
4. **Verify response** shows `"ok": true` and `"db": "reachable"`
5. **Test actual application** by uploading a CSV file

## Additional Improvements

### Session Store Fix

Replaced MemoryStore with `connect-pg-simple` for production sessions:

```typescript
const sessionStore = isDatabaseConfigured && pool
  ? new PgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true
    })
  : undefined;
```

**Benefits**:
- No more production warnings
- Sessions persist across server restarts
- Auto-creates `session` table if missing

### Enhanced Error Handling

Improved error middleware to include:
- Error codes (`ENETUNREACH`, `ETIMEDOUT`, etc.)
- Safe error messages (strips `DATABASE_URL` and passwords)
- Timestamp for correlation
- Stack traces in development only

## Troubleshooting

### Error: "Database connection failed"

1. **Check DATABASE_URL format**: Must use port 5432 (direct), not 6543 (pooler)
2. **Verify DNS forcing**: Check startup logs for `ipv4first (forced)`
3. **Test connectivity**: Use `/api/admin/db-ping` endpoint
4. **Check Supabase**: Verify database is running and accessible

### Error: "Session table missing"

- **Auto-fixes on startup**: `connect-pg-simple` creates table automatically
- **Manual fix**: Run `CREATE TABLE session (...)` - see connect-pg-simple docs

### Error: "CORS error from frontend"

- **Check CORS_ORIGIN**: Must match your Vercel frontend URL exactly
- **Include protocol**: Use `https://ritualfin.vercel.app`, not `ritualfin.vercel.app`

## References

- [Render IPv6 Networking](https://render.com/docs/ipv6)
- [Node.js DNS Module](https://nodejs.org/api/dns.html#dnssetdefaultresultorderorder)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [connect-pg-simple](https://www.npmjs.com/package/connect-pg-simple)
