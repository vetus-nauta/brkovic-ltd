#!/usr/bin/env bash
set -euo pipefail

env_file="${OPENAI_ENV_FILE:-${HOME}/.config/brkovic-ltd/openai.env}"

if [[ ! -r "$env_file" ]]; then
  printf 'openai_env=missing\n' >&2
  printf 'openai_health=not_configured\n' >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$env_file"
set +a

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  printf 'openai_env=present\n' >&2
  printf 'openai_health=empty_key\n' >&2
  exit 1
fi

tmp_body="$(mktemp)"
cleanup() {
  rm -f "$tmp_body"
  unset OPENAI_API_KEY
}
trap cleanup EXIT

printf 'openai_env=present\n'

if ! http_code="$(
  curl -sS \
    --connect-timeout 10 \
    --max-time 30 \
    -o "$tmp_body" \
    -w '%{http_code}' \
    -H "Authorization: Bearer ${OPENAI_API_KEY}" \
    https://api.openai.com/v1/models
)"; then
  printf 'openai_health=network_error\n' >&2
  exit 1
fi

printf 'openai_models_http=%s\n' "$http_code"

case "$http_code" in
  200)
    printf 'openai_health=ok\n'
    ;;
  401|403)
    printf 'openai_health=auth_failed\n' >&2
    exit 1
    ;;
  429)
    printf 'openai_health=rate_or_quota_limited\n' >&2
    exit 1
    ;;
  *)
    printf 'openai_health=unexpected_status\n' >&2
    exit 1
    ;;
esac
