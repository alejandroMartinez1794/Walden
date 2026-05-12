#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backend/backups}"
RESTORE_DIR="${RESTORE_DIR:-$ROOT_DIR/backend/tmp-restore}"
RTO_MINUTES="${RTO_MINUTES:-15}"
RUN_DR_RESTORE="${RUN_DR_RESTORE:-false}"
MONGO_RESTORE_URI="${MONGO_RESTORE_URI:-}"
BACKUP_ARCHIVE="${BACKUP_ARCHIVE:-}"
MONGO_VERIFY_URI="${MONGO_VERIFY_URI:-}"
MONGO_VERIFY_COLLECTION="${MONGO_VERIFY_COLLECTION:-dr_smoke}"
EXPECTED_VERIFY_COUNT="${EXPECTED_VERIFY_COUNT:-1}"

run_restore() {
  local archive_path="$1"
  local target_uri="$2"

  if command -v mongorestore >/dev/null 2>&1; then
    mongorestore --archive="$archive_path" --gzip --drop --uri="$target_uri"
    return 0
  fi

  if command -v docker >/dev/null 2>&1; then
    local archive_dir
    archive_dir="$(dirname "$archive_path")"
    local archive_file
    archive_file="$(basename "$archive_path")"
    docker run --rm -v "$archive_dir:/backup" mongo:7 \
      mongorestore --archive="/backup/$archive_file" --gzip --drop --uri="$target_uri"
    return 0
  fi

  echo "mongorestore unavailable"
  return 1
}

run_verify_count() {
  local verify_uri="$1"
  local verify_collection="$2"

  if command -v mongosh >/dev/null 2>&1; then
    mongosh "$verify_uri" --quiet --eval "db.getCollection('$verify_collection').countDocuments()"
    return 0
  fi

  if command -v docker >/dev/null 2>&1; then
    docker run --rm mongo:7 \
      mongosh "$verify_uri" --quiet --eval "db.getCollection('$verify_collection').countDocuments()"
    return 0
  fi

  echo "mongosh unavailable"
  return 1
}

echo "RTO=${RTO_MINUTES}min"
echo "retention=10y"

if command -v gpg >/dev/null 2>&1; then
  echo "GPG available"
else
  echo "GPG missing"
fi

if [[ "$RUN_DR_RESTORE" == "true" ]]; then
  if [[ -z "$MONGO_RESTORE_URI" ]]; then
    echo "MONGO_RESTORE_URI missing"
    exit 1
  fi

  if [[ -z "$BACKUP_ARCHIVE" ]]; then
    echo "BACKUP_ARCHIVE missing"
    exit 1
  fi

  if [[ ! -f "$BACKUP_ARCHIVE" ]]; then
    echo "restore: backup archive not found at $BACKUP_ARCHIVE"
    exit 1
  fi

  if command -v mongorestore >/dev/null 2>&1; then
    echo "mongorestore available"
  elif command -v docker >/dev/null 2>&1; then
    echo "docker available for restore"
  else
    echo "restore tool unavailable"
    exit 1
  fi

  run_restore "$BACKUP_ARCHIVE" "$MONGO_RESTORE_URI"
  echo "restore: executed"

  if [[ -n "$MONGO_VERIFY_URI" ]]; then
    actual_count="$(run_verify_count "$MONGO_VERIFY_URI" "$MONGO_VERIFY_COLLECTION")"
    echo "restore: verify_count=$actual_count"

    if [[ "$actual_count" != "$EXPECTED_VERIFY_COUNT" ]]; then
      echo "restore verification failed: expected $EXPECTED_VERIFY_COUNT, got $actual_count"
      exit 1
    fi
  fi
else
  echo "restore: skipped (set RUN_DR_RESTORE=true to execute)"
fi

echo "rollback: restore previous backup if verification fails"
