#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

grep -q "GO|NO-GO" "$ROOT_DIR/GO_NO_GO_MATRIX.md"
grep -q "FIRMA" "$ROOT_DIR/GO_NO_GO_MATRIX.md"
grep -q "ARCO" "$ROOT_DIR/GO_NO_GO_MATRIX.md"
grep -q "consentimiento" "$ROOT_DIR/GO_NO_GO_MATRIX.md"
grep -q "brecha" "$ROOT_DIR/GO_NO_GO_MATRIX.md"

echo "PR11 verification OK"
