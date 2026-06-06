# Ship Cashbox Current Handoff

Updated: 2026-06-07
Project: `brkovic.ltd`, Ship Cashbox / Судовой журнал only.
Current WebStorm/test copy: `/home/alexey/WebstormProjects/brkovic-ltd`
Current GitHub/source copy: `/home/alexey/GitHub/Revoyacht/brkovic-ltd`
Local runtime checked on: `http://127.0.0.1:18090/ship-cashbox/index.html`

## First Message For The Next Director

Work only on Ship Cashbox / Судовой журнал.

Before changing code, read:

```text
AGENTS.md
PATHS_QUICK.md
docs/ship-cashbox-handoff-current.md
docs/ship-cashbox-etalon-2026-06-06-main-records-ledger.md
docs/ship-cashbox-personal-reports-sprint-28.md
```

Do not touch the main public website, Nav Desk, shared CSS/JS, `css/navdesk.css`, `js/main.js`, `js/seo.js`, language page builders, or non-cashbox pages without explicit permission.

Start with runtime inspection, not edits:

```bash
curl -sS http://127.0.0.1:18090/ship-cashbox/api/?action=storage-health
curl -sS 'http://127.0.0.1:18090/ship-cashbox/api/?action=boot&mode=personal'
node --check ship-cashbox/assets/app.js
sh ship-cashbox/scripts/smoke-local.sh
```

If browser behavior does not match files, suspect Service Worker cache first. Use:

```text
http://127.0.0.1:18090/ship-cashbox/cache-reset.html?reload=20260606-cashbox-layout-stabilize-104
```

## Current Versions

```text
Front shell: 20260606-cashbox-layout-stabilize-104
SW cache: ship-cashbox-shell-v20260606-230
API: 2026.06.07-ship-cashbox-personal-reports-scope-01
Smoke: SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-104
```

Storage state from earlier handoff remains important:

```text
MongoDB Atlas connected
Database: brkovic_ship_cashbox
Collections: shipCashboxSessions, shipCashboxIndex
jsonStorageDir may still point at the WebStorm/test copy path
```

Do not open or print `.ship-cashbox.env`.

## Current Product State

Accepted as working baseline:

- Main / hall screen.
- Records screen.
- ЖЗ active input screen.
- Ledger attachment sheet.
- Personal report foundation through `Начать отчет`, `Без отчета`, fixed report view/restore, and empty-report guard.
- Trash wording replaces archive in user-facing UI.

Current real local personal state after repair:

```text
active_personal_report_id: report-20260606-220819-bde71fa1
active report title: Личный отчет
server draft length: 0
ready records: 5
unlinked records: 5
```

A previous 550-character active draft was preserved as a standalone `Без отчета` ready record. Do not try to recover it from the textarea; it is now in ready records.

## Latest Implemented Logic

Personal reports:

- `Начать отчет` creates a new active `report_id`.
- Before starting a report, any existing treasurer draft is preserved as a standalone ready record with `record_scope: free`.
- The new report opens a clean ЖЗ input.
- ЖЗ header shows the active report title when a personal report is active.
- Submitting ЖЗ while a personal report is active sends `report_id` and `record_scope: report`.
- `+` lines are income.
- `-` lines are expense.
- Unsigned numeric lines are disputed and do not enter arithmetic.
- `Поступления`, `Расходы`, `Текущий баланс` are summaries/navigation, not separate input forms.

Report switcher / records focus:

- Report arithmetic uses `active_personal_report_id`.
- Visual records focus is separate: selected report or `Без отчета`.
- Selecting a report emphasizes records attached to that report.
- Selecting `Без отчета` emphasizes standalone records and fades report-linked records.
- `Закрепить отчет` is not shown in the generic report footer.
- `Закрепить отчет` appears only on a concrete active report card with `record_count > 0` or `entry_count > 0`.
- API rejects fixing an empty report with `409`.
- Fixed report can be viewed without changing active arithmetic.
- Fixed report can be restored to active by explicit action.

## Open Items For The Next Session

Do these one block at a time, with smoke/check after each block:

1. Real user flow test in browser:

```text
Начать отчет -> clean ЖЗ -> enter + / - lines -> fix record -> report card shows counts/totals -> закрепить -> view fixed -> restore
```

2. Verify report card highlighting:

```text
selected report: its records bright, other report/free records quieter
Без отчета: standalone records bright, report records quieter
```

3. Decide what to do with empty test reports currently in local data:

```text
Claudia Z
Личный отчет
```

Possible future action: add `Удалить пустой отчет` for active empty reports. Do not fake this through session trash.

4. Verify that a newly submitted report record becomes:

```text
record_scope: report
report_id: active report id
```

5. Do not add a separate input form for `Поступления`. Income is entered in ЖЗ using `+`.

## Layout Discipline

Current layout discipline is strict:

- Do not add another CSS patch layer over broken old rules.
- `ship-cashbox/assets/ui-contract.css` is the active layout contract for the repaired Ship Cashbox screens.
- `ship-cashbox/assets/app.css` still contains older/base styles. Use it carefully; prefer reducing conflicts, not stacking overrides.
- Keep Records screen as card spacing/tone baseline.
- Keep ЖЗ input field safe: do not replace the textarea with a complex editor unless explicitly approved.
- Group mode is fragile. Do not change group arithmetic or group navigation while repairing personal reports unless the block explicitly requires group sync.

## Boundaries

Never cross these without explicit permission:

```text
main public site
Nav Desk
css/navdesk.css
js/main.js
js/seo.js
index/navdesk/html
build-language-pages
.ship-cashbox.env
```

Do not run broad copy/mirror/revert. Sync only named touched files.

## Files To Inspect First

Runtime:

```text
ship-cashbox/index.html
ship-cashbox/assets/app.js
ship-cashbox/assets/app.css
ship-cashbox/assets/ui-contract.css
ship-cashbox/api/index.php
ship-cashbox/sw.js
ship-cashbox/cache-reset.html
ship-cashbox/scripts/smoke-local.sh
lang/ru.json
```

Docs:

```text
docs/ship-cashbox-handoff-current.md
docs/ship-cashbox-etalon-2026-06-06-main-records-ledger.md
docs/ship-cashbox-personal-reports-sprint-28.md
```

## Working From Another PC

Clone or pull the GitHub repo, then from repo root:

```bash
php -S 127.0.0.1:18090 -t .
```

Open:

```text
http://127.0.0.1:18090/ship-cashbox/cache-reset.html?reload=20260606-cashbox-layout-stabilize-104
```

Then run:

```bash
node --check ship-cashbox/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8')); console.log('ru json ok')"
sh ship-cashbox/scripts/smoke-local.sh
```

If MongoDB/Atlas credentials are not present on the new PC, do not invent secrets and do not print env files. Use existing project setup instructions or ask the owner.

## Sync Note For Returning To This PC

When returning to this PC, sync GitHub/source copy and WebStorm/test copy deliberately:

1. Pull/update `/home/alexey/GitHub/Revoyacht/brkovic-ltd`.
2. Copy only touched Ship Cashbox files into `/home/alexey/WebstormProjects/brkovic-ltd`.
3. Run smoke in WebStorm/test copy.
4. Open cache reset.

Do not overwrite unrelated dirty work in either copy.
