#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
ENV_FILE="${SHIP_CASHBOX_ENV_FILE:-$ROOT_DIR/ship-cashbox/storage/.ship-cashbox.env}"
CLUSTER_HOST="${SHIP_CASHBOX_MONGODB_HOST:-brkovic-prod.l4hsxov.mongodb.net}"
DATABASE="${SHIP_CASHBOX_MONGODB_DB:-brkovic_ship_cashbox}"
USERNAME="${SHIP_CASHBOX_MONGODB_USER:-brkovic_ship_cashbox_app}"
PREFIX="${SHIP_CASHBOX_MONGODB_COLLECTION_PREFIX:-shipCashbox}"

printf 'Ship Cashbox MongoDB Atlas setup\n'
printf 'Host: %s\n' "$CLUSTER_HOST"
printf 'Database: %s\n' "$DATABASE"
printf 'User [%s]: ' "$USERNAME"
read -r input_user
if [ -n "$input_user" ]; then
  USERNAME="$input_user"
fi

printf 'Password: '
stty -echo
read -r PASSWORD
stty echo
printf '\n'

if [ -z "$PASSWORD" ]; then
  echo "Password is required" >&2
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  ENCODED_PASSWORD="$(PASSWORD="$PASSWORD" python3 - <<'PY'
import os
from urllib.parse import quote
print(quote(os.environ["PASSWORD"], safe=""))
PY
)"
elif command -v node >/dev/null 2>&1; then
  ENCODED_PASSWORD="$(PASSWORD="$PASSWORD" node -e 'process.stdout.write(encodeURIComponent(process.env.PASSWORD || ""))')"
else
  echo "python3 or node is required to URL-encode the password" >&2
  exit 1
fi

mkdir -p "$(dirname -- "$ENV_FILE")"
umask 077
cat > "$ENV_FILE" <<EOF
SHIP_CASHBOX_STORAGE=mongodb
SHIP_CASHBOX_MONGODB_URI=mongodb+srv://$USERNAME:$ENCODED_PASSWORD@$CLUSTER_HOST/$DATABASE?retryWrites=true&w=majority&appName=brkovic-prod&authSource=admin
SHIP_CASHBOX_MONGODB_DB=$DATABASE
SHIP_CASHBOX_MONGODB_COLLECTION_PREFIX=$PREFIX
EOF
chmod 600 "$ENV_FILE"

printf 'Wrote private env file: %s\n' "$ENV_FILE"
printf 'Next check: /ship-cashbox/api/?action=storage-health\n'
