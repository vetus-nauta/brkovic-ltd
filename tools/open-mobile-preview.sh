#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date +%s)"
URL="http://127.0.0.1:18090/tools/device-preview.html?device=phone&path=/journal.html%3Fcollection%3Dchelovecheskoe-i-morskoe%26previewBust%3D${STAMP}&v=${STAMP}"
LOG="/tmp/brkovic-ltd-preview-server.log"

if ! curl -fsS "http://127.0.0.1:18090/index.html" >/dev/null 2>&1; then
  (cd "$ROOT" && php -S 127.0.0.1:18090 -t . >"$LOG" 2>&1 &)
  sleep 1
fi

BROWSER="${BROWSER:-google-chrome}"
exec "$BROWSER" \
  --new-window \
  --app="$URL" \
  --user-data-dir="/tmp/brkovic-ltd-mobile-profile" \
  --window-size=520,940 \
  --class="brkovic-mobile-preview"
