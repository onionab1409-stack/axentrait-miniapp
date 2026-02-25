#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/opt/axentrait/backups

mkdir -p "$BACKUP_DIR"

docker compose exec -T postgres pg_dump -U axentrait axentrait | gzip > "$BACKUP_DIR/pg_$TIMESTAMP.sql.gz"

find "$BACKUP_DIR" -name "pg_*.sql.gz" -mtime +7 -delete

echo "Backup: $BACKUP_DIR/pg_$TIMESTAMP.sql.gz"
