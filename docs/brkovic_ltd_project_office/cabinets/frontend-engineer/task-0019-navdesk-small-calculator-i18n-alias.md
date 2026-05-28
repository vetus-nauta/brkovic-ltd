# Task 0019 - NavDesk Small Calculator I18N Alias

**Task ID:** `BRK-MVP-FE-019`  
**Owner chat:** `CHAT-BRK-FE-IMPL-001`  
**Assigned:** 2026-05-28  
**Status:** Assigned

## Context

`LOC-010` allows a narrow NavDesk frontend slice: connect the old small-calculator runtime labels to existing dictionary keys.

This is not a NavDesk redesign and not a broad NavDesk localization sweep.

## Scope

Allowed file:

- `js/navdesk.js`

Allowed behavior:

- map old internal runtime keys to existing public dictionary keys:
  - `journal_calc_status_*`
  - `journal_calc_summary_*`
  - `navdesk_window_intro`
  - `navdesk_window_status_idle`
  - `navdesk_table_empty`
  - `navdesk_tides_placeholder`
- keep the old internal dictionary as fallback.

Out of scope:

- formulas;
- route calculations;
- tide safe-window conclusions;
- GPS statuses;
- watch-log statuses and documents;
- UKV generated radio output;
- NavDesk disclaimer;
- print/PDF wording;
- future languages.

## Acceptance Criteria

1. Existing EN/RU text remains the same.
2. `js/navdesk.js` syntax passes.
3. I18N diagnostics stay green.
4. Browser smoke confirms the NavDesk small calculator status/summary switches EN/RU.

## Output

```text
docs/brkovic_ltd_project_office/reports/frontend-navdesk-small-calculator-i18n-alias-2026-05-28.md
```
