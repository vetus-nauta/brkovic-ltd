# Ship Cashbox Sprint 28: Personal Reports

Date: 2026-06-06
Baseline: `20260606-cashbox-layout-stabilize-97`
API: `2026.06.06-ship-cashbox-strict-signed-lines-03`
Scope: Ship Cashbox only. Do not touch main site, Nav Desk, shared CSS/JS, or `.ship-cashbox.env`.

## Goal

Rebuild personal accounting around explicit reports instead of one global personal total.

A personal record is not automatically part of report arithmetic. It keeps its own local `+ / -` math, but enters report totals only after the user starts/selects a report and attaches/fixes the record into that report.

## Approved Terms

- `Входящий баланс`: opening amount at the start of a report.
- `Поступления`: valid `+` entries inside the selected report.
- `Расходы`: valid `-` entries inside the selected report.
- `Текущий баланс`: incoming balance + income - expenses for the selected report.
- `Начать отчет`: create a new active report period.
- `Закрепить отчет`: close/fix the selected report.
- `Активные отчеты`: open report switcher.
- `Самостоятельная запись`: record not attached to a report.

Avoid `остаток` as a primary label in personal reports. It can remain only as explanatory copy if needed.

## Current Check

Smoke passed before sprint start:

```text
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-97
```

Existing foundation:

- API already normalizes `report_id` on entries and batches.
- API already has `record_scope`: `free`, `report`, `excluded`.
- API already has `personal_reports` on sessions.
- Active journal template is accepted in `docs/ship-cashbox-active-journal-template-2026-06-06.md`.

Current mismatch:

- UI still uses old personal labels: `Получено`, `Остаток`.
- Personal command deck and reports window read session-wide `totals`.
- `compute_totals()` still aggregates valid entries across the session model.
- There is no selected active report state in the UI.
- There is no report switcher replacing the current records counter card.

## Target Behavior

The personal main screen shows numbers for the selected report only.

The right-side card becomes a report switcher:

```text
Активные отчеты
[Selected report]
[+ Начать отчет]
```

When a report is selected, metric cards open their source data:

- `Входящий баланс`: opens report start/balance details.
- `Поступления`: opens `+` entries in the selected report.
- `Расходы`: opens `-` entries in the selected report.
- `Текущий баланс`: opens the full report log.
- `Активные отчеты`: opens the report switcher.
- `Самостоятельные записи`: opens records outside reports.

No dead ends:

- If there are no reports, show `Начать отчет`.
- If there are unlinked records, suggest starting/selecting a report and attaching them.
- If a metric needs a report but none is selected, offer `Выбрать отчет` and `Начать отчет`.

## Record Visual States

Use the same record card template with state classes:

- `active-report`: attached to the selected active report; full contrast and normal shadow.
- `other-report`: attached to another open report; second-plan surface, lower contrast, click switches report.
- `unlinked`: independent record outside reports; neutral label `Без отчета`.
- `closed-report`: belongs to a fixed report; normally shown through fixed report/log view.

Do not use heavy transparency for second-plan cards; it looks disabled. Use softer background, less shadow, and muted text.

## Implementation Order

1. Data contract layer.
   Define report object shape, selected report id, report status, incoming balance, period start/end, record counts, and totals.

2. API calculation layer.
   Add selected-report totals without breaking existing group `compute_totals()`.

3. Personal UI labels.
   Rename personal labels to `Входящий баланс`, `Поступления`, `Расходы`, `Текущий баланс`, `Начать отчет`.

4. Report switcher.
   Replace personal records counter behavior with active report switcher and no-dead-end `Начать отчет` path.

5. Record attachment flow.
   Default records stay `free`. Attach/fix changes `record_scope` to `report` and assigns `report_id`.

6. Record card states.
   Apply `active-report`, `other-report`, `unlinked`, `closed-report` visual states.

7. Fixed report flow.
   `Закрепить отчет` closes report, removes active cards from normal active list, keeps report log accessible.

8. QA and smoke.
   Add parser, report totals, mode isolation, group regression, and trash/recovery checks.

## Assignments

- Engine: API/data model, report totals, attach/detach/fix endpoints, migration safety.
- JS: selected report state, report switcher, personal render paths, no-dead-end actions.
- CSS/UX: report switcher, record visual states, metric drill-down layout, keep group ledger etalon intact.
- QA: personal reports matrix, ЖЗ template regression, group mode isolation, smoke additions.

## Hard Boundaries

- Do not fork active journal parsing between personal and group.
- Do not change group settlement arithmetic while implementing personal reports.
- Do not make standalone records silently affect report totals.
- Do not hide unlinked records; show them as `Самостоятельные записи`.
- Do not use old `Получено` as opening balance label.
- Do not touch main site/Nav Desk/shared CSS/JS without explicit approval.

## Inspection Intake

Engine confirmed:

- `report_id`, `record_scope`, `personal_reports`, `cashbox_series_id`, `carryover_from_report_id`, and `opening_balance_source` already exist as partial foundation.
- Missing layer: normalized report shape, report CRUD/status endpoints, active report selection, attach/detach records, close/carryover report.
- Migration risk: old personal data has no report assignment; it must be treated as free records or explicitly migrated into a default report.
- Opening balance is currently stored as treasurer `cashbox_contribution`; sprint must separate display semantics from real incoming report balance.

JS confirmed:

- Owner ЖЗ is one shared template for personal and group.
- Personal dashboard currently renders API `session.totals`, so selected report totals must come from server or a dedicated payload field.
- Needed frontend state: `activePersonalReportId` and report/free/archive view.
- Report binding must not be stored only in raw notebook text; metadata must stay server-side.

CSS/UX confirmed:

- Use new personal-scoped report state classes instead of changing group ready-record classes globally.
- Do not use heavy opacity for inactive report cards.
- Keep group ledger etalon intact.

QA confirmed:

- Add tests for plus/minus grammar, selected report totals, unlinked records, report switcher, group regression, mode isolation, and trash restore.
- Existing smoke remains the first gate before and after changes.

## Block 1 Check: Data Contract

Completed: 2026-06-06
API version: `2026.06.06-ship-cashbox-personal-reports-contract-01`

Implemented:

- Normalized `personal_reports[]` shape.
- Normalized report status: `active`, `fixed`, `deleted`.
- Added report fields: `opening_balance`, `incoming_balance`, `income_total`, `expense_total`, `current_balance`, `record_count`, `entry_count`, period fields, carryover fields, timestamps.
- Added session fields in treasurer payload: `cashbox_series_id`, `carryover_from_report_id`, `opening_balance_source`, `active_personal_report_id`, `personal_reports`.
- Added smoke assertion for personal report contract in personal boot payload.

Not changed:

- No UI/CSS changes.
- No report switcher yet.
- No totals filtering yet.
- No automatic migration/assignment of old records.
- No group arithmetic changes.

Verification:

```text
node --check ship-cashbox/assets/app.js
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-97
boot_personal_reports_contract OK
```

## Block 2 Check: Report-Scoped Totals

Completed: 2026-06-06
API version: `2026.06.06-ship-cashbox-personal-reports-totals-01`

Implemented:

- Added `compute_personal_report_summary()` without changing group `compute_totals()`.
- Added payload field `session.personal_report_summary`.
- Report totals are calculated only from entries with matching `report_id` and report scope/state.
- Unlinked personal entries are collected separately under `personal_report_summary.unlinked`.
- Active report totals are exposed under `personal_report_summary.active_report_totals`.
- `session.personal_reports` in payload now carries calculated totals for each report.
- Smoke now validates report totals shape and balance formula.

Current local personal boot result:

```text
active_personal_report_id: null
personal_reports: 0
unlinked.record_count: 4
unlinked.entry_count: 6
unlinked.income_total: 680
unlinked.expense_total: 1046
unlinked.current_balance: -366
```

This is expected: old personal records are not silently attached to a report.

Not changed:

- No UI/CSS changes.
- No report creation endpoint yet.
- No report switcher yet.
- No automatic migration/assignment of old records.
- No group arithmetic changes.
- Existing `session.totals` remains unchanged for current UI compatibility.

Verification:

```text
node --check ship-cashbox/assets/app.js
boot_personal_report_totals OK
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-97
```

## Block 2A Check: Start Personal Report API

Completed: 2026-06-06
API version: `2026.06.06-ship-cashbox-personal-reports-start-01`

Implemented:

- Added owner-only endpoint: `start-personal-report`.
- Endpoint creates an active personal report and sets `active_personal_report_id`.
- Accepted fields: `id`/`session_id`, `title`, `opening_balance`/`incoming_balance`, `period_start`/`opened_at`, `opening_balance_source`, `carryover_from_report_id`.
- Added `dry_run` mode for smoke and safe inspection without writing to storage.
- Smoke validates that dry-run creates report payload and preserves balance formula.

Not changed:

- No UI/CSS changes.
- No report switcher yet.
- No record attachment yet.
- No automatic migration/assignment of old records.
- No group arithmetic changes.

Verification:

```text
node --check ship-cashbox/assets/app.js
start_personal_report_dry_run 200
start_personal_report_contract OK
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-97
```

Post-smoke real boot check:

```text
active_personal_report_id: null
personal_reports: 0
unlinked.record_count: 4
unlinked.entry_count: 6
```

This confirms smoke did not mutate the current local personal data.

## Block 3 Check: Personal UI Labels And Start Report Entry

Completed: 2026-06-06
Front version: `20260606-cashbox-layout-stabilize-98`
SW cache: `ship-cashbox-shell-v20260606-224`
API version: `2026.06.06-ship-cashbox-personal-reports-start-01`

Implemented:

- Personal UI labels changed to approved terms:
  - `Входящий баланс`
  - `Поступления`
  - `Расходы`
  - `Текущий баланс`
  - `Начать отчет`
- Personal main metrics now read `personal_report_summary.active_report_totals` instead of old session-wide totals.
- If no active report exists, personal metrics show report-scoped zero values and the records card reads `Самостоятельные записи`.
- Personal reports window now has an empty state with fields for report title and incoming balance plus `Начать отчет` action.
- `Начать отчет` UI calls API endpoint `start-personal-report` and returns to the reports window after success.
- Personal settings copy no longer says that opening money is configured as `Получено`; report incoming balance belongs to report start.
- Smoke now checks new personal UI labels and the `start-personal-report` JS hook.

Not changed:

- No CSS redesign of report switcher yet.
- No record attachment to report yet.
- No report list/switcher yet.
- No automatic migration of old records.
- No group UI/arithmetic changes.

Verification:

```text
node --check ship-cashbox/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8'))"
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-98
```

Post-smoke real boot check:

```text
active_personal_report_id: null
personal_reports: 0
unlinked_records: 4
```

The smoke dry-run did not mutate current local personal data.

## Block 4 Check: Personal Report Switcher

Completed: 2026-06-06
Front version: `20260606-cashbox-layout-stabilize-99`
SW cache: `ship-cashbox-shell-v20260606-225`
API version: `2026.06.06-ship-cashbox-personal-reports-switcher-01`

Implemented:

- Added owner-only API endpoint: `select-personal-report`.
- Added personal report switcher renderer in the `Создание отчетов` window.
- Personal main right metric now shows `Активные отчеты` and opens the reports window.
- Added visual states for report cards:
  - `shipcashbox-record-state--active-report`
  - `shipcashbox-record-state--other-report`
  - `shipcashbox-record-state--unlinked`
  - `shipcashbox-record-state--closed-report`
- Added personal-scoped CSS for report cards in `ui-contract.css` without changing group submitted-record styles.
- Added switcher copy and smoke markers.

Current behavior:

- If there are no active reports, the switcher shows an empty state and `Начать отчет`.
- If active reports exist, the selected report is full-contrast; other open reports are second-plan cards.
- Самостоятельные записи are shown as a separate unlinked state and do not affect selected report totals.
- Fixed reports have a closed-report visual state but no full fixed-report workflow yet.

Not changed:

- No record attachment to report yet.
- No migration of old records.
- No fixed report closing workflow yet.
- No group UI/arithmetic changes.

Verification:

```text
node --check ship-cashbox/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8'))"
select_personal_report_requires_id 422
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-99
```

Post-smoke real boot check:

```text
active_personal_report_id: null
personal_reports: 0
active_reports: 0
unlinked_records: 4
```

The smoke dry-run did not mutate current local personal data.

## Block 5 Check: Attach Personal Record To Report

Completed: 2026-06-06
Front version: `20260606-cashbox-layout-stabilize-100`
SW cache: `ship-cashbox-shell-v20260606-226`
API version: `2026.06.06-ship-cashbox-personal-reports-attach-01`

Implemented:

- Added owner-only API endpoint: `attach-personal-record`.
- Endpoint attaches one ready record batch to selected/active personal report.
- Attached batch receives `report_id` and `record_scope: report`.
- Valid financial entries inside the batch receive `accounting_state: report` and the same `report_id`.
- Disputed/excluded entries remain disputed/excluded and do not enter report arithmetic.
- Personal ready-record cards now show `В отчет` only when an active report exists and the batch is still unlinked.
- Added personal-scoped CSS for the attach action.
- Added smoke markers and safe 422 check for missing `batch_id`.

Not changed:

- No automatic migration of old records.
- No bulk attach.
- No detach/move flow yet.
- No fixed report close flow yet.
- No group UI/arithmetic changes.

Verification:

```text
node --check ship-cashbox/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8'))"
attach_personal_record_requires_batch 422
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-100
```

Post-smoke real boot check:

```text
active_personal_report_id: null
personal_reports: 0
unlinked_records: 4
all existing batches: record_scope=free, report_id=null
```

The smoke did not mutate current local personal data.

## Block 6 Check: Fix Personal Report

Completed: 2026-06-06
Front version: `20260606-cashbox-layout-stabilize-101`
SW cache: `ship-cashbox-shell-v20260606-227`
API version: `2026.06.06-ship-cashbox-personal-reports-fix-01`

Implemented:

- Added owner-only API endpoint: `fix-personal-report`.
- Endpoint marks selected active personal report as `fixed`, sets `period_end`, `closed_at`, `fixed_at`, and removes it from `active_personal_report_id`.
- Fixed report id is stored as `carryover_from_report_id` for the next report chain.
- Added `Закрепить отчет` action in the personal reports window when an active report exists.
- Fixed-report ready records are hidden from the active personal records list.
- Fixed reports remain visible in the reports window as closed-report cards.
- Group mode is not changed; filtering applies only to personal mode.

Not changed:

- No detach/move flow yet.
- No restore fixed report to active flow yet.
- No automatic creation of the next report after fixing.
- No migration of old records.
- No group UI/arithmetic changes.

Verification:

```text
node --check ship-cashbox/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8'))"
fix_personal_report_requires_report 409
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-101
```

Post-smoke real boot check:

```text
version: 2026.06.06-ship-cashbox-personal-reports-fix-01
active_personal_report_id: null
personal_reports: 0
unlinked_records: 4
```

The smoke used dry-run checks and did not mutate current local personal data.

## Block 7 Check: View And Restore Fixed Personal Report

Completed: 2026-06-06
Front version: `20260606-cashbox-layout-stabilize-102`
SW cache: `ship-cashbox-shell-v20260606-228`
API version: `2026.06.06-ship-cashbox-personal-reports-restore-01`

Implemented:

- Added compact actions next to fixed personal report cards.
- `Посмотреть отчет` opens the fixed report in the reports window without changing `active_personal_report_id`.
- Fixed report preview shows its own totals and entries, with an explicit fixed-report notice.
- Added owner-only API endpoint: `restore-personal-report`.
- Restore changes a fixed report back to `active`, clears fixed/closed timestamps, and makes it the active personal report.
- Restored report records return to the active personal records list because fixed-record filtering no longer applies.
- Group mode is not changed.

Not changed:

- No detach/move record flow yet.
- No report deletion/trash flow for individual reports yet.
- No automatic next-report creation after fixing.
- No migration of old records.

Verification:

```text
node --check ship-cashbox/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8'))"
restore_personal_report_requires_report 422
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-102
```

Post-smoke real boot check:

```text
version: 2026.06.06-ship-cashbox-personal-reports-restore-01
active_personal_report_id: null
personal_reports: 0
fixed_reports: 0
unlinked_records: 4
```

The smoke used dry-run checks and did not mutate current local personal data.

## Block 8 Check: Report Scope And Empty Fix Guard

Completed: 2026-06-07
Front version: `20260606-cashbox-layout-stabilize-103`
SW cache: `ship-cashbox-shell-v20260606-229`
API version: `2026.06.07-ship-cashbox-personal-reports-scope-01`

Implemented:

- `Начать отчет` now creates an active `report_id` and immediately opens the journal input screen.
- Personal journal input header shows the active report title when a report is active.
- Added visual record focus independent from report arithmetic: selected report or `Без отчета`.
- Added `Без отчета` item in the personal reports switcher.
- Ready-record cards now highlight records for the selected report scope; unrelated report cards become second-plan.
- When `Без отчета` is selected, unlinked records are emphasized and report-linked records become second-plan.
- `Закрепить отчет` was removed from the generic report window footer.
- `Закрепить отчет` is now shown on a concrete active report card only when that report has records or entries.
- Server-side guard rejects fixing an empty report with `409`, so hidden UI cannot be bypassed by API.
- Group mode is not changed.

Not changed:

- No real-data attach/fix/restore mutation was performed by the smoke.
- No report deletion/trash flow for individual reports yet.
- No automatic migration of old records.
- No group arithmetic or layout changes.

Verification:

```text
node --check ship-cashbox/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8'))"
fix_personal_report_requires_report 409
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-103
```

Post-smoke real boot check:

```text
version: 2026.06.07-ship-cashbox-personal-reports-scope-01
active_personal_report_id: report-20260606-215454-24b21470
active report title: Claudia Z
active report records: 0
active report entries: 0
unlinked_records: 4
```

The local active report is empty, and the new API guard prevents fixing it.

## Block 9 Check: Clean Journal Start For New Report

Completed: 2026-06-07
Front version: `20260606-cashbox-layout-stabilize-104`
SW cache: `ship-cashbox-shell-v20260606-230`
API version: `2026.06.07-ship-cashbox-personal-reports-scope-01`

Implemented:

- Starting a personal report no longer opens the previous active notebook text.
- If a treasurer draft exists before `Начать отчет`, it is preserved first as a standalone `Без отчета` ready record.
- After preserving the old draft, the new report opens a clean journal input.
- Treasurer notebook save now sends the active personal `report_id` and `record_scope: report`, so newly submitted lines belong to the active report.
- Existing standalone drafts are preserved as `record_scope: free` before starting a new report.
- Group mode is not changed.

Real local data repair performed:

- Existing server draft length before repair: `550`.
- It was preserved as a standalone `Без отчета` ready record.
- Ready records count changed from `4` to `5`.
- Server draft length after repair: `0`.
- Active report stayed: `report-20260606-220819-bde71fa1`.

Verification:

```text
node --check ship-cashbox/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('lang/ru.json','utf8'))"
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-104
```

Post-repair boot check:

```text
version: 2026.06.07-ship-cashbox-personal-reports-scope-01
active_personal_report_id: report-20260606-220819-bde71fa1
draft_len: 0
ready_records: 5
unlinked_records: 5
```
