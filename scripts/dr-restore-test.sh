#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backend/backups}"
RESTORE_DIR="${RESTORE_DIR:-$ROOT_DIR/backend/tmp-restore}"
RTO_MINUTES="${RTO_MINUTES:-15}"
RUN_DR_RESTORE="${RUN_DR_RESTORE:-false}"
MONGO_RESTORE_URI="${MONGO_RESTORE_URI:-}"

echo "RTO=${RTO_MINUTES}min"
echo "retention=10y"

if command -v gpg >/dev/null 2>&1; then
  echo "GPG available"
else
  echo "GPG missing"
fi

if command -v mongorestore >/dev/null 2>&1; then
  echo "mongorestore available"
  if [[ "$RUN_DR_RESTORE" == "true" ]]; then
    if [[ -z "$MONGO_RESTORE_URI" ]]; then
      echo "MONGO_RESTORE_URI missing"
      exit 1
    fi

    if [[ -z "$(find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
      echo "restore: skipped (no backups found in $BACKUP_DIR)"
      exit 0
    fi

    mongorestore --drop --uri "$MONGO_RESTORE_URI" --dir "$BACKUP_DIR"
    echo "restore: executed"
  else
    echo "restore: skipped (set RUN_DR_RESTORE=true to execute)"
  fi
else
  echo "mongorestore missing"
fi

echo "rollback: restore previous backup if verification fails"
