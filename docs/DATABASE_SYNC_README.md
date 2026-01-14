# Database Sync Tools - Quick Reference

## 🎯 Quick Commands

### Compare Databases
```bash
npm run db:compare
```
Shows side-by-side comparison of local vs production data.

### Sync Local to Production
```bash
npm run db:sync-to-prod
```
Replaces ALL production data with local data (requires confirmation).

## 📊 Current Status

✅ **Databases are in sync!**

Both local and production contain:
- 1 user
- 3 accounts  
- 187 rules
- 919 transactions
- 190 taxonomy items
- 13 app categories

## 📚 Documentation

- **[DATABASE_SYNC_GUIDE.md](./DATABASE_SYNC_GUIDE.md)** - Complete usage guide
- **[DATABASE_SYNC_IMPLEMENTATION.md](./DATABASE_SYNC_IMPLEMENTATION.md)** - Implementation details

## ⚠️ Important Notes

1. **Sync is destructive** - it deletes all production data first
2. **Always compare first** - run `npm run db:compare` before syncing
3. **Requires confirmation** - you must type "yes" to proceed
4. **Backup recommended** - use Neon's backup features before syncing

## 🔧 Scripts Location

- `scripts/compare-databases.ts` - Comparison tool
- `scripts/sync-local-to-production.ts` - Sync tool

## 🌐 Production URL

https://ritual-fin-replit.vercel.app
