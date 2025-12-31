# RitualFin - Supabase Migration Plan

**Created:** 2025-12-30
**Status:** Planning Phase
**Target:** Migrate from Replit DB to Supabase (Production)

---

## 1. Current Environment Analysis

### Database Setup

| Component | Current State | Target State |
|-----------|---------------|--------------|
| **Database** | Replit PostgreSQL (Dev) | Supabase PostgreSQL (Production) |
| **ORM** | Drizzle ORM | Drizzle ORM (No change) |
| **Schema Management** | `drizzle-kit push` | `drizzle-kit push` or Supabase migrations |
| **Connection** | DATABASE_URL (Replit) | DATABASE_URL (Supabase pooler) |
| **Auth** | Passport Local | Passport Local (Keep) or Supabase Auth |
| **Session Store** | In-memory (dev) | PostgreSQL (connect-pg-simple) |

### Schema Status

```typescript
// Current schema.ts status
✅ Tables: 20 tables (users, transactions, rules, uploads, accounts, etc.)
✅ Indexes: 5 critical performance indexes
✅ Constraints: 3 unique constraints
⚠️ Category1: Enum with 20 values (needs restructuring)
✅ Category2/3: Text fields (flexible, ready for hierarchy)
✅ Keywords: 1000+ documented (ready for import)
```

### Existing Migrations

```
migrations/
├── 001_add_critical_indexes.sql       ✅ Performance indexes
└── 002_add_unique_constraints.sql     ✅ Data integrity constraints
```

---

## 2. Migration Strategy Overview

### Phase 1: Database Setup (No Category Changes)
- ✅ Create Supabase project
- ✅ Export schema from Replit
- ✅ Import schema to Supabase
- ✅ Test connection
- ✅ Migrate existing data (users, transactions, rules)

### Phase 2: Category Restructuring (During Migration)
- ⚠️ **Option A:** Keep current Category1 enum (safe, backward compatible)
- ⚠️ **Option B:** Update Category1 enum to match proposal (requires data remapping)

### Phase 3: Application Update
- ✅ Update DATABASE_URL to Supabase connection string
- ✅ Enable PostgreSQL session store
- ✅ Test all endpoints
- ✅ Deploy to production

---

## 3. Category Migration Decision Matrix

### Option A: Keep Current Enum ✅ **RECOMMENDED**

**Approach:** Use application-layer mapping to bridge current enum to proposed structure

| Aspect | Details |
|--------|---------|
| **Database Changes** | None - keep current Category1 enum |
| **Application Changes** | Add mapping layer in code |
| **Data Migration** | Simple export/import, no remapping |
| **Risk Level** | ⭐ Low |
| **Downtime** | ~15 minutes |
| **Rollback** | Easy (just revert DATABASE_URL) |

**Implementation:**
```typescript
// config/categoryMapping.ts
export const categoryMapping = {
  // Current enum → Proposed structure
  "Alimentação": {
    level1: "Alimentação",
    subcategories: [
      "Supermercado e Mercearia",
      "Padaria e Café",
      "Restaurantes e Alimentação fora"
    ]
  },
  "Moradia": {
    level1: "Moradia",
    subcategories: [
      "Casa Olching",
      "Casa Karlsruhe",
      "Casa Esting"
    ]
  },
  // ... more mappings
}
```

### Option B: Update Enum 🔧 **FUTURE PHASE**

**Approach:** Migrate Category1 enum to match proposed 13-value structure

| Aspect | Details |
|--------|---------|
| **Database Changes** | Drop/recreate enum, update all references |
| **Application Changes** | Update schema.ts, regenerate types |
| **Data Migration** | Complex - remap all transactions and rules |
| **Risk Level** | ⭐⭐⭐ High |
| **Downtime** | ~2-4 hours |
| **Rollback** | Difficult (requires full backup restore) |

**Migration Script Required:**
```sql
-- 1. Create new enum
CREATE TYPE category_1_new AS ENUM (
  'Moradia',
  'Alimentação',
  'Compras & Estilo de Vida',
  'Mobilidade',
  'Saúde & Seguros',
  'Educação & Crianças',
  'Lazer & Viagens',
  'Interna',
  'Finanças & Transferências',
  'Trabalho & Receitas',
  'Doações & Outros',
  'Revisão & Não Classificado',
  'Outros'
);

-- 2. Migrate data (complex mapping logic)
-- ... see migration script below
```

---

## 4. Recommended Migration Path

### 🎯 Two-Phase Migration (Safe & Incremental)

#### **Phase 1: Infrastructure Migration** (Week 1)
- Migrate to Supabase with **current schema** (Option A)
- No category restructuring
- Minimal risk, fast rollback

#### **Phase 2: Category Restructuring** (Week 4+)
- After stable Supabase operation
- Implement Option B with proper testing
- Run data migration during low-traffic window

---

## 5. Phase 1 Migration Steps (Supabase Setup)

### Step 1: Create Supabase Project

```bash
# 1. Go to https://supabase.com/dashboard
# 2. Create new project
#    - Name: RitualFin
#    - Database Password: [STRONG PASSWORD]
#    - Region: Europe (Frankfurt) or nearest
# 3. Wait for provisioning (~2 minutes)
```

### Step 2: Get Supabase Connection Strings

After project creation, go to **Settings → Database**:

```bash
# Connection Pooler (Transaction Mode) - Use this for Drizzle
# Format:
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Direct Connection (for migrations)
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Step 3: Export Current Schema from Replit

```bash
# Option 1: Generate SQL from Drizzle schema
npx drizzle-kit generate

# Option 2: Use Drizzle push to new database (recommended)
# Just update DATABASE_URL and run:
npm run db:push
```

### Step 4: Apply Existing Migrations

```bash
# After schema is pushed, apply performance indexes
psql $DATABASE_URL -f migrations/001_add_critical_indexes.sql
psql $DATABASE_URL -f migrations/002_add_unique_constraints.sql
```

### Step 5: Export Data from Replit

```bash
# Export all tables to SQL dump
pg_dump $REPLIT_DATABASE_URL > replit_backup.sql

# Or export specific tables:
pg_dump $REPLIT_DATABASE_URL \
  -t users \
  -t transactions \
  -t rules \
  -t uploads \
  -t accounts \
  -t budgets \
  -t goals \
  > replit_data.sql
```

### Step 6: Import Data to Supabase

```bash
# Import data dump
psql $SUPABASE_DATABASE_URL < replit_data.sql

# Or use Supabase SQL Editor (Dashboard → SQL Editor)
# Paste and run the SQL dump
```

### Step 7: Update Application Configuration

```bash
# Update .env file
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Test connection
npm run check
npm run dev

# Test endpoints
curl http://localhost:5000/api/auth/me
curl http://localhost:5000/api/transactions
```

### Step 8: Enable PostgreSQL Session Store

Update `server/index.ts`:

```typescript
// Replace memorystore with connect-pg-simple
import connectPgSimple from 'connect-pg-simple';
const PgStore = connectPgSimple(session);

app.use(session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
}));
```

### Step 9: Smoke Test Checklist

```bash
# Test all critical endpoints
✅ GET /api/auth/me
✅ GET /api/transactions
✅ POST /api/uploads/process
✅ GET /api/rules
✅ GET /api/dashboard
✅ GET /api/accounts
✅ GET /api/transactions/confirm-queue

# Verify data integrity
✅ Transaction count matches
✅ Rules count matches
✅ Users can login
✅ CSV upload works
✅ Categorization works
```

### Step 10: Deploy to Production

```bash
# Update Vercel environment variables
VERCEL_ENV=production DATABASE_URL=postgresql://...

# Deploy
vercel --prod

# Monitor logs
vercel logs --follow
```

---

## 6. Phase 2 Migration Steps (Category Restructuring)

⚠️ **Only proceed after Phase 1 is stable for 2+ weeks**

### Prerequisites
- ✅ Backup database before starting
- ✅ Test migration on staging environment first
- ✅ Schedule during low-traffic window
- ✅ Have rollback plan ready

### Migration Script

See `/migrations/003_category_restructure.sql` (created below)

### Rollback Plan

```sql
-- If migration fails, restore from backup
psql $SUPABASE_DATABASE_URL < supabase_backup_pre_category_migration.sql
```

---

## 7. Supabase-Specific Features (Optional Enhancements)

### Row-Level Security (RLS)

Enable RLS for multi-tenant security:

```sql
-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY transactions_user_isolation ON transactions
  FOR ALL
  USING (user_id = auth.uid());
```

### Realtime Subscriptions (Future)

```typescript
// Listen for new transactions
supabase
  .from('transactions')
  .on('INSERT', payload => {
    console.log('New transaction:', payload.new);
  })
  .subscribe();
```

### Supabase Storage (Future - for CSV files)

```typescript
// Store uploaded CSV files
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`${userId}/${filename}`, file);
```

---

## 8. Cost Estimation

### Supabase Pricing (as of 2025)

| Plan | Cost | Includes | Suitable For |
|------|------|----------|--------------|
| **Free** | $0/month | 500MB DB, 1GB bandwidth | Testing only |
| **Pro** | $25/month | 8GB DB, 50GB bandwidth, daily backups | **Recommended for production** |
| **Team** | $599/month | 100GB DB, 250GB bandwidth | Enterprise scale |

**Recommended:** Start with **Pro plan** ($25/month)

### Expected Usage (Based on Your Data)

- **Database Size:** ~500MB (estimated for 1 year of transactions)
- **Bandwidth:** ~5GB/month (CSV uploads + API calls)
- **Concurrent Connections:** ~10 (pooler handles this)

---

## 9. Pre-Migration Checklist

### Before Starting

- [ ] **Backup Replit database** (`pg_dump` to file)
- [ ] **Document current DATABASE_URL** (in case rollback needed)
- [ ] **Create Supabase project** (Pro plan recommended)
- [ ] **Test connection** from local environment
- [ ] **Export schema** using `drizzle-kit push`
- [ ] **Apply migrations** (indexes, constraints)
- [ ] **Export data** from Replit
- [ ] **Import data** to Supabase
- [ ] **Test all endpoints** on Supabase
- [ ] **Update .env** locally
- [ ] **Test full workflow** (upload CSV → categorize → confirm)
- [ ] **Update Vercel env vars** for production
- [ ] **Deploy** and monitor

### Post-Migration

- [ ] **Verify transaction counts** match
- [ ] **Test CSV upload** end-to-end
- [ ] **Test categorization** rules work
- [ ] **Monitor performance** (query times, errors)
- [ ] **Setup daily backups** in Supabase dashboard
- [ ] **Document new DATABASE_URL** in team docs
- [ ] **Decommission Replit DB** after 1 week of stable operation

---

## 10. Rollback Plan

### If Migration Fails

**Option 1: Revert DATABASE_URL**
```bash
# Immediately revert to Replit DB
DATABASE_URL=postgresql://[REPLIT_URL]

# Restart app
npm run dev
```

**Option 2: Restore Supabase from Backup**
```bash
# Restore from backup SQL dump
psql $SUPABASE_DATABASE_URL < replit_backup.sql
```

---

## 11. Timeline Estimate

| Phase | Duration | Details |
|-------|----------|---------|
| **Phase 1: Supabase Setup** | 2-4 hours | Create project, export/import schema |
| **Phase 1: Data Migration** | 1-2 hours | Export from Replit, import to Supabase |
| **Phase 1: Testing** | 2-3 hours | Smoke tests, endpoint verification |
| **Phase 1: Deployment** | 1 hour | Update env vars, deploy to Vercel |
| **Phase 2: Category Restructure** | 4-8 hours | Create migration script, test, deploy |
| **Total Phase 1** | **6-10 hours** | Can be done in 1 day |
| **Total Phase 2** | **4-8 hours** | Optional, do after 2+ weeks |

---

## 12. Success Metrics

### Migration Success Criteria

- ✅ 100% data migrated (verified row counts)
- ✅ All API endpoints respond correctly
- ✅ CSV upload flow works end-to-end
- ✅ Categorization engine works (rules applied correctly)
- ✅ Dashboard calculations accurate
- ✅ No performance degradation (< 200ms query times)
- ✅ Session store persists across restarts
- ✅ No data loss or corruption

---

## 13. Support & Resources

### Supabase Documentation
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Drizzle Integration](https://supabase.com/docs/guides/database/drizzle)

### RitualFin Documentation
- `CATEGORY_ANALYSIS.md` - Category structure documentation
- `docs/ARCHITECTURE_AND_AI_LOGIC.md` - System architecture
- `docs/IMPLEMENTATION_LOG.md` - Implementation history

---

## Next Steps

1. ✅ **Review this migration plan**
2. ✅ **Create Supabase project** (can use free tier for testing)
3. ✅ **Run test migration** on staging environment
4. ✅ **Schedule production migration** (low-traffic window)
5. ✅ **Execute Phase 1** (infrastructure migration)
6. ⏳ **Monitor for 2 weeks** (ensure stability)
7. ⏳ **Plan Phase 2** (category restructuring)

---

**Status:** ✅ Ready for Phase 1 Migration
**Recommended Start Date:** When Supabase project is provisioned
**Estimated Total Time:** 6-10 hours for Phase 1
