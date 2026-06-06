#!/bin/sh
set -eu

BASE_URL="${BASE_URL:-http://127.0.0.1:18090}"
SHELL_VERSION="${SHELL_VERSION:-20260606-cashbox-layout-stabilize-104}"
API_VERSION="${API_VERSION:-2026.06.07-ship-cashbox-personal-reports-scope-01}"
SW_CACHE="${SW_CACHE:-ship-cashbox-shell-v20260606-230}"
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
fetch language_js "$BASE_URL/js/language.js?v=20260605-language-api-01" "$TMP_DIR/language.js"
fetch lang_ru "$BASE_URL/lang/ru.json" "$TMP_DIR/ru.json"
fetch api_me "$BASE_URL/ship-cashbox/api/?action=me" "$TMP_DIR/me.json"
fetch storage_health "$BASE_URL/ship-cashbox/api/?action=storage-health" "$TMP_DIR/storage-health.json"
fetch account_workspaces "$BASE_URL/ship-cashbox/api/?action=account-workspaces" "$TMP_DIR/account-workspaces.json"

contains html_version "$SHELL_VERSION" "$TMP_DIR/index.html"
contains html_brand_header "navdesk-header-card" "$TMP_DIR/index.html"
contains html_guest_menu "cashboxGuestMenuButton" "$TMP_DIR/index.html"
contains html_menu_start "cashboxMenuStart" "$TMP_DIR/index.html"
contains html_workspace_close "workspaceCloseButton" "$TMP_DIR/index.html"
contains html_active_journal "cashboxMenuActiveJournal" "$TMP_DIR/index.html"
contains html_language_x "shipcashbox-language-modal__close" "$TMP_DIR/index.html"
contains html_attachment_documents "attachmentDocumentsButton" "$TMP_DIR/index.html"
contains html_attachment_choice "shipcashbox-attach-choice" "$TMP_DIR/index.html"
contains html_attachment_svg "assets/attach-gallery.svg" "$TMP_DIR/index.html"
contains js_guest_menu "cashboxGuestMenuButton" "$TMP_DIR/app.js"
contains js_last_mode "LAST_MODE_KEY" "$TMP_DIR/app.js"
contains js_equalizer_history "EQUALIZER_HISTORY_KEY" "$TMP_DIR/app.js"
contains js_equalizer_tool "openEqualizerTool" "$TMP_DIR/app.js"
contains js_main_menu_guard "shipcashbox-body" "$TMP_DIR/main.js"
contains js_crew_rotation "crew-rotation" "$TMP_DIR/app.js"
contains js_rotate_treasurer "rotate-treasurer" "$TMP_DIR/app.js"
contains js_crew_rotation_metrics "crewRotationCrewMetric" "$TMP_DIR/app.js"
contains js_close_audit "buildCloseAudit" "$TMP_DIR/app.js"
if grep -q "draftOwners" "$TMP_DIR/app.js"; then
  echo "js_close_audit_no_undefined_draftOwners FAIL" >&2
  exit 1
else
  echo "js_close_audit_no_undefined_draftOwners OK"
fi
contains js_no_modeless_boot_guard "boot&mode=" "$TMP_DIR/app.js"
contains js_ready_records "renderCashboxReadyRecordsPanel" "$TMP_DIR/app.js"
contains js_recovery_log "appendRecoveryLog" "$TMP_DIR/app.js"
contains js_update_copy "защищенном сервере" "$TMP_DIR/app.js"
contains js_account_foundation "shipCashboxAccountFoundation" "$TMP_DIR/app.js"
contains js_personal_disputed_parser "accountingState: \"disputed\"" "$TMP_DIR/app.js"
contains js_accounting_line_normalizer "normalizeNotebookAccountingLine" "$TMP_DIR/app.js"
contains js_accounting_malformed_signed "malformedSignedMatch" "$TMP_DIR/app.js"
contains js_accounting_invalid_number "invalidNumberMatch" "$TMP_DIR/app.js"
contains js_attachment_documents "openWorkspaceModal(\"documents\")" "$TMP_DIR/app.js"
contains js_scan_receipt_signed_default "signedAmount" "$TMP_DIR/app.js"
contains js_journal_placeholder "journalNotebookPlaceholder" "$TMP_DIR/app.js"
contains js_journal_dispute_notice "journalDisputeNotice" "$TMP_DIR/app.js"
contains js_journal_dispute_items "renderJournalDisputeItems" "$TMP_DIR/app.js"
contains js_trash_record_log "openTrashRecordLog" "$TMP_DIR/app.js"
contains js_trash_record_open "open-trash-record-btn" "$TMP_DIR/app.js"
contains js_personal_reports_title "personalReportsWorkspaceTitle" "$TMP_DIR/app.js"
contains js_start_personal_report "start-personal-report" "$TMP_DIR/app.js"
contains js_select_personal_report "select-personal-report" "$TMP_DIR/app.js"
contains js_attach_personal_record "attach-personal-record" "$TMP_DIR/app.js"
contains js_fix_personal_report "fix-personal-report" "$TMP_DIR/app.js"
contains js_restore_personal_report "restore-personal-report" "$TMP_DIR/app.js"
contains js_view_fixed_personal_report "data-view-fixed-personal-report" "$TMP_DIR/app.js"
contains js_personal_record_focus "personalRecordFocus" "$TMP_DIR/app.js"
contains js_personal_no_report_scope "PERSONAL_RECORD_SCOPE_UNLINKED" "$TMP_DIR/app.js"
contains js_start_report_preserves_old_draft "record_scope: \"free\"" "$TMP_DIR/app.js"
contains js_notebook_report_context "activePersonalReportIdForNotebook" "$TMP_DIR/app.js"
contains js_filter_fixed_report_records "visibleNotebookBatchesForActiveList" "$TMP_DIR/app.js"
contains js_personal_report_summary "personal_report_summary" "$TMP_DIR/app.js"
contains js_personal_report_switcher "renderPersonalReportSwitcher" "$TMP_DIR/app.js"
contains js_report_signed_amount "displayMoney(Number(entry.amount" "$TMP_DIR/app.js"
contains js_personal_snapshot_title "personalSnapshotTitle" "$TMP_DIR/app.js"
contains js_personal_settings_title "personalJournalTitleLabel" "$TMP_DIR/app.js"
contains language_api "BRKOVIC_LANGUAGE" "$TMP_DIR/language.js"
contains language_options "Deutsch" "$TMP_DIR/language.js"
contains lang_ru_trash "\"archiveTitle\": \"Корзина\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_reports "\"personalReportsWorkspaceTitle\": \"Создание отчетов\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_opening "\"personalOpeningBalance\": \"Входящий баланс\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_income "\"personalIncomeLabel\": \"Поступления\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_balance "\"personalBalanceLabel\": \"Текущий баланс\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_start_report "\"personalStartReport\": \"Начать отчет\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_active_reports "\"personalActiveReportsTitle\": \"Активные отчеты\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_report_selected "\"personalReportSelected\": \"Отчет выбран.\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_no_report_scope "\"personalNoReportScope\": \"Без отчета\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_report_input_hint "\"personalReportRecordInputHint\": \"Запись будет привязана" "$TMP_DIR/ru.json"
contains lang_ru_personal_fix_report "\"personalFixReport\": \"Закрепить отчет\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_restore_report "\"personalRestoreReport\": \"Вернуть в активные\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_view_fixed_report "\"personalViewFixedReport\": \"Посмотреть отчет\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_attach_record "\"personalAttachRecord\": \"В отчет\"" "$TMP_DIR/ru.json"
contains lang_ru_signed_hint "Суммы без знака остаются спорными" "$TMP_DIR/ru.json"
contains lang_ru_signed_space_hint "один пробел после знака убирается" "$TMP_DIR/ru.json"
contains lang_ru_personal_snapshot "\"personalSnapshotTitle\": \"Сейчас в журнале\"" "$TMP_DIR/ru.json"
contains lang_ru_personal_settings "\"personalJournalTitleLabel\": \"Название журнала\"" "$TMP_DIR/ru.json"
contains lang_ru_crew_rotation_metric "\"crewRotationCrewMetric\": \"Экипаж\"" "$TMP_DIR/ru.json"
if grep -q "Сколько денег было\\|Остаток, приходы" "$TMP_DIR/app.js" "$TMP_DIR/ru.json"; then
  echo "old_personal_copy FAIL" >&2
  exit 1
else
  echo "old_personal_copy OK"
fi
if grep -q "начальный остаток" "$TMP_DIR/app.js" "$TMP_DIR/ru.json"; then
  echo "old_personal_settings_copy FAIL" >&2
  exit 1
else
  echo "old_personal_settings_copy OK"
fi
contains css_personal_quiet "shipcashbox-personal-quiet" "$TMP_DIR/app.css"
contains css_brand_header "Reuse the real Nav Desk header" "$TMP_DIR/app.css"
contains css_equalizer_board "shipcashbox-equalizer-board" "$TMP_DIR/app.css"
contains css_crew_rotation "shipcashbox-rotation-card" "$TMP_DIR/app.css"
contains css_close_audit "shipcashbox-close-audit" "$TMP_DIR/app.css"
contains ui_css_workspace_contract "Sprint Layout B final bounded active-screen geometry contract" "$TMP_DIR/ui-contract.css"
contains ui_css_workspace_width "cashbox-work-width" "$TMP_DIR/ui-contract.css"
contains ui_css_loading_guard "data-cashbox-loading-overlay" "$TMP_DIR/ui-contract.css"
contains ui_css_journal_caret "caret-color" "$TMP_DIR/ui-contract.css"
contains ui_css_report_card "shipcashbox-report-card" "$TMP_DIR/ui-contract.css"
contains ui_css_report_card_main "shipcashbox-report-card__main" "$TMP_DIR/ui-contract.css"
contains ui_css_record_state_active "shipcashbox-record-state--active-report" "$TMP_DIR/ui-contract.css"
contains ui_css_record_state_unlinked "shipcashbox-record-state--unlinked" "$TMP_DIR/ui-contract.css"
contains ui_css_attach_record "shipcashbox-submitted-record__attach" "$TMP_DIR/ui-contract.css"
contains ui_css_journal_flow "Ship Cashbox journal flow contract" "$TMP_DIR/ui-contract.css"
contains ui_css_language_glass "Language selector: light glass sheet pinned to the top" "$TMP_DIR/ui-contract.css"
contains ui_css_language_hint_glass "Language auto-hint: detach the legacy inline card from the header" "$TMP_DIR/ui-contract.css"
contains ui_css_attachment_compact "Attachment compact sheet" "$TMP_DIR/ui-contract.css"
contains ui_css_attachment_polished "polished action buttons" "$TMP_DIR/ui-contract.css"
contains ui_css_attachment_image_buttons "Attachment image buttons" "$TMP_DIR/ui-contract.css"
contains ui_css_journal_dispute "Journal input examples and disputed amount marker" "$TMP_DIR/ui-contract.css"
contains ui_css_journal_dispute_items "shipcashbox-journal-dispute__item" "$TMP_DIR/ui-contract.css"
contains ui_css_trash_log "shipcashbox-trash-log__raw" "$TMP_DIR/ui-contract.css"
contains ui_css_trash_session "shipcashbox-trash-session" "$TMP_DIR/ui-contract.css"
contains ui_css_service_install_contract "shipcashbox-install strong" "$TMP_DIR/ui-contract.css"
contains ui_css_service_reset_contract "shipcashbox-card--service-reset" "$TMP_DIR/ui-contract.css"
contains ui_css_documents_compact "shipcashbox-card--documents" "$TMP_DIR/ui-contract.css"
contains ui_css_documents_links "shipcashbox-receipt-link-row" "$TMP_DIR/ui-contract.css"
contains ui_css_crew_rotation_contract "shipcashbox-metrics--rotation" "$TMP_DIR/ui-contract.css"
contains ui_css_settlement_board_contract "shipcashbox-settlement-board" "$TMP_DIR/ui-contract.css"
contains ui_css_settlement_audit_grid "shipcashbox-close-audit__grid" "$TMP_DIR/ui-contract.css"
contains ui_css_night_workscreen_inputs "modal--workscreen input" "$TMP_DIR/ui-contract.css"
contains ui_css_night_select_options "select option" "$TMP_DIR/ui-contract.css"
contains ui_css_night_rotation_text "single-settlement__head strong" "$TMP_DIR/ui-contract.css"
contains ui_css_night_settlement_flow "shipcashbox-settlement-flow__row" "$TMP_DIR/ui-contract.css"
contains ui_css_night_close_audit "shipcashbox-close-audit--warning" "$TMP_DIR/ui-contract.css"
contains ui_css_night_legacy_line "shipcashbox-line strong" "$TMP_DIR/ui-contract.css"
contains sw_cache "$SW_CACHE" "$TMP_DIR/sw.js"
contains sw_attachment_svg "attach-documents.svg" "$TMP_DIR/sw.js"
contains api_version "$API_VERSION" "$TMP_DIR/me.json"
contains storage_health_provider "\"provider\"" "$TMP_DIR/storage-health.json"
contains storage_health_version "$API_VERSION" "$TMP_DIR/storage-health.json"
contains api_personal_reports_scope "ship-cashbox-personal-reports-scope" "$TMP_DIR/me.json"
contains api_personal_reports_scope_health "ship-cashbox-personal-reports-scope" "$TMP_DIR/storage-health.json"
json_expr account_workspaces_version "data.version === '$API_VERSION'" "$TMP_DIR/account-workspaces.json"
json_expr account_workspaces_capability "data.capabilities && data.capabilities.parallel_owner_workspaces === true && data.capabilities.invite_claim_binding === false" "$TMP_DIR/account-workspaces.json"

invite_preview_code=$(curl -sS -o "$TMP_DIR/account-invite-preview-missing.json" -w '%{http_code}' -H 'Content-Type: application/json' -d '{}' "$BASE_URL/ship-cashbox/api/?action=account-invite-preview")
case "$invite_preview_code" in
  422) echo "account_invite_preview_requires_code $invite_preview_code" ;;
  *) echo "account_invite_preview_requires_code FAIL $invite_preview_code" >&2; exit 1 ;;
esac

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
    node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const session=data.session; if (!session) process.exit(0); if (!Object.prototype.hasOwnProperty.call(session, 'active_personal_report_id')) { console.error('active_personal_report_id missing'); process.exit(1); } if (!Array.isArray(session.personal_reports)) { console.error('personal_reports not array'); process.exit(1); } if (!session.cashbox_series_id) { console.error('cashbox_series_id missing'); process.exit(1); } for (const report of session.personal_reports) { const required=['id','title','status','opening_balance','incoming_balance','income_total','expense_total','current_balance','record_count','entry_count','period_start','period_end','opened_at','closed_at','carryover_from_report_id','opening_balance_source','created_at','updated_at']; for (const key of required) { if (!Object.prototype.hasOwnProperty.call(report, key)) { console.error('personal report missing '+key); process.exit(1); } } }" "$out" \
      && echo "boot_personal_reports_contract OK" \
      || exit 1
    node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const session=data.session; if (!session) process.exit(0); const summary=session.personal_report_summary; if (!summary || typeof summary !== 'object') { console.error('personal_report_summary missing'); process.exit(1); } if (summary.active_report_id !== session.active_personal_report_id) { console.error('active report mismatch'); process.exit(1); } if (!Array.isArray(summary.reports) || summary.reports.length !== session.personal_reports.length) { console.error('summary reports mismatch'); process.exit(1); } if (!Array.isArray(summary.active_reports) || !Array.isArray(summary.fixed_reports)) { console.error('summary report lists missing'); process.exit(1); } if (!summary.unlinked || typeof summary.unlinked !== 'object') { console.error('unlinked summary missing'); process.exit(1); } const totals=summary.active_report_totals; if (!totals || typeof totals !== 'object') { console.error('active_report_totals missing'); process.exit(1); } const checkBalance=(label,item)=>{ const opening=Number(item.opening_balance||0); const income=Number(item.income_total||0); const expense=Number(item.expense_total||0); const current=Number(item.current_balance||0); if (Math.abs((opening+income-expense)-current) > 0.011) { console.error(label+' balance formula FAIL'); process.exit(1); } }; checkBalance('active_report_totals', totals); for (const report of summary.reports) checkBalance('report '+report.id, report); if (!summary.active_report_id && summary.active_report !== null) { console.error('active_report should be null without active id'); process.exit(1); }" "$out" \
      && echo "boot_personal_report_totals OK" \
      || exit 1
  fi
done

node -e "const fs=require('fs'); const group=JSON.parse(fs.readFileSync(process.argv[1],'utf8')).session; const personal=JSON.parse(fs.readFileSync(process.argv[2],'utf8')).session; if (group && personal && group.id && personal.id && group.id === personal.id) { console.error('active session id leak: '+group.id); process.exit(1); }" "$TMP_DIR/boot-group.json" "$TMP_DIR/boot-personal.json" \
  && echo "boot_active_session_ids_separate OK" \
  || exit 1

personal_session_id=$(node -e "const fs=require('fs'); const session=JSON.parse(fs.readFileSync(process.argv[1],'utf8')).session; process.stdout.write(session && session.id ? session.id : '');" "$TMP_DIR/boot-personal.json")
if [ -n "$personal_session_id" ]; then
  start_report_code=$(curl -sS -o "$TMP_DIR/start-personal-report-dry-run.json" -w '%{http_code}' -H 'Content-Type: application/json' -d "{\"id\":\"$personal_session_id\",\"dry_run\":true,\"title\":\"Smoke report\",\"opening_balance\":\"120.50\",\"period_start\":\"2026-06-06T00:00:00+00:00\"}" "$BASE_URL/ship-cashbox/api/?action=start-personal-report")
  case "$start_report_code" in
    200) echo "start_personal_report_dry_run $start_report_code" ;;
    *) echo "start_personal_report_dry_run FAIL $start_report_code" >&2; exit 1 ;;
  esac
  json_expr start_personal_report_version "data.version === '$API_VERSION'" "$TMP_DIR/start-personal-report-dry-run.json"
  node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const session=data.session; if (!session) { console.error('missing session'); process.exit(1); } const summary=session.personal_report_summary; if (!summary || !summary.active_report_id || !summary.active_report) { console.error('active report not created'); process.exit(1); } if (session.active_personal_report_id !== summary.active_report_id) { console.error('active id mismatch'); process.exit(1); } const report=summary.active_report; if (report.title !== 'Smoke report') { console.error('title mismatch: '+report.title); process.exit(1); } if (Math.abs(Number(report.opening_balance)-120.5) > 0.011) { console.error('opening balance mismatch: '+report.opening_balance); process.exit(1); } if (Math.abs(Number(report.current_balance)-120.5) > 0.011) { console.error('current balance mismatch: '+report.current_balance); process.exit(1); } if (!Array.isArray(summary.reports) || !summary.reports.find((item)=>item.id===summary.active_report_id)) { console.error('report missing from list'); process.exit(1); }" "$TMP_DIR/start-personal-report-dry-run.json" \
    && echo "start_personal_report_contract OK" \
    || exit 1
  select_report_code=$(curl -sS -o "$TMP_DIR/select-personal-report-missing.json" -w '%{http_code}' -H 'Content-Type: application/json' -d "{\"id\":\"$personal_session_id\",\"dry_run\":true}" "$BASE_URL/ship-cashbox/api/?action=select-personal-report")
  case "$select_report_code" in
    422) echo "select_personal_report_requires_id $select_report_code" ;;
    *) echo "select_personal_report_requires_id FAIL $select_report_code" >&2; exit 1 ;;
  esac
  attach_record_code=$(curl -sS -o "$TMP_DIR/attach-personal-record-missing.json" -w '%{http_code}' -H 'Content-Type: application/json' -d "{\"id\":\"$personal_session_id\",\"dry_run\":true}" "$BASE_URL/ship-cashbox/api/?action=attach-personal-record")
  case "$attach_record_code" in
    422) echo "attach_personal_record_requires_batch $attach_record_code" ;;
    *) echo "attach_personal_record_requires_batch FAIL $attach_record_code" >&2; exit 1 ;;
  esac
  fix_report_code=$(curl -sS -o "$TMP_DIR/fix-personal-report-missing.json" -w '%{http_code}' -H 'Content-Type: application/json' -d "{\"id\":\"$personal_session_id\",\"dry_run\":true}" "$BASE_URL/ship-cashbox/api/?action=fix-personal-report")
  case "$fix_report_code" in
    409|422) echo "fix_personal_report_requires_report $fix_report_code" ;;
    *) echo "fix_personal_report_requires_report FAIL $fix_report_code" >&2; exit 1 ;;
  esac
  restore_report_code=$(curl -sS -o "$TMP_DIR/restore-personal-report-missing.json" -w '%{http_code}' -H 'Content-Type: application/json' -d "{\"id\":\"$personal_session_id\",\"dry_run\":true}" "$BASE_URL/ship-cashbox/api/?action=restore-personal-report")
  case "$restore_report_code" in
    422) echo "restore_personal_report_requires_report $restore_report_code" ;;
    *) echo "restore_personal_report_requires_report FAIL $restore_report_code" >&2; exit 1 ;;
  esac
fi

probe="$TMP_DIR/upload-probe.txt"
printf 'upload probe' > "$probe"
upload_code=$(curl -sS -o "$TMP_DIR/upload-no-session.json" -w '%{http_code}' -F "file=@$probe;type=text/plain" "$BASE_URL/ship-cashbox/api/?action=upload-attachment")
case "$upload_code" in
  401|403|415|422) echo "upload_requires_session_or_auth $upload_code" ;;
  *) echo "upload_requires_session_or_auth FAIL $upload_code" >&2; exit 1 ;;
esac

echo "SMOKE_OK $BASE_URL $SHELL_VERSION"
