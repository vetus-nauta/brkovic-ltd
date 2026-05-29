#!/usr/bin/env bash
set -euo pipefail

HOST="${TOOL_AUTH_HOST:-https://brkovic.ltd}"
API_BASE="${TOOL_AUTH_API_BASE:-/api}"
MAX_ATTEMPTS="${TOOL_AUTH_MAX_ATTEMPTS:-10}"
INTERVAL_SECONDS="${TOOL_AUTH_INTERVAL_SECONDS:-60}"
LOG_FILE="${TOOL_AUTH_LOG_FILE:-/tmp/tool-auth-backend-watch.log}"

ME_ROUTE="${TOOL_AUTH_ME_ROUTE:-/auth/user/me}"
REQUEST_CODE_ROUTE="${TOOL_AUTH_REQUEST_CODE_ROUTE:-/auth/user/request-code}"
VERIFY_ROUTE="${TOOL_AUTH_VERIFY_ROUTE:-/auth/user/verify-code}"
LOGOUT_ROUTE="${TOOL_AUTH_LOGOUT_ROUTE:-/auth/user/logout}"

log() {
  local ts
  ts="$(date -Iseconds)"
  local msg="$*"
  printf '%s %s\n' "$ts" "$msg" | tee -a "$LOG_FILE"
}

probe() {
  local method=$1
  local route=$2
  local body=${3-}
  local code
  if [[ "$method" == "GET" ]]; then
    code="$(curl -sS -o /tmp/tool-auth-watch-body.json -w '%{http_code}' "${HOST}${API_BASE}${route}")"
  else
    code="$(curl -sS -o /tmp/tool-auth-watch-body.json -w '%{http_code}' -X "$method" "${HOST}${API_BASE}${route}" -H 'Content-Type: application/json' --data "$body")"
  fi
  local resp
  resp="$(cat /tmp/tool-auth-watch-body.json 2>/dev/null | tr -d '\n' | head -c 180)"
  echo "$route|$code|$resp"
}

rm -f /tmp/tool-auth-watch-body.json "$LOG_FILE"
touch "$LOG_FILE"

log "Watch started: host=$HOST base=$API_BASE attempts=${MAX_ATTEMPTS} interval=${INTERVAL_SECONDS}s"
log "Routes: me=$ME_ROUTE request=$REQUEST_CODE_ROUTE verify=$VERIFY_ROUTE logout=$LOGOUT_ROUTE"

for ((attempt = 1; attempt <= MAX_ATTEMPTS; attempt++)); do
  log "Attempt ${attempt}/${MAX_ATTEMPTS}"
  me="$(probe GET "$ME_ROUTE")"
  req="$(probe POST "$REQUEST_CODE_ROUTE" '{"email":"watch@example.com"}')"
  ver="$(probe POST "$VERIFY_ROUTE" '{"email":"watch@example.com","code":"123456"}')"
  lo="$(probe POST "$LOGOUT_ROUTE" '{}')"

  IFS='|' read -r _ me_code _ <<< "$me"
  IFS='|' read -r _ req_code _ <<< "$req"
  IFS='|' read -r _ ver_code _ <<< "$ver"
  IFS='|' read -r _ lo_code _ <<< "$lo"

  log "me     -> $me"
  log "request-> $req"
  log "verify -> $ver"
  log "logout -> $lo"

  if [[ "$req_code" != "404" && "$ver_code" != "404" && "$me_code" != "404" ]]; then
    log "PASS candidate: auth routes answer beyond 404."
    log "watch completed with success."
    exit 0
  fi

  if (( attempt < MAX_ATTEMPTS )); then
    sleep "$INTERVAL_SECONDS"
  fi
done

log "Watch completed without meeting live-route threshold."
exit 1
