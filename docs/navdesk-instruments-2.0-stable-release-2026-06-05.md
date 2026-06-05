# NavDesk Instruments 2.0 Stable Release

Date: 2026-06-05
Status: `instruments-navdesk-2.0 (stable)`
Scope: `navdesk-instruments.html` and localized route family only.
Narrow future-work route: `docs/navdesk-instruments-page-route-2026-06-05.md`

## Closeout Record

Release closeout is recorded on 2026-06-05. The local page family is the
source of truth for production comparison and future polishing tasks.

Final 2.0 decisions:

- public name: `Location Plotter` / `Плоттер локации`;
- no duplicate logo inside the launch panel when the site header is visible;
- start screen is for direct external entry only;
- Nav Desk entry opens the live panel directly and carries the existing auth context;
- site menu links open external site sections in a new tab;
- the Nav Desk link returns to the already-open Nav Desk window when possible;
- mobile menu is a compact hamburger in the header row;
- runtime instrument labels are localized through `lang/*.json`;
- weather sources are shown as short abbreviations: `OM · M`;
- weather and marine data stay informational and must not be positioned as a
  professional navigation forecast.
- registered-user weather alerts are V1 browser/PWA alerts: they work from a
  live panel session, require notification permission, require marine data at
  the GPS point, and must not send if the last GPS point is older than 4 hours.
- visual site header/footer stay in the HTML for indexing and the launch
  screen, but are hidden inside the live instrument runtime.
- live runtime keeps a modest attribution/back-reference link:
  `brkovic.ltd - NavDesk instruments`, opening the localized NavDesk page in a
  new browser tab.

Deployment package:

- page family: `/navdesk-instruments.html` plus `ru/de/es/it/sr/zh` copies;
- Nav Desk entry cards: `/navdesk.html` plus localized copies;
- direct dependencies: `css/navdesk-instruments.css`, `css/navdesk.css`,
  `js/navdesk-instruments.js`, `js/main.js`, `js/seo.js`, `lang/*.json`,
  `images/navdesk/*`, `sitemap.xml`.

Do not mix this release with Ship Cashbox working files or local draft scripts.

## Stable Decision

The local `navdesk-instruments.html` implementation is promoted from experimental to stable for the corresponding page family.

This local version is now the reference for:

- `/navdesk-instruments.html`
- `/ru/navdesk-instruments.html`
- `/de/navdesk-instruments.html`
- `/es/navdesk-instruments.html`
- `/it/navdesk-instruments.html`
- `/sr/navdesk-instruments.html`
- `/zh/navdesk-instruments.html`

## Product Surface

Stable 2.0 includes:

- branded Nav Desk launch screen for direct external entry;
- live location plotter screen;
- GPS position display;
- COG/SOG fallback from GPS points;
- weather card with Open-Meteo context;
- sea temperature field where marine data is available;
- place/time block;
- two-day weather watch model;
- green/yellow/red/purple weather watch visual states;
- rain/no-rain image variants;
- help modal for weather watch model;
- PWA install button;
- return to Nav Desk;
- reference-data warning copy.

## Responsive Gate

The stable page is required to support:

- desktop;
- tablet;
- phone portrait;
- phone landscape without fixed heavy headers taking half of the screen.

CSS breakpoints live in:

```text
css/navdesk-instruments.css
```

Current responsive gates:

- `max-width: 980px`
- `max-width: 640px`
- `max-width: 430px`

## SEO / Localization Gate

The page family has:

- self canonical per language URL;
- full hreflang cluster;
- sitemap entries for all seven URLs;
- localized title and meta description;
- Open Graph / Twitter metadata;
- instrument-specific preview image;
- JSON-LD `WebPage`, `WebApplication`, `BreadcrumbList`;
- 7-language runtime UI key coverage.

## Stable Checks

Required before deployment:

```bash
node --check js/navdesk-instruments.js
node --check js/seo.js
node --check tools/build-language-pages.mjs
git diff --check -- navdesk-instruments.html ru/navdesk-instruments.html de/navdesk-instruments.html es/navdesk-instruments.html it/navdesk-instruments.html sr/navdesk-instruments.html zh/navdesk-instruments.html css/navdesk-instruments.css js/navdesk-instruments.js js/seo.js tools/build-language-pages.mjs sitemap.xml lang/en.json lang/ru.json lang/de.json lang/es.json lang/it.json lang/sr.json lang/zh.json
```

Additional local smoke:

- open desktop width;
- open tablet width;
- open mobile portrait;
- open mobile landscape;
- verify no horizontal overflow;
- verify weather watch help modal blocks background scroll;
- verify route back to Nav Desk;
- verify all weather watch scenarios by `?wxScenario=green|yellow|yellow-rain|red|red-rain|purple|purple-rain`.

## Backlog Not Included

Anchor watch is not part of 2.0 stable. It is preserved as future product work in:

```text
docs/navdesk-instruments-anchor-watch-backlog-2026-06-05.md
```

## Deployment Rule

Deploy only the page family and its direct dependencies. Do not deploy:

- `.codex-backups/`;
- local runtime storage;
- local env files;
- unrelated Ship Cashbox sprint drafts;
- private configs.
