#!/usr/bin/env bash
set -euo pipefail

config_dir="${HOME}/.config/brkovic-ltd"
config_file="${config_dir}/google-oauth.env"

mkdir -p "${config_dir}"
chmod 700 "${config_dir}"

printf 'Paste Google OAuth Client ID: '
IFS= read -r client_id

printf 'Paste Google OAuth Client secret. It will not be shown on screen: '
stty -echo
IFS= read -r client_secret
stty echo
printf '\n'

if [[ -z "${client_id// }" || -z "${client_secret// }" ]]; then
  printf 'Client ID and Client secret are required.\n' >&2
  exit 1
fi

umask 077
{
  printf 'GOOGLE_OAUTH_CLIENT_ID=%q\n' "${client_id}"
  printf 'GOOGLE_OAUTH_CLIENT_SECRET=%q\n' "${client_secret}"
  printf 'GOOGLE_OAUTH_REDIRECT_URI=%q\n' 'https://brkovic.ltd/api/auth/user/google/callback'
} > "${config_file}"
chmod 600 "${config_file}"

printf 'Google OAuth credentials stored locally: %s\n' "${config_file}"
