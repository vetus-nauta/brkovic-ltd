#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
GAME_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
FTP_HOST="162.0.217.114"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing required command: $1" >&2
    exit 1
  }
}

upload() {
  local src="$1"
  local dest="$2"
  curl --silent --show-error --fail --netrc --ftp-pasv --ftp-create-dirs \
    -T "$src" "ftp://${FTP_HOST}${dest}" >/dev/null
  echo "uploaded ${dest}"
}

require_cmd curl

upload "${GAME_ROOT}/private/bootstrap.php" "/game.brkovic.ltd/private/bootstrap.php"
upload "${GAME_ROOT}/private/config.php" "/game.brkovic.ltd/private/config.php"
upload "${GAME_ROOT}/private/config.example.php" "/game.brkovic.ltd/private/config.example.php"
upload "${GAME_ROOT}/private/atlas-secrets.example.php" "/private/captain-ether-atlas.example.php"

for api_file in \
  _answer-logging.php \
  _answer-matching.php \
  answer-log.php \
  finish-watch.php \
  lost-oars.php \
  progress.php \
  resolve-lost-oar.php \
  skip-cleanup.php \
  start-watch.php \
  submit-answer.php
do
  upload "${GAME_ROOT}/public/api/captain-ether/${api_file}" "/game.brkovic.ltd/public/api/captain-ether/${api_file}"
done

cat <<'EOF'
done
- production secret file not touched: /home/brkovic/private/captain-ether-atlas.php
- production Atlas driver not touched: /home/brkovic/game.brkovic.ltd/private/node_modules/mongodb
EOF
