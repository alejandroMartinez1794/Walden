#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

grep -q "ARCO" "$ROOT_DIR/GO_NO_GO_MATRIX.md"
grep -q "consentimiento" "$ROOT_DIR/GO_NO_GO_MATRIX.md"
grep -q "brecha" "$ROOT_DIR/GO_NO_GO_MATRIX.md"
grep -q "retention=10y" "$ROOT_DIR/scripts/dr-restore-test.sh"

echo "SIC compliance baseline OK"
