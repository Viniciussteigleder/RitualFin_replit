# Database Sync Guide

## Overview

This guide explains how to sync your local database data to the Vercel production database.

## Prerequisites

Before syncing, ensure:

1. ✅ Your local database has all the data you want in production
2. ✅ You have run the seeding scripts locally:
   - `tsx scripts/seed-user.ts`
   - `tsx scripts/seed-transactions.ts`
   - `tsx scripts/seed-categories.ts`
3. ✅ Both `.env.local` and `.env.production.local` are configured with correct database URLs
4. ✅ You have a backup of production data (if needed)

## What Gets Synced

The sync script will copy the following data from local to production:

- **Users** - All user accounts
- **Settings** - User preferences and settings
- **Accounts** - Bank accounts and financial accounts
- **Rules** - Classification rules and categories
- **Transactions** - All financial transactions
- **Taxonomy** - Category taxonomy (Level 1, Level 2, Leaf)
- **App Categories** - UI layer categories

## How to Sync

### Step 1: Verify Local Data

First, check what data exists in your local database:

```bash
# Check users
tsx scripts/check-users.ts

# Check database health
tsx scripts/test-db-health.ts
```

### Step 2: Run the Sync Script

⚠️ **WARNING**: This will **DELETE ALL DATA** in production and replace it with local data!

```bash
npm run db:sync-to-prod
```

Or directly:

```bash
tsx scripts/sync-local-to-production.ts
```

### Step 3: Verify Production Data

After syncing, verify the production database:

1. Visit your Vercel deployment: https://ritual-fin-replit.vercel.app
2. Log in with your credentials
3. Check that all transactions and categories are present

## Environment Files

### `.env.local` (Local Development)
```env
DATABASE_URL="postgresql://[local-connection-string]"
```

### `.env.production.local` (Production/Vercel)
```env
DATABASE_URL="postgresql://[production-connection-string]"
```

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Check that both environment files have valid `DATABASE_URL`
2. Ensure Neon databases are accessible
3. Verify WebSocket connections are allowed

### Data Not Appearing

If data doesn't appear after sync:

1. Check the console output for errors
2. Verify foreign key relationships are intact
3. Run the sync script again

### Rollback

If you need to rollback:

1. You should have a database backup before syncing
2. Use Neon's point-in-time recovery feature
3. Or re-run your seeding scripts on production

## Manual Seeding (Alternative)

If you prefer to seed production directly instead of syncing:

```bash
# Set environment to production
export NODE_ENV=production

# Run seeding scripts with production env
tsx scripts/seed-user.ts
tsx scripts/seed-transactions.ts
tsx scripts/seed-categories.ts
```

Make sure your scripts load `.env.production.local` when in production mode.

## Best Practices

1. **Always backup** production data before syncing
2. **Test locally first** - ensure local data is correct
3. **Sync during low-traffic times** to minimize user impact
4. **Verify immediately** after syncing
5. **Monitor logs** for any errors or issues

## Script Details

The sync script (`scripts/sync-local-to-production.ts`):

1. Connects to local database (`.env.local`)
2. Exports all data to memory
3. Connects to production database (`.env.production.local`)
4. Clears all production data (preserving schema)
5. Imports local data to production
6. Maintains referential integrity by importing in correct order

## Support

If you encounter issues:

1. Check the script output for specific error messages
2. Verify database connection strings
3. Ensure all dependencies are installed (`npm install`)
4. Check Neon database status and quotas
