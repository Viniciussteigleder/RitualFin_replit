# Render PostgreSQL Migration

## Migration Date
January 6, 2026

## Background

RitualFin has migrated from Supabase to Render PostgreSQL for the production database.

### Reason for Migration

**IPv6 Connection Issues**: Supabase's infrastructure returns IPv6 addresses which caused persistent `ENETUNREACH` (Network unreachable) errors when connecting from Render's backend service.

While Supabase offers an IPv4 add-on plan, the decision was made to use Render's native PostgreSQL service instead, which provides IPv4 connectivity by default and better integration with the Render deployment environment.

## Architecture Change

### Before (Supabase)
```
┌──────────────┐         ┌─────────────────┐
│    Render    │ ──❌──> │    Supabase     │
│  (Backend)   │  IPv6   │  (PostgreSQL)   │
│              │  Error  │  EU-West-1      │
└──────────────┘         └─────────────────┘
```

### After (Render PostgreSQL)
```
┌──────────────┐         ┌─────────────────┐
│    Render    │ ──✅──> │     Render      │
│  (Backend)   │  IPv4   │  (PostgreSQL)   │
│  Web Service │  Local  │  Database       │
└──────────────┘         └─────────────────┘
```

## Current Setup

### Production Database
- **Provider**: Render PostgreSQL
- **Region**: Same region as backend (low latency)
- **Connection**: IPv4 native, no pooler needed
- **Plan**: Render PostgreSQL (Standard or above recommended)

### Environment Variables

**Render Backend Service:**
```bash
DATABASE_URL=postgresql://user:password@hostname:5432/database
NODE_ENV=production
SESSION_SECRET=<32+ character random string>
GOOGLE_CLIENT_ID=533925452264-pbd6qa1fi3uqr1gem94edpk0f0tsi17n.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
CORS_ORIGIN=https://your-frontend.vercel.app
OPENAI_API_KEY=<optional, for AI features>
```

## Database Schema

The database schema is managed via Drizzle ORM with schema defined in `shared/schema.ts`.

### Applying Schema Changes

```bash
# Push schema changes to Render PostgreSQL
npm run db:push
```

### Key Tables
- `users` - User accounts (with Google OAuth support)
- `transactions` - Financial transactions ledger
- `rules` - Categorization rules
- `uploads` - CSV import history
- `calendar_events` - Recurring commitments
- `goals` - Financial goals
- `budgets` - Monthly budgets
- `merchant_metadata` - Merchant aliases and icons
- `notifications` - User notifications
- And more...

## Migration Steps Completed

1. ✅ Created Render PostgreSQL database
2. ✅ Updated `DATABASE_URL` environment variable in Render
3. ✅ Pushed schema to new database (`npm run db:push`)
4. ✅ Seeded initial data from `/docs/Feedback_user`
5. ✅ Updated `.env.example` to reflect Render PostgreSQL
6. ✅ Removed IPv6/Supabase workarounds from codebase
7. ✅ Tested upload functionality

## Performance Improvements

### Benefits of Render PostgreSQL
- **No Network Issues**: Native IPv4 connectivity
- **Lower Latency**: Database in same data center as backend
- **Simpler Setup**: No connection pooler configuration needed
- **Better Integration**: Render's managed service with automatic backups
- **Cost Effective**: No need for IPv4 add-on plans

## Monitoring

### Health Checks
- Backend automatically checks database connection on startup
- Connection errors are logged with sanitized messages (no secrets exposed)
- Database status visible in Render dashboard

### Logs Location
```bash
# View backend logs
Render Dashboard > Web Service > Logs

# Database connection logs show:
[BOOTSTRAP] Database connection successful
DATABASE_URL configured: true
```

## Rollback Plan (If Needed)

If there's ever a need to switch databases:

1. Export data from current database:
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

2. Create new database (Supabase/other provider)

3. Import data:
   ```bash
   psql $NEW_DATABASE_URL < backup_YYYYMMDD.sql
   ```

4. Update `DATABASE_URL` in Render environment variables

5. Restart Render service

## Files Updated

### Configuration
- `.env.example` - Updated DATABASE_URL format and comments
- `docs/DEPLOYMENT_GUIDE.md` - Updated with Render PostgreSQL instructions
- `docs/RENDER_POSTGRESQL_MIGRATION.md` - This file

### Documentation (References Updated)
- `docs/DEPLOYMENT_ACTION_PLAN.md` - Note: Still references Supabase
- `docs/DEPLOYMENT_STATUS_2026-01-02.md` - Note: Still references Supabase
- `docs/SUPABASE_MIGRATION_PLAN.md` - Note: Deprecated, kept for reference
- `docs/RENDER_IPV4_FIX_GUIDE.md` - Note: Deprecated, IPv6 issues resolved

## Next Steps

1. ✅ Verify all uploads work correctly
2. ✅ Test Google OAuth authentication
3. ✅ Confirm all UI features work with new database
4. ⬜ Update old documentation to reflect Render PostgreSQL
5. ⬜ Set up automated database backups in Render

## Support

### Render PostgreSQL
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs/databases
- Support: support@render.com

### RitualFin Issues
- GitHub: https://github.com/Viniciussteigleder/RitualFin_replit/issues

---

**Last Updated**: January 6, 2026
**Migration Status**: ✅ Complete
**Database Provider**: Render PostgreSQL
**IPv6 Issues**: ✅ Resolved (using IPv4 native)
