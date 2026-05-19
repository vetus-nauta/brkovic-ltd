# BRKOVIC.LTD Handoff - 2026-05-19

## Short Context

This handoff is for continuing work on the main `brkovic.ltd` website from another computer/chat.

Important distinction:

- `brkovic.ltd` is the main production website project.
- `Revoyacht` / `yacht-flex-demo` is an experimental branch/area and is not part of the main `brkovic.ltd` production project.

## GitHub Repository

Main repo:

```text
git@github.com:vetus-nauta/brkovic-ltd.git
```

Branch:

```text
main
```

Current pushed commits:

```text
0ea741e Document management roadmap
448a7f4 Initial brkovic.ltd site
```

Clone on a new computer:

```bash
git clone git@github.com:vetus-nauta/brkovic-ltd.git
cd brkovic-ltd
php -S 127.0.0.1:18090 -t .
```

Open locally:

```text
http://127.0.0.1:18090/
http://127.0.0.1:18090/services/yacht-management.html
http://127.0.0.1:18090/admin-mnr.html
```

## Local Source Paths On Current Machine

Clean standalone project:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Apache local site currently served by `brkovic-local.local`:

```text
/home/alexey/Sites/brkovic-local
```

Previous staging/source folder used during the split:

```text
/home/alexey/GitHub/Revoyacht/brkovic-stage
```

## What Was Done Today

1. Separated the main `brkovic.ltd` website into a clean standalone Git project.
2. Excluded experimental folders from the main project:
   - `/revoyacht`
   - `/yacht-flex-demo`
   - `/public_html_nested`
3. Excluded old backups and local artifacts:
   - `.listing`
   - `*.bak*`
   - `*.bad*`
   - `*.broken*`
   - logs
4. Removed secrets from Git:
   - real `forms/config.php` is ignored
   - committed `forms/config.example.php` instead
5. Initialized Git and pushed the clean project to GitHub.
6. Synced fresh yacht management changes into the local Apache folder.
7. Fixed local Apache write permissions for management pricing:

```bash
setfacl -m u:www-data:rwx /home/alexey/Sites/brkovic-local/data
setfacl -m u:www-data:rw /home/alexey/Sites/brkovic-local/data/management-pricing.json
```

Diagnostics after fix showed:

```text
pricingFile.writable: true
dataDir.writable: true
```

## Current Yacht Management State

Public page:

```text
services/yacht-management.html
```

Admin page:

```text
admin-mnr.html
```

Shared pricing/source-of-truth file:

```text
data/management-pricing.json
```

Main scripts:

```text
js/management.js
js/admin-management.js
management-admin-api.php
css/admin-management.css
```

Admin build marker:

```text
ADMIN_BUILD = 20260519-04
```

Public management pricing cache marker:

```text
management-pricing.json?v=20260519-01
management.js?v=20260519-01
```

Implemented in the management module:

- Public management page and admin now read from the same pricing catalog.
- Admin supports monthly add-on services and one-time services.
- Admin can add and remove non-core services.
- Core monthly base services cannot be deleted.
- Service records support RU/EN titles and descriptions.
- Service records support public visibility flags.
- API diagnostics endpoint exists:

```text
management-admin-api.php?diagnostics=1
```

## Important Product Rules

Keep this service model:

- Monthly base remains one combined line:
  yacht control alongside + technical control + owner representation.
- Base pricing depends on:
  yacht length, yacht type, crew state.
- Monthly add-ons are separate checkbox services above/around the base calculation.
- One-time services are separate quantity-based services.
- Admin is Russian.
- Public page is RU/EN.
- Public page content must reflect saved admin/catalog state.
- Do not hardcode a second conflicting service/pricing list in the public page.

## Next Work Requested By User

Continue step by step from the plan.

Near-term tasks:

1. Add project saving in admin:
   - client/contact data
   - yacht data
   - selected monthly services
   - selected one-time services
   - discounts/notes
   - generated document numbers

2. Add commitments and issued documents:
   - saved commitments
   - issued proformas
   - prepared contracts

3. Public page demo documents:
   - printable/saveable monthly services proforma
   - printable/saveable one-time services proforma
   - these should be saved/fixed as draft projects in admin to make later client offers easier.

4. Admin commercial documents:
   - full offer or service agreement
   - two final proformas tied by numbers to the service agreement/contract.

Roadmap file already exists in repo:

```text
docs/management-roadmap-2026-05-19.md
```

## Security / Config Notes

Do not commit:

```text
forms/config.php
forms/smtp-error.log
```

Use:

```text
forms/config.example.php
```

On a new server/computer, create `forms/config.php` manually from the example.

## Suggested First Checks For Next Chat

Run:

```bash
cd brkovic-ltd
git status --short
git log --oneline -3
php -l management-admin-api.php
node --check js/admin-management.js
node --check js/management.js
php -S 127.0.0.1:18090 -t .
```

Then open:

```text
http://127.0.0.1:18090/admin-mnr.html
http://127.0.0.1:18090/services/yacht-management.html
```

