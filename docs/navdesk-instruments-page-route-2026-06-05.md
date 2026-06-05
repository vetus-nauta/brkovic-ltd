# NavDesk Instruments Page Route

Date: 2026-06-05
Status: stable route for `instruments-navdesk-2.0`
Canonical stable commit: `cda60ec Stabilize NavDesk instruments 2.0`

## Purpose

This document is the narrow route for future work on the NavDesk Instruments
page family. A new chat should start here instead of scanning unrelated project
drafts.

The page is already deployed and stable as `instruments-navdesk-2.0`.

## Page Family

Public route family:

- `/navdesk-instruments.html`
- `/ru/navdesk-instruments.html`
- `/de/navdesk-instruments.html`
- `/es/navdesk-instruments.html`
- `/it/navdesk-instruments.html`
- `/sr/navdesk-instruments.html`
- `/zh/navdesk-instruments.html`

NavDesk entry cards are in:

- `/navdesk.html`
- `/ru/navdesk.html`
- `/de/navdesk.html`
- `/es/navdesk.html`
- `/it/navdesk.html`
- `/sr/navdesk.html`
- `/zh/navdesk.html`

## Source Of Truth

Read these first and only then inspect code if needed:

- `docs/navdesk-instruments-2.0-stable-release-2026-06-05.md`
- `docs/brkovic_ltd_project_office/cabinets/frontend-engineer/navdesk-tool-page-build-handoff.md`
- this file

## Allowed Work Area

Only these files are part of the page route unless the owner explicitly expands
scope:

```text
navdesk-instruments.html
ru/navdesk-instruments.html
de/navdesk-instruments.html
es/navdesk-instruments.html
it/navdesk-instruments.html
sr/navdesk-instruments.html
zh/navdesk-instruments.html
navdesk.html
ru/navdesk.html
de/navdesk.html
es/navdesk.html
it/navdesk.html
sr/navdesk.html
zh/navdesk.html
css/navdesk-instruments.css
js/navdesk-instruments.js
lang/en.json
lang/ru.json
lang/de.json
lang/es.json
lang/it.json
lang/sr.json
lang/zh.json
images/navdesk/
sitemap.xml
```

Shared files such as `css/navdesk.css`, `js/navdesk.js`, `js/main.js`, and
`js/seo.js` may be inspected only to understand integration behavior. Do not
edit them for this page without a separate explicit task.

## Do Not Touch From This Route

Do not inspect or modify these areas while working on this page unless the owner
assigns a separate task:

- `ship-cashbox/`
- localized `*/ship-cashbox/`
- `game.brkovic.ltd/`
- `captain-fin/`
- backend/private configs
- database migration scripts
- unrelated project-office sprint drafts
- generated local screenshots under `docs/brkovic_ltd_project_office/reports/`

This prevents accidental cross-work between NavDesk Instruments and other
active product drafts.

## Current Product Rules

- The start screen is for direct external entry.
- Entry from NavDesk opens the live panel directly.
- The live panel visually hides site header/footer, but the HTML remains for
indexing and for the start screen.
- Runtime must keep the quiet attribution link:
  `brkovic.ltd - NavDesk instruments`, opening localized `navdesk.html` in a
  new tab.
- Weather/marine data is informational only, not a certified navigation
  forecast.
- Weather alert V1 requires live panel session, notification permission, fresh
  GPS point, and marine data at the observed point.
- Do not restart or redesign the page from zero.

## Verification Commands

```bash
node --check js/navdesk-instruments.js
python3 -m json.tool lang/ru.json >/dev/null
git diff --check -- \
  navdesk-instruments.html ru/navdesk-instruments.html de/navdesk-instruments.html \
  es/navdesk-instruments.html it/navdesk-instruments.html sr/navdesk-instruments.html \
  zh/navdesk-instruments.html css/navdesk-instruments.css js/navdesk-instruments.js \
  lang/en.json lang/ru.json lang/de.json lang/es.json lang/it.json lang/sr.json lang/zh.json
```

Live smoke:

```bash
curl -L -I https://brkovic.ltd/ru/navdesk-instruments.html
curl -L -I https://brkovic.ltd/ru/navdesk.html
```

## Production Reference

Pre-deploy backup for the stable upload was created at:

```text
/home/alexey/.local/share/brkovic-ltd/backups/20260605T195136Z-navdesk-instruments-2-stable06-predeploy
```

Do not add FTP credentials, database credentials, local env files, or screenshots
to Git.
