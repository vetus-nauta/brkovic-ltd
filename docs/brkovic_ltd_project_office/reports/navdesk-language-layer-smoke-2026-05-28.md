# NavDesk Language Layer Smoke - 2026-05-28

**Task:** `BRK-MVP-QAUX-007`
**Owner:** Director-run QA smoke after `FE-016`
**Status:** PASS with interaction gaps

## Scope

Local server:

```text
php -S 127.0.0.1:4177 -t .
```

Checked pages:

```text
navdesk-tides.html?lang=en
navdesk-tides.html?lang=ru
navdesk-route.html?lang=en
navdesk-route.html?lang=ru
navdesk-ukv.html?lang=en
navdesk-ukv.html?lang=ru
```

Temporary DOM dumps were written to `/tmp/brkovic-navdesk-*.html` for this QA pass and are not release artifacts.

## Verdict

The first safe NavDesk JavaScript i18n layer initializes correctly in the checked local pages.

Confirmed:

- all checked pages loaded from the local server;
- `?lang=en` and `?lang=ru` set `<html lang>` correctly;
- `data-language-source="query"` appears in the rendered DOM;
- day/night icon controls receive translated `aria-label` and `title`;
- tides suggestion, trend and weekly graph accessibility labels translate in EN/RU;
- UKV smart-pick controls receive translated `aria-label` and helper `title`;
- the language panel is many-language-ready: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`;
- future languages remain disabled;
- no visible compact `RU / EN` switcher appeared in the rendered NavDesk menu.

## Evidence

Rendered language state:

```text
navdesk-tides.html?lang=en -> <html lang="en" ... data-language-source="query">
navdesk-tides.html?lang=ru -> <html lang="ru" ... data-language-source="query">
navdesk-route.html?lang=en -> <html lang="en" ... data-language-source="query">
navdesk-route.html?lang=ru -> <html lang="ru" ... data-language-source="query">
navdesk-ukv.html?lang=en -> <html lang="en" ... data-language-source="query">
navdesk-ukv.html?lang=ru -> <html lang="ru" ... data-language-source="query">
```

Day/night controls:

```text
EN: aria-label="Day mode" / aria-label="Night mode"
RU: aria-label="Дневной режим" / aria-label="Ночной режим"
```

Tides runtime/accessibility labels:

```text
EN: Select a place from the list.
RU: Выберите место из списка.
EN: aria-label="Trend"
RU: aria-label="Тенденция"
EN: Weekly tide and depth graph
RU: Недельный график прилива и глубины
```

UKV smart-pick labels:

```text
EN: aria-label="Open suggestions"
RU: aria-label="Открыть подсказки"
EN title: You can choose a ready-made phrase from the list or edit it manually.
RU title: Можно выбрать готовую формулировку из списка или отредактировать вручную.
```

Language panel:

```text
Available: en, ru
Future disabled: de, it, es, sr, zh
No visible compact RU/EN selector found in the dumped NavDesk menu DOM.
```

## Gates

Passed:

```text
node --check js/language.js
node --check js/main.js
node --check js/navdesk.js
node tools/i18n-diagnostics.mjs
```

Current i18n diagnostic summary remains green:

```text
missing keys: none
dictionary drift: none
broken pages: none
```

## Gaps

This was a headless DOM smoke, not a full interactive browser QA pass.

Not fully exercised here:

- route place-search typing/selecting and the dynamic inserted-coordinate status;
- night-theme persistence through `localStorage`;
- click-through of the system-language hint dismissal.

These should be covered in the next interactive QA pass when Playwright or equivalent browser automation is available.

Chrome emitted headless GPU mailbox warnings during dumps, but commands exited successfully and DOM output was produced.

## Next Step

Frontend can proceed to the next small language sprint step. Keep future languages disabled until real content, URLs, SEO rules and QA are ready.
