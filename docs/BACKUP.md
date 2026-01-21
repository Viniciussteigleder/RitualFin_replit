# Backup & Disaster Recovery Strategy

## Overview
This document outlines the backup and disaster recovery procedures for RitualFin's PostgreSQL database hosted on Neon.

## Backup Strategy

### Automated Backups (Neon)
Neon provides automatic point-in-time recovery (PITR) with the following retention:
- **Free Tier:** 7 days of history
- **Pro Tier:** 30 days of history
- **Enterprise:** Custom retention

### Manual Backups

#### Using pg_dump
For critical operations or before major migrations, create manual backups:

```bash
# Full database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema only
pg_dump --schema-only $DATABASE_URL > schema_$(date +%Y%m%d_%H%M%S).sql

# Data only
pg_dump --data-only $DATABASE_URL > data_$(date +%Y%m%d_%H%M%S).sql
```

#### Using the Backup Script
We provide a convenience script:

```bash
# Run backup script
pnpm run db:backup

# Or directly
./scripts/backup.sh
```

## Restore Procedures

### Point-in-Time Recovery (Neon)
1. Log into Neon console
2. Navigate to your project
3. Click "Restore" and select the desired timestamp
4. Neon will create a new branch with the restored data

### Restore from pg_dump

```bash
# Restore full backup
psql $DATABASE_URL < backup_20260120_123000.sql

# Restore compressed backup
gunzip -c backup_20260120_123000.sql.gz | psql $DATABASE_URL

# Restore to a new database (safer)
createdb ritualfin_restore
psql postgresql://user:pass@host/ritualfin_restore < backup.sql
```

## Pre-Migration Checklist

Before running any migration:

1. **Create a backup:**
   ```bash
   pnpm run db:backup
   ```

2. **Verify backup integrity:**
   ```bash
   # Check file size
   ls -lh backups/

   # Verify SQL syntax
   head -n 50 backups/latest.sql
   ```

3. **Test migration on a branch:**
   - Create a Neon branch
   - Run migration on branch
   - Verify data integrity
   - Delete branch if successful

4. **Document the migration:**
   - Record migration timestamp
   - Note affected tables
   - Save rollback plan

## Rollback Procedures

### Immediate Rollback (< 1 hour)
If you detect issues immediately after migration:

```bash
# Revert to previous migration
pnpm drizzle-kit drop

# Or restore from backup
psql $DATABASE_URL < backups/pre_migration.sql
```

### Delayed Rollback (> 1 hour)
If issues are discovered later:

1. **Stop all writes:**
   - Put application in maintenance mode
   - Disable background jobs

2. **Assess data loss:**
   - Identify transactions since migration
   - Export critical new data

3. **Restore from backup:**
   ```bash
   psql $DATABASE_URL < backups/pre_migration.sql
   ```

4. **Re-apply critical transactions:**
   - Manually insert critical new data
   - Verify data integrity

## Backup Schedule

### Production
- **Automated:** Continuous (Neon PITR)
- **Manual:** Before each deployment
- **Full Export:** Weekly (Sundays at 02:00 UTC)

### Development
- **Manual:** Before major schema changes
- **Automated:** Not required (can recreate from seed)

## Storage Locations

### Local Backups
```
/backups/
  ├── daily/
  ├── weekly/
  └── pre-migration/
```

### Remote Backups
- **Primary:** Neon's built-in backups
- **Secondary:** AWS S3 (for weekly exports)
- **Retention:** 90 days

## Testing Restore Procedures

Test restore procedures quarterly:

```bash
# 1. Create test database
createdb ritualfin_test_restore

# 2. Restore latest backup
psql postgresql://localhost/ritualfin_test_restore < backups/latest.sql

# 3. Verify data
psql postgresql://localhost/ritualfin_test_restore -c "SELECT COUNT(*) FROM transactions;"

# 4. Cleanup
dropdb ritualfin_test_restore
```

## Emergency Contacts

- **Database Admin:** [Your Email]
- **Neon Support:** support@neon.tech
- **On-Call:** [Phone Number]

## Disaster Scenarios

### Scenario 1: Accidental Data Deletion
1. Immediately stop application
2. Identify deletion timestamp
3. Use Neon PITR to restore to just before deletion
4. Export deleted data from restored branch
5. Re-insert into production

### Scenario 2: Corrupted Migration
1. Stop application
2. Restore from pre-migration backup
3. Fix migration script
4. Test on branch
5. Re-run migration

### Scenario 3: Complete Database Loss
1. Create new Neon project
2. Restore from latest weekly backup
3. Apply recent daily backups
4. Verify data integrity
5. Update connection strings
6. Resume application

## Monitoring

### Backup Health Checks
- Verify backup file size (should be > 0)
- Check backup age (should be < 24 hours)
- Test restore monthly

### Alerts
Set up alerts for:
- Backup failures
- Backup size anomalies
- Missing backups

## Compliance

### Data Retention
- **Production backups:** 90 days
- **User data:** Indefinite (until user deletion)
- **Audit logs:** 1 year

### GDPR Considerations
- User deletion requests must purge all backups
- Backups must be encrypted at rest
- Access logs must be maintained

## Automation

### Backup Script
See `scripts/backup.sh` for automated backup script.

### Cron Jobs
```cron
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup.sh daily

# Weekly backup on Sunday at 3 AM
0 3 * * 0 /path/to/scripts/backup.sh weekly
```

## References

- [Neon Branching Docs](https://neon.tech/docs/introduction/branching)
- [PostgreSQL Backup Docs](https://www.postgresql.org/docs/current/backup.html)
- [pg_dump Manual](https://www.postgresql.org/docs/current/app-pgdump.html)
