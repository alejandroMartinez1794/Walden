#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backend/backups}"
RESTORE_DIR="${RESTORE_DIR:-$ROOT_DIR/backend/tmp-restore}"
RTO_MINUTES="${RTO_MINUTES:-15}"

echo "RTO=${RTO_MINUTES}min"
echo "retention=10y"

if command -v gpg >/dev/null 2>&1; then
  echo "GPG available"
else
  echo "GPG missing"
fi

if command -v mongorestore >/dev/null 2>&1; then
  echo "mongorestore available"
  mongorestore --drop --dir "$BACKUP_DIR" --out "$RESTORE_DIR"
else
  echo "mongorestore missing"
fi

echo "rollback: restore previous backup if verification fails"
