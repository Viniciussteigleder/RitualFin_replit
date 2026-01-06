# ⚠️ SUPABASE NO LONGER USED

**IMPORTANT**: This project has been migrated away from Supabase to Render PostgreSQL.

## Migration Summary

**Date**: January 2026  
**Reason**: IPv6 connectivity issues from Render backend to Supabase  
**Migration**: Supabase PostgreSQL → Render PostgreSQL

## Why We Stopped Using Supabase

Supabase's infrastructure returns IPv6 addresses for connection pooler endpoints (`pooler.supabase.com:6543`), which caused `ENETUNREACH` errors when connecting from Render's backend servers. While Supabase offers an IPv4 add-on plan, we decided to simplify the infrastructure by using Render PostgreSQL instead, which natively supports IPv4 connections.

## Current Database Setup

**Provider**: Render PostgreSQL  
**Connection**: Internal Database URL (PostgreSQL 16+)  
**Port**: 5432 (standard PostgreSQL, NOT 6543)  
**Access**: Internal Render network + external access for migrations

## Environment Variables

### Development
```bash
DATABASE_URL=postgresql://user:password@hostname.render.com:5432/database
```

### Production (Render Backend)
```bash
# Use Internal Database URL from Render Dashboard
DATABASE_URL=postgresql://...@...internal.render.com:5432/database
```

### Vercel Frontend
Vercel does NOT need DATABASE_URL. The frontend calls the backend API hosted on Render.

```bash
# Vercel environment variables
VITE_API_URL=https://your-backend.onrender.com
```

## What Changed

### Removed
- ❌ All Supabase references in code
- ❌ Supabase connection pooler (port 6543)
- ❌ IPv6 workarounds and DNS resolution hacks
- ❌ Supabase-specific connection strings

### Added
- ✅ Render PostgreSQL (standard port 5432)
- ✅ Native IPv4 support
- ✅ Internal Render network connections
- ✅ Simplified database configuration

## Documentation Updates

The following files have been updated to reflect Render PostgreSQL:
- `.env.example` - Updated connection string format
- `docs/RENDER_POSTGRESQL_MIGRATION.md` - Migration guide
- `docs/DEPLOYMENT_GUIDE.md` - Deployment instructions
- `docs/NO_SUPABASE.md` - This file

## Old Documentation (DO NOT USE)

The following files contain outdated Supabase references and should NOT be followed:
- `DEPLOY_INSTRUCTIONS_SUPABASE.md` ❌
- `ROTATION_CHECKLIST.md` ❌ (Supabase credentials)
- `ROTATION_STATUS.md` ❌ (Supabase status)
- `docs/DIRECT_IPV4_TESTING.md` ❌ (Supabase IPv4 workarounds)
- `docs/CREDENTIAL_ROTATION_GUIDE.md` ❌ (Supabase credentials)

## Migration Checklist

If you're setting up this project:

### ✅ DO:
1. Use Render PostgreSQL (Internal Database URL)
2. Set `DATABASE_URL` with standard port 5432
3. Use `FRONTEND_URL` for OAuth redirects
4. Deploy backend to Render
5. Deploy frontend to Vercel
6. Configure CORS with Vercel URL

### ❌ DON'T:
1. Try to connect to Supabase
2. Use port 6543 (Supabase pooler)
3. Set up IPv6 workarounds
4. Follow old Supabase documentation
5. Add IPv4 add-on to Supabase

## Vercel Configuration

Vercel is configured for **frontend-only deployment**. It does NOT connect to the database directly.

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": null
}
```

### Vercel Environment Variables
```bash
# Required - points to Render backend
VITE_API_URL=https://your-backend.onrender.com

# NOT needed (backend handles this)
# DATABASE_URL=... ❌
```

## Render Configuration

Render hosts the backend API and connects to Render PostgreSQL.

### Render Environment Variables
```bash
# Required
DATABASE_URL=<Internal Database URL from Render>
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
SESSION_SECRET=<random 32+ chars>
NODE_ENV=production

# Optional
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
OPENAI_API_KEY=...
```

## Database Schema Management

Use Drizzle ORM with `drizzle-kit push` (NOT migrations):

```bash
# Local development
npm run db:push

# Production (via Render Shell)
npm run db:push
```

Schema is defined in `shared/schema.ts`.

## Support

If you have questions about the migration or need help setting up Render PostgreSQL, refer to:
- `docs/RENDER_POSTGRESQL_MIGRATION.md` - Full migration guide
- `docs/DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- `CLAUDE.md` - Project overview and commands

## Summary

**Supabase is no longer used in this project. All database operations use Render PostgreSQL with standard PostgreSQL connections (port 5432).**
