#!/usr/bin/env bash
set -euo pipefail

HOST="${TOOL_AUTH_HOST:-https://brkovic.ltd}"
API_BASE="${TOOL_AUTH_API_BASE:-/api}"
SKIP_AUTH="${TOOL_AUTH_SKIP_AUTH:-0}"
TEST_EMAIL="${TOOL_AUTH_TEST_EMAIL:-}"
TEST_CODE="${TOOL_AUTH_TEST_CODE:-}"

log() {
  printf '[%s] %s\n' "$(date -Iseconds)" "$*"
}

request() {
  local method=$1
  local path=$2
  local body=${3-}
  local curl_code
  local curl_args=(
    -sS
    -X "$method"
    -H 'Accept: application/json'
    -o /tmp/tool-auth-smoke.body
    -w '%{http_code}'
    --connect-timeout 10
    --max-time 20
    -b /tmp/tool-auth-smoke.cookies
    -c /tmp/tool-auth-smoke.cookies
  )

  if [[ "$method" != GET && -n "$body" ]]; then
    curl_args+=( -H 'Content-Type: application/json' --data "$body" )
  fi

  if curl_code="$(curl "${curl_args[@]}" "${HOST}${API_BASE}${path}")"; then
    :
  else
    log "FAIL request failed for ${method} ${path}"
    return 1
  fi

  local payload
  payload="$(cat /tmp/tool-auth-smoke.body 2>/dev/null | tr -d '\n')"
  printf '%s %s -> %s | %s\n' "${method}" "${path}" "${curl_code}" "${payload:0:220}" >&2
  echo "$curl_code"
}

check_code() {
  local code=$1
  local expected_csv=$2
  local label=$3
  local ok=1

  IFS=',' read -r -a expected <<< "$expected_csv"
  for value in "${expected[@]}"; do
    if [[ "$code" == "$value" ]]; then
      ok=0
      break
    fi
  done

  if [[ "$ok" -ne 0 ]]; then
    log "FAIL ${label}: expected [${expected_csv}], got ${code}"
    return 1
  fi

  log "PASS ${label}: ${code}"
}

request_code() {
  local method=$1
  local path=$2
  local body=$3
  local expected=$4
  local label=$5

  local code
  code="$(request "$method" "$path" "$body")"
  check_code "$code" "$expected" "$label"
}

rm -f /tmp/tool-auth-smoke.body /tmp/tool-auth-smoke.cookies

log "HOST=${HOST}"
log "API_BASE=${API_BASE}"
log "SKIP_AUTH=${SKIP_AUTH}"
log "TEST_EMAIL=${TEST_EMAIL:+set}${TEST_EMAIL:+ (masked)}"

FAIL=0

if ! request_code GET "/auth/user/me" "" "401,200" "GET /auth/user/me public status"; then
  FAIL=1
fi

if [[ -n "$TEST_EMAIL" ]]; then
  if ! request_code POST "/auth/user/request-code" "$(printf '{"email":"%s"}' "$TEST_EMAIL")" "200,201,202,204" "POST /auth/user/request-code"; then
    FAIL=1
  fi

  if [[ -n "$TEST_CODE" ]]; then
    if ! request_code POST "/auth/user/verify-code" "$(printf '{"email":"%s","code":"%s"}' "$TEST_EMAIL" "$TEST_CODE")" "200,201,202" "POST /auth/user/verify-code"; then
      FAIL=1
    fi
  else
    log "SKIP verify-code: TOOL_AUTH_TEST_CODE not set"
  fi
else
  log "SKIP request-code: TOOL_AUTH_TEST_EMAIL not set"
  if [[ "$SKIP_AUTH" != "1" ]]; then
    log "Для полноценного сквозного прогона нужен TEST_EMAIL; сейчас выполняется только маршрутный доступ (без запроса кода)."
  fi
fi

if ! request_code POST "/auth/user/logout" "{}" "200,201,202,204" "POST /auth/user/logout"; then
  FAIL=1
fi

if [[ "$FAIL" -ne 0 ]]; then
  log "Tool-auth smoke finished with failures."
  exit 1
fi

log "Tool-auth smoke passed."
log "Если у вас есть валидный email+код, задайте TOOL_AUTH_TEST_EMAIL and TOOL_AUTH_TEST_CODE и повторите скрипт для сквозной проверки verify."
