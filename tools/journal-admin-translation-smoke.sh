#!/usr/bin/env bash
set -euo pipefail

HOST="${JOURNAL_API_HOST:-https://brkovic.ltd}"
API_BASE="${JOURNAL_API_BASE:-/api}"
SKIP_AUTH="${JOURNAL_SMOKE_SKIP_AUTH:-0}"
POST_ID="${JOURNAL_TEST_POST_ID:-00000000-0000-0000-0000-000000000000}"
COLLECTION_ID="${JOURNAL_TEST_COLLECTION_ID:-11111111-1111-1111-1111-111111111111}"

ADMIN_EMAIL="${BRK_ADMIN_EMAIL:-${1:-}}"
ADMIN_PASSWORD="${BRK_ADMIN_PASSWORD:-}"
if [[ "${2:-}" == "--skip-auth" || "${2:-}" == "skip-auth" ]]; then
  SKIP_AUTH=1
fi

if [[ -z "${1:-}" && -n "${BRK_ADMIN_EMAIL:-}" ]]; then
  ADMIN_EMAIL="${BRK_ADMIN_EMAIL}"
fi

TMP_COOKIE="$(mktemp)"
TMP_BODY="$(mktemp)"

cleanup() {
  rm -f "$TMP_COOKIE" "$TMP_BODY"
}
trap cleanup EXIT

if [[ -z "$ADMIN_PASSWORD" ]]; then
  if [[ "$SKIP_AUTH" == "1" ]]; then
    :
  else
    echo "Не передан пароль админа (BRK_ADMIN_PASSWORD / argv[2]). Укажите либо BRK_ADMIN_EMAIL + BRK_ADMIN_PASSWORD, либо запустите с флагом --skip-auth."
    exit 1
  fi
fi

if [[ -z "$ADMIN_PASSWORD" ]]; then
  if [[ "$SKIP_AUTH" == "1" ]]; then
    log "Режим без авторизации в smoke: проверка только анонимного доступа."
  fi
fi

if [[ -z "$ADMIN_EMAIL" ]]; then
  echo "Не указан email (BRK_ADMIN_EMAIL или argv[1])." >&2
  exit 1
fi

api_url() {
  local path=$1
  printf '%s%s%s' "$HOST" "$API_BASE" "$path"
}

log() {
  printf '[%s] %s\n' "$(date -Iseconds)" "$*"
}

request() {
  local method=$1
  local path=$2
  local data=${3:-}

  local extra=(
    -sS
    -X "$method"
    -o "$TMP_BODY"
    -w '%{http_code}'
    -H 'Accept: application/json'
    -b "$TMP_COOKIE"
    -c "$TMP_COOKIE"
    --connect-timeout 10
    --max-time 30
  )

  if [[ "$method" != GET && -n "$data" ]]; then
    extra+=(-H 'Content-Type: application/json' --data "$data")
  fi

  curl "${extra[@]}" "$(api_url "$path")"
}

read_status_body() {
  local http_code=$1
  local path=$2
  local method=$3

  if [[ -s "$TMP_BODY" ]]; then
    log "${method} ${path} -> ${http_code} | $(cat "$TMP_BODY" | tr -d '\n' | head -c 320)"
  else
    log "${method} ${path} -> ${http_code} | <empty>"
  fi
}

check_path() {
  local method=$1
  local path=$2
  local data=$3
  local expect_csv=$4
  local label=$5

  local code
  code="$(request "$method" "$path" "$data")"
  read_status_body "$code" "$path" "$method"

  local ok=0
  IFS=',' read -r -a expected <<< "$expect_csv"
  for expected_code in "${expected[@]}"; do
    if [[ "$code" == "$expected_code" ]]; then
      ok=1
      break
    fi
  done

  if [[ "$ok" -ne 1 ]]; then
    log "FAIL ${label}: expect one of [${expect_csv}], got ${code}"
    return 1
  fi
  log "OK ${label}"
}

log "HOST=${HOST}"
log "API_BASE=${API_BASE}"
log "POST_ID=${POST_ID}"
log "COLLECTION_ID=${COLLECTION_ID}"

log "Stage 1: anonymous smoke (ожидается 401)"
FAILED=0

check_path GET "/admin/posts/$POST_ID/translations" "" 401 "anon post translations list" || FAILED=1
check_path POST "/admin/posts/$POST_ID/translations/generate" '{"sourceLanguage":"ru","targetLanguages":["en"],"includeSeo":true,"includeMedia":true}' 401 "anon post translation generate" || FAILED=1
check_path GET "/admin/journal-collections/$COLLECTION_ID/translations" "" 401 "anon collection translations list" || FAILED=1
check_path POST "/admin/journal-collections/$COLLECTION_ID/translations/generate" '{"sourceLanguage":"ru","targetLanguages":["en"],"includeSeo":true,"includeMedia":true}' 401 "anon collection translation generate" || FAILED=1

if [[ "$FAILED" -ne 0 ]]; then
  log "АНОНИМНЫЙ шаг невалидный. Проверьте auth/proxy."
  exit 1
fi

if [[ "$SKIP_AUTH" != "1" ]]; then
  log "Stage 2: login"
  login_code="$(request POST '/auth/login' "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")"
  read_status_body "$login_code" "/auth/login" "POST"
  if [[ "$login_code" != 200 && "$login_code" != 201 ]]; then
    log "Login failed: ${login_code}"
    cat "$TMP_BODY"
    exit 1
  fi
else
  log "Stage 2 skipped by skip-auth mode."
  log "Auth-smoke complete in skip-auth mode."
  log "Чтобы проверить авторизованные маршруты, запустите с валидным BRK_ADMIN_EMAIL/BRK_ADMIN_PASSWORD."
  exit 0
fi

log "Stage 3: authenticated route availability"
if ! check_path GET "/admin/posts/$POST_ID/translations" "" "200,201,400,404" "auth post translations list" \
  && ! check_path GET "/admin/posts/$POST_ID/translations" "" "200,201,400,404" "auth post translations list retry"; then
  exit 1
fi

if ! check_path POST "/admin/posts/$POST_ID/translations/generate" '{"sourceLanguage":"ru","targetLanguages":["en"],"includeSeo":true,"includeMedia":true}' "200,201,400,404" "auth post translation generate" \
  && ! check_path POST "/admin/posts/$POST_ID/translations/generate" '{"sourceLanguage":"ru","targetLanguages":["en"],"includeSeo":true,"includeMedia":true}' "200,201,400,404" "auth post translation generate retry"; then
  exit 1
fi

if ! check_path GET "/admin/journal-collections/$COLLECTION_ID/translations" "" "200,201,400,404" "auth collection translations list" \
  && ! check_path GET "/admin/journal-collections/$COLLECTION_ID/translations" "" "200,201,400,404" "auth collection translations list retry"; then
  exit 1
fi

if ! check_path POST "/admin/journal-collections/$COLLECTION_ID/translations/generate" '{"sourceLanguage":"ru","targetLanguages":["en"],"includeSeo":true,"includeMedia":true}' "200,201,400,404" "auth collection translation generate" \
  && ! check_path POST "/admin/journal-collections/$COLLECTION_ID/translations/generate" '{"sourceLanguage":"ru","targetLanguages":["en"],"includeSeo":true,"includeMedia":true}' "200,201,400,404" "auth collection translation generate retry"; then
  exit 1
fi

log "Auth smoke passed."
log "Дальше можно запускать целевую smoke на живом ID поста/коллекции."
