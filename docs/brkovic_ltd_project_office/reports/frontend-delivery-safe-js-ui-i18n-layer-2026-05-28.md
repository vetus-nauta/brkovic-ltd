# Frontend Delivery Safe JS UI I18N Layer - 2026-05-28

**Task:** `BRK-MVP-FE-018`  
**Owner:** Director-run frontend implementation  
**Status:** For Review

## Summary

Moved a small exact-text UI layer into EN/RU dictionaries:

- leftover journal comment submitting status;
- delivery calculator crew helper strings;
- delivery calculator speed helper;
- delivery calculator empty-distance summary;
- delivery calculator time/fuel summary fragments.

No rates, formulas, route lookup behavior, service promises, owner prose, SEO, production files, backend, FTP or future language availability were changed.

## Changed Files

```text
js/journal.js
js/delivery-calculator.js
lang/en.json
lang/ru.json
```

## Implemented Keys

Journal:

- `journal_comment_submitting`

Delivery calculator:

- `delivery_calc_crew_12_15`
- `delivery_calc_crew_15_20`
- `delivery_calc_crew_20_25`
- `delivery_calc_crew_40plus`
- `delivery_calc_speed_fact_prefix`
- `delivery_calc_unit_kn`
- `delivery_calc_summary_empty`
- `delivery_calc_unit_hour_short`
- `delivery_calc_summary_fuel_prefix`
- `delivery_calc_summary_fuel_unit`

## Gates

Passed:

```text
node --check js/journal.js
node --check js/delivery-calculator.js
node --check tools/i18n-diagnostics.mjs
JSON parse: lang/en.json, lang/ru.json
node tools/i18n-diagnostics.mjs --markdown --out docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md
```

Diagnostic result:

```text
missing keys: none
dictionary drift: none
broken pages: none
js/delivery-calculator.js referenced keys: 17
js/journal.js referenced keys: 52
total referenced keys: 768
```

## Browser Smoke

Local server:

```text
php -S 127.0.0.1:4181 -t .
```

Checked with headless Chrome:

- `journal.html?lang=en`
- `journal.html?lang=ru`
- `services/yacht-acceptance-delivery.html?lang=en`
- `services/yacht-acceptance-delivery.html?lang=ru`

Observed:

- journal EN/RU language shell switched correctly with `--virtual-time-budget=5000`;
- journal NavDesk aria label and lightbox aria label switched EN/RU;
- delivery page EN initial summary: `Enter sea distance to see the estimate.`;
- delivery page RU initial summary: `Укажите морскую дистанцию, чтобы увидеть расчет.`;
- delivery speed helper switched EN/RU;
- delivery crew helper switched EN/RU.

## Notes

This was a language-layer extraction only. It does not approve delivery calculator text for future `de/it/es/sr/zh` publication.
