#!/usr/bin/env bash
set -euo pipefail

target_dir="${HOME}/.config/brkovic-ltd"
target_file="${target_dir}/openai.env"

install -d -m 700 "$target_dir"

printf 'Paste OpenAI API key. It will not be shown on screen: '
IFS= read -r -s openai_api_key
printf '\n'

if [[ -z "$openai_api_key" ]]; then
  printf 'OpenAI API key was empty. Nothing written.\n' >&2
  exit 1
fi

case "$openai_api_key" in
  sk-*) ;;
  *)
    printf 'Warning: value does not start with sk-. Saving anyway.\n' >&2
    ;;
esac

umask 077
printf 'OPENAI_API_KEY=%s\n' "$openai_api_key" > "$target_file"
chmod 600 "$target_file"
unset openai_api_key

printf 'OpenAI API key stored locally: %s\n' "$target_file"
