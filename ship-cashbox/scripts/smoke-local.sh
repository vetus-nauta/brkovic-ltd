#!/bin/sh
set -eu

BASE_URL="${BASE_URL:-http://127.0.0.1:18090}"
SHELL_VERSION="${SHELL_VERSION:-20260604-cashbox-menu-hidden-25}"
API_VERSION="${API_VERSION:-2026.06.04-ship-cashbox-storage-01}"
SW_CACHE="${SW_CACHE:-ship-cashbox-shell-v20260604-151}"
TMP_DIR="${TMPDIR:-/tmp}/ship-cashbox-smoke"
mkdir -p "$TMP_DIR"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "MISSING $1" >&2
    exit 1
  }
}

fetch() {
  label="$1"
  url="$2"
  out="$3"
  code=$(curl -sS -o "$out" -w '%{http_code}' "$url")
  echo "$label $code"
  [ "$code" = "200" ] || exit 1
}

contains() {
  label="$1"
  pattern="$2"
  file="$3"
  if grep -q "$pattern" "$file"; then
    echo "$label OK"
  else
    echo "$label FAIL" >&2
    exit 1
  fi
}

json_expr() {
  label="$1"
  expr="$2"
  file="$3"
  node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if (!($expr)) { process.exit(1); }" "$file" \
    && echo "$label OK" \
    || { echo "$label FAIL" >&2; exit 1; }
}

need curl
need grep
need node

fetch html "$BASE_URL/ship-cashbox/index.html?welcome=1&reload=$SHELL_VERSION" "$TMP_DIR/index.html"
fetch js "$BASE_URL/ship-cashbox/assets/app.js?v=$SHELL_VERSION" "$TMP_DIR/app.js"
fetch css "$BASE_URL/ship-cashbox/assets/app.css?v=$SHELL_VERSION" "$TMP_DIR/app.css"
fetch ui_css "$BASE_URL/ship-cashbox/assets/ui-contract.css?v=$SHELL_VERSION" "$TMP_DIR/ui-contract.css"
fetch sw "$BASE_URL/ship-cashbox/sw.js?reload=$SHELL_VERSION" "$TMP_DIR/sw.js"
fetch main_js "$BASE_URL/js/main.js?v=20260603-site-menu-guard-01" "$TMP_DIR/main.js"
fetch api_me "$BASE_URL/ship-cashbox/api/?action=me" "$TMP_DIR/me.json"
fetch storage_health "$BASE_URL/ship-cashbox/api/?action=storage-health" "$TMP_DIR/storage-health.json"

contains html_version "$SHELL_VERSION" "$TMP_DIR/index.html"
contains html_brand_header "navdesk-header-card" "$TMP_DIR/index.html"
contains html_guest_menu "cashboxGuestMenuButton" "$TMP_DIR/index.html"
contains html_menu_start "cashboxMenuStart" "$TMP_DIR/index.html"
contains html_workspace_close "workspaceCloseButton" "$TMP_DIR/index.html"
contains html_active_journal "cashboxMenuActiveJournal" "$TMP_DIR/index.html"
contains html_language_x "shipcashbox-language-modal__close" "$TMP_DIR/index.html"
contains js_guest_menu "cashboxGuestMenuButton" "$TMP_DIR/app.js"
contains js_last_mode "LAST_MODE_KEY" "$TMP_DIR/app.js"
contains js_equalizer_history "EQUALIZER_HISTORY_KEY" "$TMP_DIR/app.js"
contains js_equalizer_tool "openEqualizerTool" "$TMP_DIR/app.js"
contains js_main_menu_guard "shipcashbox-body" "$TMP_DIR/main.js"
contains js_crew_rotation "crew-rotation" "$TMP_DIR/app.js"
contains js_rotate_treasurer "rotate-treasurer" "$TMP_DIR/app.js"
contains js_close_audit "buildCloseAudit" "$TMP_DIR/app.js"
contains js_no_modeless_boot_guard "boot&mode=" "$TMP_DIR/app.js"
contains js_ready_records "renderCashboxReadyRecordsPanel" "$TMP_DIR/app.js"
contains js_recovery_log "appendRecoveryLog" "$TMP_DIR/app.js"
contains js_update_copy "защищенном сервере" "$TMP_DIR/app.js"
contains css_personal_quiet "shipcashbox-personal-quiet" "$TMP_DIR/app.css"
contains css_brand_header "Reuse the real Nav Desk header" "$TMP_DIR/app.css"
contains css_equalizer_board "shipcashbox-equalizer-board" "$TMP_DIR/app.css"
contains css_crew_rotation "shipcashbox-rotation-card" "$TMP_DIR/app.css"
contains css_close_audit "shipcashbox-close-audit" "$TMP_DIR/app.css"
contains ui_css_workspace_contract "Ship Cashbox workspace fullscreen contract" "$TMP_DIR/ui-contract.css"
contains ui_css_workspace_width "cashbox-work-width" "$TMP_DIR/ui-contract.css"
contains ui_css_journal_flow "Ship Cashbox journal flow contract" "$TMP_DIR/ui-contract.css"
contains ui_css_language_glass "Language selector: light glass sheet pinned to the top" "$TMP_DIR/ui-contract.css"
contains ui_css_language_hint_glass "Language auto-hint: detach the legacy inline card from the header" "$TMP_DIR/ui-contract.css"
contains sw_cache "$SW_CACHE" "$TMP_DIR/sw.js"
contains api_version "$API_VERSION" "$TMP_DIR/me.json"
contains storage_health_provider "\"provider\"" "$TMP_DIR/storage-health.json"
contains storage_health_version "$API_VERSION" "$TMP_DIR/storage-health.json"

node -e "const fs=require('fs'); let js=fs.readFileSync(process.argv[1],'utf8'); js=js.replace(/async function openActiveJournal\(\) {[\s\S]*?\n}\n\nasync function handleAppAccountAction/, 'async function handleAppAccountAction'); if (/api\(\s*['\"]boot['\"]\s*\)/.test(js)) { console.error('modeless_boot FAIL'); process.exit(1); }" "$TMP_DIR/app.js"
echo "modeless_boot OK"
node -e "const fs=require('fs'); const js=fs.readFileSync(process.argv[1],'utf8'); if (/shell-кэш|Обновите PWA|shell-cache/i.test(js)) { console.error('technical_update_copy FAIL'); process.exit(1); }" "$TMP_DIR/app.js"
echo "technical_update_copy OK"

for mode in group personal; do
  out="$TMP_DIR/boot-$mode.json"
  fetch "boot_$mode" "$BASE_URL/ship-cashbox/api/?action=boot&mode=$mode" "$out"
  json_expr "boot_${mode}_version" "data.version === '$API_VERSION'" "$out"
  node -e "const fs=require('fs'); const mode=process.argv[2]; const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if (data.session && data.session.session_mode !== mode) { console.error('expected '+mode+', got '+data.session.session_mode); process.exit(1); }" "$out" "$mode" \
    && echo "boot_${mode}_isolation OK" \
    || exit 1
  node -e "const fs=require('fs'); const mode=process.argv[2]; const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const lists=[]; if (Array.isArray(data.archive)) lists.push(data.archive); if (Array.isArray(data.archives)) lists.push(data.archives); if (data.archives && !Array.isArray(data.archives)) { for (const value of Object.values(data.archives)) if (Array.isArray(value)) lists.push(value); } const leak=lists.flat().find((item)=>item && item.session_mode && item.session_mode!==mode); if (leak) { console.error('archive leak for '+mode+': '+leak.session_mode+' '+leak.id); process.exit(1); }" "$out" "$mode" \
    && echo "boot_${mode}_archive_isolation OK" \
    || exit 1
  if [ "$mode" = "personal" ]; then
    node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const session=data.session; if (!session) { process.exit(0); } if (session.session_mode !== 'personal') { console.error('personal session_mode FAIL: '+session.session_mode); process.exit(1); } const participants=session.participants; if (!Array.isArray(participants) || participants.length !== 1) { console.error('personal participants length FAIL: '+(Array.isArray(participants) ? participants.length : 'not-array')); process.exit(1); } const participant=participants[0] || {}; if (!participant.id || participant.id !== session.treasurer_participant_id) { console.error('personal treasurer participant mismatch: '+participant.id+' vs '+session.treasurer_participant_id); process.exit(1); }" "$out" \
      && echo "boot_personal_payload_isolated OK" \
      || exit 1
  fi
done

node -e "const fs=require('fs'); const group=JSON.parse(fs.readFileSync(process.argv[1],'utf8')).session; const personal=JSON.parse(fs.readFileSync(process.argv[2],'utf8')).session; if (group && personal && group.id && personal.id && group.id === personal.id) { console.error('active session id leak: '+group.id); process.exit(1); }" "$TMP_DIR/boot-group.json" "$TMP_DIR/boot-personal.json" \
  && echo "boot_active_session_ids_separate OK" \
  || exit 1

probe="$TMP_DIR/upload-probe.txt"
printf 'upload probe' > "$probe"
upload_code=$(curl -sS -o "$TMP_DIR/upload-no-session.json" -w '%{http_code}' -F "file=@$probe;type=text/plain" "$BASE_URL/ship-cashbox/api/?action=upload-attachment")
case "$upload_code" in
  401|403|415|422) echo "upload_requires_session_or_auth $upload_code" ;;
  *) echo "upload_requires_session_or_auth FAIL $upload_code" >&2; exit 1 ;;
esac

echo "SMOKE_OK $BASE_URL $SHELL_VERSION"
