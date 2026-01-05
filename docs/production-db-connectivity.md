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

The fix implements a multi-layered approach to force IPv4 DNS resolution:

### 1. Bootstrap File (Primary Fix)

**File**: `bootstrap.cjs` (repo root)

Forces IPv4 DNS resolution BEFORE any application code runs:

```javascript
const dns = require("node:dns");
const order = process.env.DNS_RESULT_ORDER || "ipv4first";
dns.setDefaultResultOrder(order);
console.log(`DNS order: ${order} (bootstrap)`);
require("./dist/index.cjs");
```

**Why it works**: Ensures DNS preference is set before database connection pool initialization.

### 2. Database Pool Configuration (Defense in Depth)

**File**: `server/db.ts`

Added `family: 4` to PostgreSQL pool configuration:

```typescript
export const pool = isDatabaseConfigured
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      family: 4, // Force IPv4 connections
      ssl: { rejectUnauthorized: true },
      // ... other settings
    })
  : null;
```

### 3. Runtime DNS Forcing (Fallback)

**File**: `server/index.ts`

Sets DNS order at application startup (runs after bootstrap):

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

On successful startup, the application logs a sanity check:

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
- `DNS Resolution Order` must show `ipv4first (forced)`
- `DATABASE_URL configured` must be `true`
- `Session Store` should be `PostgreSQL` in production

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
