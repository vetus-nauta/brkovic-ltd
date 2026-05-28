# I18N Diagnostics - 2026-05-28

**Tool:** `tools/i18n-diagnostics.mjs`
**Scope:** public static shell pages, services and NavDesk pages
**Languages found:** `en`, `ru`

## Summary

- Public pages scanned: 15
- JavaScript files scanned: 12
- HTML i18n keys used: 613
- JS i18n keys referenced: 198
- Total i18n keys referenced: 780
- Broken page shell checks: 0
- Missing keys in active dictionaries: 0

## Attribute Coverage

| Attribute | Used keys |
| --- | ---: |
| `data-i18n` | 576 |
| `data-i18n-aria-label` | 14 |
| `data-i18n-description` | 6 |
| `data-i18n-option` | 9 |
| `data-i18n-placeholder` | 19 |
| `data-i18n-title` | 14 |
| `js-call` | 116 |
| `js-literal` | 198 |

## Page Coverage

| Page | Bucket | Keys | Language scripts | No-translate guard |
| --- | --- | ---: | --- | --- |
| `404.html` | system | 0 | technical | ok |
| `index.html` | site | 90 | ok | ok |
| `journal.html` | journal | 25 | ok | ok |
| `navdesk.html` | navdesk | 260 | ok | ok |
| `navdesk-watch.html` | navdesk | 23 | ok | ok |
| `navdesk-tides.html` | navdesk | 66 | ok | ok |
| `navdesk-route.html` | navdesk | 65 | ok | ok |
| `navdesk-ukv.html` | navdesk | 159 | ok | ok |
| `navdesk-english.html` | navdesk | 23 | ok | ok |
| `services/iyt-training.html` | services | 52 | ok | ok |
| `services/sailing-tours.html` | services | 51 | ok | ok |
| `services/skipper-service.html` | services | 44 | ok | ok |
| `services/yacht-acceptance-delivery.html` | services | 74 | ok | ok |
| `services/yacht-management.html` | services | 156 | ok | ok |
| `services/yacht-registration.html` | services | 44 | ok | ok |

## JavaScript Coverage

| File | Referenced keys |
| --- | ---: |
| `js/admin-comments.js` | 0 |
| `js/admin-management.js` | 0 |
| `js/admin-posts.js` | 0 |
| `js/config.js` | 0 |
| `js/delivery-calculator.js` | 17 |
| `js/form.js` | 11 |
| `js/journal.js` | 52 |
| `js/language.js` | 2 |
| `js/main.js` | 15 |
| `js/management.js` | 59 |
| `js/navdesk.js` | 42 |
| `js/weather.js` | 0 |

## Missing Keys

- none

## Dictionary Drift

- none

## Unused Key Review

HTML-unused keys may still be used by JavaScript-generated UI. Total-unused keys are better cleanup candidates, but still require review before deletion.

| Language | HTML-unused keys | Total-unused keys |
| --- | ---: | ---: |
| en | 250 | 83 |
| ru | 250 | 83 |

## Director Note

This diagnostic is a gate for the language sprint. A step can add new static i18n surfaces only if this tool stays green for the active dictionaries.
