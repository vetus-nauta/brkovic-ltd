# BRKOVIC.LTD Handoff - 2026-05-19

Date: 2026-05-19
Project: `brkovic.ltd`
Repository: `git@github.com:vetus-nauta/brkovic-ltd.git`
Branch in local checkout: `main`
Current local path:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Critical Project Boundary

This is the main production website project for `brkovic.ltd`.

Do not mix it with:

```text
/home/alexey/GitHub/Revoyacht
Revoyacht/yacht-flex-demo
```

Those areas are experimental and are not part of the main production `brkovic.ltd` project.

## Current Local State

The local working tree contains substantial uncommitted work from 2026-05-19.

Do not run:

```bash
git reset --hard
git checkout -- .
```

unless the owner explicitly asks to discard the local work.

Current changed areas include:

- public pages and language integration
- main homepage pilot layout and mobile/tablet styling
- yacht management public calculator, print template, modals and disclaimer
- yacht management admin pricing/project/document work
- shared management pricing data
- i18n dictionaries
- local diagnostic and preview tools

Important current status command:

```bash
git status --short
```

## Local Run

For computer-only local access:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
php -S 127.0.0.1:18090 -t .
```

For access from a phone on the same local network:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
php -S 0.0.0.0:18090 -t .
```

Current LAN address during this handoff:

```text
http://192.168.1.229:18090/
```

The address may change after router/computer reconnect. The machine hostname is:

```text
Vetus-Home
```

If local mDNS works from the phone, this may also work:

```text
http://Vetus-Home.local:18090/
```

## Main URLs To Check

```text
http://127.0.0.1:18090/
http://127.0.0.1:18090/index.html
http://127.0.0.1:18090/services/yacht-management.html
http://127.0.0.1:18090/admin-mnr.html
http://127.0.0.1:18090/journal.html
http://127.0.0.1:18090/navdesk.html
```

## Backup Created Today

Fresh full backup:

```text
/home/alexey/GitHub/Revoyacht/backups/brkovic-ltd-full-backup-20260519-231440.tar.gz
/home/alexey/GitHub/Revoyacht/backups/brkovic-ltd-full-backup-20260519-231440.tar.gz.sha256
```

Previous same-day backup also exists:

```text
/home/alexey/GitHub/Revoyacht/backups/brkovic-ltd-full-backup-20260519-221724.tar.gz
```

## Verification Passed On 2026-05-19

JavaScript syntax:

```bash
node --check js/language.js
node --check js/main.js
node --check js/management.js
node --check js/admin-management.js
node --check js/journal.js
node --check js/navdesk.js
node --check js/form.js
node --check js/weather.js
```

PHP syntax:

```bash
php -l index.php
php -l management-admin-api.php
php -l forms/send.php
php -l admin-api-proxy.php
```

JSON and i18n:

```bash
node tools/i18n-diagnostics.mjs
```

Result:

- public pages have no-translate protection
- RU/EN key sets match
- no missing RU keys
- no missing EN keys

HTTP smoke test returned `200` for:

```text
/
/index.html
/journal.html
/navdesk.html
/services/yacht-management.html
/services/skipper-service.html
/services/iyt-training.html
/services/sailing-tours.html
/services/yacht-acceptance-delivery.html
/services/yacht-registration.html
/admin-mnr.html
/tools/device-preview.html?device=phone
/tools/device-preview.html?device=tablet
```

Browser smoke test via headless Chrome passed with no console errors for:

```text
home desktop
home tablet
home mobile
yacht management desktop
yacht management mobile
admin desktop
```

Screenshots generated during verification:

```text
/tmp/brkovic-home-desktop-20260519.png
/tmp/brkovic-home-tablet-20260519.png
/tmp/brkovic-home-mobile-20260519.png
/tmp/brkovic-management-desktop-20260519.png
/tmp/brkovic-management-mobile-20260519.png
/tmp/brkovic-admin-desktop-20260519.png
```

## Language Integration

Implemented on public pages:

- system language detection
- Russian if system language starts with `ru`
- English for other system languages
- manual language selection through the site menu
- `?lang=ru` and `?lang=en` support
- persisted manual choice in `localStorage`
- browser translation blocking with:
  - `translate="no"`
  - `notranslate`
  - `<meta name="google" content="notranslate">`
- one-time hint explaining that language can be changed in the menu

Current active languages:

```text
ru
en
```

Future planned languages:

```text
de
it
fr
sr
zh
```

Admin/posts/comments/marketing language workflow is intentionally not solved yet. This was planned as a second stage.

Main files:

```text
js/language.js
js/main.js
lang/ru.json
lang/en.json
tools/i18n-diagnostics.mjs
```

## General Site Menu

Public pages now use a single menu button pattern inspired by the yacht management page.

The menu modal contains:

- Home
- Services
- Deck Log
- Nav Desk
- Contact
- language switcher
- Instagram link
- placeholder for future user settings

Main files:

```text
js/main.js
css/main.css
css/responsive.css
```

## Homepage Pilot

The homepage is the pilot for the next visual style pass.

Implemented:

- `body.home-page`
- compact liquid-glass / iOS-like treatment only for the homepage
- topbar aligned with yacht management mobile style
- mobile dock restored for homepage
- phone/tablet responsive checks
- desktop hero reorganized so the right side under the photo is not empty
- old owner-approved hero title restored
- old owner-approved deck-log photo note restored

Important owner preference:

Keep this hero/title tone unless the owner asks to change it again:

```text
Практический опыт в яхтинге
Морские путешествия, работа, свобода
```

And keep the photo note:

```text
Личный бренд, построенный на многолетнем морском опыте, знании и доверии.
```

Main files:

```text
index.html
css/main.css
css/responsive.css
lang/ru.json
lang/en.json
```

## Phone And Tablet Local Preview Tools

Created local device preview page:

```text
tools/device-preview.html
```

Created launchers:

```text
tools/open-mobile-preview.sh
tools/open-tablet-preview.sh
```

Desktop icons created:

```text
/home/alexey/Рабочий стол/мобила.desktop
/home/alexey/Рабочий стол/планшет.desktop
```

They open Chrome app windows with local preview frames:

```text
http://127.0.0.1:18090/tools/device-preview.html?device=phone
http://127.0.0.1:18090/tools/device-preview.html?device=tablet
```

## Yacht Management Public Page

Current public page:

```text
services/yacht-management.html
```

Implemented/changed today:

- final price card made more complete
- calculator settings moved into modal
- documents/print/proforma actions moved into modal
- explanatory logic moved into info modal
- mandatory disclaimer appears at first entry before other management windows
- disclaimer also exists as a small bottom card for page context
- print template improved
- print header has company/logo/requisites in one horizontal card
- right print boundary tightened so table fits better
- public print style uses monochrome logo treatment

Main files:

```text
services/yacht-management.html
js/management.js
css/main.css
css/responsive.css
lang/ru.json
lang/en.json
```

## Yacht Management Admin

Admin page:

```text
admin-mnr.html
```

Shared pricing/catalog file:

```text
data/management-pricing.json
```

API:

```text
management-admin-api.php
```

Implemented/admin work in progress:

- pricing catalog remains shared between admin and public page
- monthly add-ons and one-time services supported
- adding/removing non-core services
- public visibility flags
- projects, counterparties, commitments and documents workspace started
- monthly proforma, one-time proforma and contract preparation actions started
- one-time service settings moved into wider popup/card
- admin remains Russian-first for now

Important permission note:

If admin cannot save pricing, check write permissions:

```bash
ls -ld data
ls -l data/management-pricing.json
```

For Apache/PHP local install:

```bash
setfacl -m u:www-data:rwx data
setfacl -m u:www-data:rw data/management-pricing.json
```

## Management Product Rules

Keep this model:

- monthly base is one combined line:
  - yacht control alongside
  - technical control
  - owner representation
- base pricing depends on yacht type, yacht length and crew state
- monthly add-ons are separate recurring services
- one-time services are separate event-based/quantity services
- public calculator and admin must use the same catalog
- do not duplicate the pricing model in hardcoded public HTML

## GitHub Repository State

Remote:

```text
origin git@github.com:vetus-nauta/brkovic-ltd.git
```

Known earlier pushed commits from first project setup:

```text
0ea741e Document management roadmap
448a7f4 Initial brkovic.ltd site
```

At the time of this handoff, the local tree has many uncommitted changes. If continuing on another computer, either:

1. use the backup archive above, or
2. first commit/push this local state from the current computer, or
3. use the GitHub issue/record created for this handoff as the work log and checklist.

## Suggested Next Chat Start Prompt

Use this prompt in a new chat:

```text
Open the BRKOVIC handoff dated 2026-05-19:
docs/brkovic_ltd_github_handoff_2026-05-19.md

This is the main brkovic.ltd project, not Revoyacht/yacht-flex-demo.
Local project path on the original computer:
/home/alexey/GitHub/Revoyacht/brkovic-ltd

Before changing anything:
1. Check git status.
2. Do not reset or discard uncommitted changes.
3. Run php -S 127.0.0.1:18090 -t .
4. Open /, /services/yacht-management.html and /admin-mnr.html.
5. Run node tools/i18n-diagnostics.mjs.

Continue yacht management work:
- projects
- counterparties/commitents
- commitments
- monthly and one-time proformas
- contract preparation
- document persistence
- later admin language/post/comment/marketing workflow
```

## Next Work Recommended

1. Decide whether to commit the full current local state or split it into focused commits.
2. Finish admin persistence for:
   - projects
   - counterparties
   - commitments
   - issued documents
3. Finish document generation flow:
   - monthly proforma
   - one-time proforma
   - service agreement/contract
4. Re-test admin save/delete services after final document persistence.
5. Once homepage mobile style is approved, apply the same style system to the other public pages.
6. Second-stage i18n planning:
   - admin language model
   - posts
   - comments
   - marketing text
   - translation automation based on Russian authoring source.

## Commands For A Careful Next Verification

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd

git status --short

node --check js/language.js
node --check js/main.js
node --check js/management.js
node --check js/admin-management.js
node --check js/journal.js
node --check js/navdesk.js
node --check js/form.js
node --check js/weather.js

php -l index.php
php -l management-admin-api.php
php -l forms/send.php
php -l admin-api-proxy.php

node tools/i18n-diagnostics.mjs

php -S 127.0.0.1:18090 -t .
```
