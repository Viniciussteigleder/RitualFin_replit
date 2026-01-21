#!/bin/bash

# Database Backup Script for RitualFin
# Creates timestamped backups of the PostgreSQL database

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE=${1:-"manual"}  # daily, weekly, or manual

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL not set"
  echo "Please set DATABASE_URL in .env.local"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR/$BACKUP_TYPE"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/$BACKUP_TYPE/backup_${TIMESTAMP}.sql.gz"

echo "🔄 Starting database backup..."
echo "📁 Backup type: $BACKUP_TYPE"
echo "📝 Backup file: $BACKUP_FILE"

# Create backup
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup completed successfully"
  echo "📊 Backup size: $BACKUP_SIZE"
  
  # Create a symlink to latest backup
  ln -sf "$(basename $BACKUP_FILE)" "$BACKUP_DIR/$BACKUP_TYPE/latest.sql.gz"
  
  # Cleanup old backups (keep last 30 for daily, 12 for weekly)
  if [ "$BACKUP_TYPE" = "daily" ]; then
    find "$BACKUP_DIR/daily" -name "backup_*.sql.gz" -mtime +30 -delete
    echo "🧹 Cleaned up backups older than 30 days"
  elif [ "$BACKUP_TYPE" = "weekly" ]; then
    find "$BACKUP_DIR/weekly" -name "backup_*.sql.gz" -mtime +90 -delete
    echo "🧹 Cleaned up backups older than 90 days"
  fi
  
  echo "✨ Backup process complete"
else
  echo "❌ Backup failed"
  exit 1
fi
