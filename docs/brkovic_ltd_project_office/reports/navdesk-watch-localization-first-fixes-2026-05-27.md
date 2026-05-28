# NavDesk Watch Localization First Fixes - 2026-05-27

**Task:** `BRK-MVP-LOC-002`
**Owner chat:** `CHAT-BRK-LOC-001`
**Role:** Localization Architect
**Status:** report-only, ready for Director/owner review
**Scope:** first safe localization fixes for `navdesk-watch.html` and watch-log runtime strings

## Boundary

Product code, `lang/*.json`, production, FTP, database and secrets were not changed for this localization task.

This report is based on:

- `docs/brkovic_ltd_project_office/reports/localization-surface-inventory-2026-05-27.md`
- `navdesk-watch.html`
- `js/navdesk.js`
- `lang/ru.json`
- `lang/en.json`

## Current State

`lang/ru.json` and `lang/en.json` already have a clean key pair for:

- `navdesk_watch_meta_title`

There is no dedicated key family yet for the visible watch-log UI, runtime statuses, print documents, reminders, GPS states or share text.

The page currently mixes:

- Russian visible UI labels;
- English / technical maritime placeholders such as `Kotor - Bar, night passage`, `6.2 kn`, `NW 12 kn, sea slight`;
- hardcoded `aria-label` and `title` values;
- JavaScript-generated Russian statuses and document labels;
- print/PDF document text generated inside `js/navdesk.js`.

## Priority 1 - Safe HTML Extraction

These can be moved to `data-i18n` / `data-i18n-placeholder` without changing owner voice or behavior:

- Page title block: `Вахтенный журнал`, `Текущая вахта и записи перехода`.
- Hero/support text already written for the page.
- Toolbar buttons: `Открыть`, `Сохранить`, `Вахты A4`, `Лист записей`, `PDF`, `Поделиться`.
- Work panel labels: `Сейчас`, `Текущая вахта`, `Время`, `Старший`, `Состав`.
- Reminder UI: `Напомнить за 15 минут`, `Напоминание выключено`.
- Quick entry labels: `Быстрая запись`, `Обстановка и счисление`, `Курс`, `Скорость`, `Позиция`, `Ветер / море`, `Запись`, `Записать`.
- Timeline empty state: `Журнал готов к первой записи.`
- Setup labels: `Настройка вахт`, `Переход, экипаж и вахты`, `Переход / маршрут`, `Дата старта`, `Время старта`, `Суток`, `Часов`, `UTC offset`, `Капитан`, `Первый помощник`, `Режим`, `Тип вахты`, `Подвахтенный`, `Подвахта с`, `Подвахта до`, `Основной экипаж`.
- Manual editor labels: `Ручное расписание`, `Начало`, `Конец`, `Добавить смену`, `Удалить`.

Suggested key prefix:

- `navdesk_watch_*`

## Priority 2 - Safe Attributes

These should be added after `language.js` supports attribute localization beyond placeholders:

- `aria-label="VETUS NAUTA - Brkovic home"`
- `aria-label="Language switcher"`
- day/night `aria-label` and `title`
- pin button accessible labels
- button labels for GPS and AUTO if kept as visible abbreviations
- meta description for the watch page through `data-i18n-description`

Do not translate brand text or accepted abbreviations literally. `GPS`, `AUTO`, `UTC`, `A4`, `PDF`, `kn` can remain glossary-controlled constants.

## Priority 3 - JavaScript Runtime Strings

`js/navdesk.js` generates the most important watch-log language surfaces. First safe extraction candidates:

- Schedule/live states: waiting, active, ended, schedule error.
- Entry statuses: saved, empty, restored, storage failed.
- GPS statuses: manual, getting position, position saved, permission denied, unsupported.
- Reminder statuses and notification body.
- Sign-current statuses and signed watch list labels.
- Schedule preview headings and shift labels.
- Rest-control labels.
- Print/PDF document headings and table column labels.
- Share text and clipboard fallback statuses.

This should be done with a small runtime helper, not by calling browser translation directly from every string:

```js
const wt = (key, fallback, vars = {}) => { ... };
```

The helper must fall back to Russian safely because the owner writes the operational source copy in Russian.

## Priority 4 - Print And PDF Terms

Print documents need their own keys because they are semi-official documents, not ordinary screen UI:

- `Вахтенный журнал`
- `Лист вахтенных записей`
- `Расписание вахт`
- `Подписанные смены`
- `Контроль отдыха`
- table columns: date, time, senior watchkeeper, watchkeeper, crew, position, course, speed, wind/sea, note, signature.

Print terminology should be reviewed by owner before broad translation.

## Owner Decisions Needed

Terms requiring a decision before many-language expansion:

- `Вахта`: `watch`, `watch period`, or `watch shift` depending on context.
- `Вахтенный журнал`: `Watch Log`, `Deck Log`, or `Logbook Watch Sheet`.
- `Вахтенный`: `watchkeeper`, `watch officer`, or `person on watch`.
- `Старший`: `senior watchkeeper`, `watch leader`, or `officer of the watch`.
- `Подвахтенный`: no literal automatic translation. Candidate meanings: assisting watchkeeper, standby watchkeeper, second watchkeeper.
- Night/pre-dawn highlight: internal logic may use `00:00-04:00`, but the UI should not print slang such as `собачья вахта`; use silent visual highlighting or owner-approved neutral label.
- `Обстановка и счисление`: likely `Situation and Dead Reckoning`, but this is a specialist phrase and should be glossary-governed.

## ChatGPT Pro / OpenAI API Boundary

Owner has ChatGPT Pro, but automated multilingual admin work cannot safely run from the browser with a personal ChatGPT session.

For the future AI language desk:

- use a server-side OpenAI API key;
- do not store the key in Git, frontend JS, `lang/*.json`, or public hosting files;
- keep owner Russian text as source-of-truth;
- generate language drafts with statuses: draft, reviewed, published;
- store prompts/rules in backend or protected config;
- log model, source language, target language, and revision state per generated translation.

## Recommended First Fix Batch

1. Add `navdesk_watch_*` keys for static screen strings in `navdesk-watch.html`.
2. Extend `language.js` only if needed for `aria-label`, `title`, `alt`, and meta-description attributes.
3. Add a small watch-log runtime translation helper in `js/navdesk.js`.
4. Move print/PDF/share/notification strings after the helper is stable.
5. Make a glossary file before adding more target languages.

## Result

Report created. Product code, language JSON, production, FTP and secrets untouched by this localization task.
