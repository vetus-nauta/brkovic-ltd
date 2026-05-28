# Frontend NavDesk Small Calculator I18N Alias - 2026-05-28

**Task:** `BRK-MVP-FE-019`  
**Owner:** Director-run frontend implementation  
**Status:** For Review

## Summary

Connected the legacy NavDesk small-calculator runtime labels to existing public dictionary keys.

This was a narrow alias layer only. The old internal `js/navdesk.js` dictionary remains as fallback.

No formulas, calculations, tide safe-window conclusions, route logic, GPS statuses, watch documents, UKV/radio output, NavDesk disclaimer, print/PDF wording, production files or future language availability were changed.

## Changed File

```text
js/navdesk.js
```

## Implemented

Added `navdeskSmallCalcAliases` so old internal runtime keys can resolve through existing `lang/en.json` and `lang/ru.json` keys first:

- `journal_calc_status_idle`
- `journal_calc_status_not_enough`
- `journal_calc_status_done`
- `journal_calc_status_invalid`
- `journal_calc_copy_done`
- `journal_calc_copy_empty`
- `journal_calc_summary_time`
- `journal_calc_summary_days`
- `journal_calc_summary_hours`
- `journal_calc_summary_minutes`
- `journal_calc_summary_distance`
- `journal_calc_summary_fuel`
- `journal_calc_summary_with_reserve`
- `navdesk_window_intro`
- `navdesk_window_status_idle`
- `navdesk_table_empty`
- `navdesk_tides_placeholder`

## Gates

Passed:

```text
node --check js/navdesk.js
node --check tools/i18n-diagnostics.mjs
JSON parse: lang/en.json, lang/ru.json
node tools/i18n-diagnostics.mjs --markdown --out docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md
git diff --check
```

Diagnostic result after this layer:

```text
missing keys: none
dictionary drift: none
broken pages: none
js/navdesk.js referenced keys: 42
total referenced keys: 780
```

## Browser Smoke

Local server:

```text
php -S 127.0.0.1:4182 -t .
```

Checked with headless Chrome:

- `navdesk.html?lang=en`
- `navdesk.html?lang=ru`

Observed:

- EN: `<html lang="en" ... data-language-source="query">`
- RU: `<html lang="ru" ... data-language-source="query">`
- EN screen mode label: `Screen mode`
- RU screen mode label: `Режим экрана`
- EN small calculator status: `Enter any known values.`
- RU small calculator status: `Введите любые известные значения.`
- EN small calculator day label: `Time, d`
- RU small calculator day label: `Время, сут`
- EN copy button: `Copy summary`
- RU copy button: `Копировать итог`
- EN language panel title: `Language versions`
- RU language panel title: `Языковые версии`

## Notes

This does not approve any larger NavDesk localization. `LOC-010` still protects radio, route/tide formulas, watch documents, GPS statuses and print/PDF output from broad translation work.
