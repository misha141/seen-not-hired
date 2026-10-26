#!/usr/bin/env bash
# Builds seen-not-hired.zip at the repo root.
# The ZIP's root contains the seen-not-hired/ folder, with SKILL.md inside it.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SKILL="seen-not-hired"
OUT="$ROOT/$SKILL.zip"

if [ ! -f "$ROOT/$SKILL/SKILL.md" ]; then
  echo "Can't find $SKILL/SKILL.md next to build.sh" >&2
  exit 1
fi

rm -f "$OUT"
cd "$ROOT"
zip -r -X -q "$OUT" "$SKILL" -x "*.DS_Store" -x "*/__MACOSX/*"

echo "Built $OUT"
unzip -l "$OUT"
