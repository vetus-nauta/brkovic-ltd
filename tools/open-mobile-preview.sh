#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date +%s)"
TARGET_PATH="${1:-${BRKOVIC_PREVIEW_PATH:-/navdesk.html}}"
if [[ "${TARGET_PATH}" != /* ]]; then
  TARGET_PATH="/${TARGET_PATH}"
fi
ENCODED_PATH="$(php -r 'echo rawurlencode($argv[1]);' "${TARGET_PATH}")"
URL="http://127.0.0.1:18090/tools/device-preview.html?device=phone&path=${ENCODED_PATH}&v=${STAMP}"
LOG="/tmp/brkovic-ltd-preview-server.log"

if ! curl -fsS "http://127.0.0.1:18090/index.html" >/dev/null 2>&1; then
  (cd "$ROOT" && php -S 127.0.0.1:18090 -t . >"$LOG" 2>&1 &)
  sleep 1
fi

if [[ "${BRKOVIC_LOCAL_DRY_RUN:-0}" == "1" ]]; then
  printf '%s\n' "$URL"
  exit 0
fi

BROWSER="${BROWSER:-google-chrome}"
exec "$BROWSER" \
  --new-window \
  --app="$URL" \
  --user-data-dir="/tmp/brkovic-ltd-mobile-profile" \
  --window-size=520,940 \
  --class="brkovic-mobile-preview"
