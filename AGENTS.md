# BRKOVIC.LTD Agent Rules

These rules are mandatory for any coding agent working in this repository.

## Project Identity

This repository is the main production website project for:

```text
brkovic.ltd
```

Do not treat this project as `Revoyacht`.

`Revoyacht`, `yacht-flex-demo`, and old nested site copies are experimental/legacy areas and must not be mixed into the main `brkovic.ltd` project unless the user explicitly asks for a separate experimental branch or repo.

## Source Of Truth

The source of truth for development is this Git repository:

```text
git@github.com:vetus-nauta/brkovic-ltd.git
```

Local Apache folders such as:

```text
/home/alexey/Sites/brkovic-local
```

are runtime/test mirrors only. Do not assume they are the canonical source.

## Local Run

Use this from the repo root:

```bash
php -S 127.0.0.1:18090 -t .
```

Then check:

```text
http://127.0.0.1:18090/
http://127.0.0.1:18090/services/yacht-management.html
http://127.0.0.1:18090/admin-mnr.html
```

## Yacht Management Rule

The public yacht management page and the admin must use the same catalog:

```text
data/management-pricing.json
```

Do not create a second hardcoded pricing/service list in the public page.

Important files:

```text
services/yacht-management.html
admin-mnr.html
js/management.js
js/admin-management.js
management-admin-api.php
css/admin-management.css
data/management-pricing.json
```

## Security

Do not commit:

```text
forms/config.php
forms/smtp-error.log
```

Use:

```text
forms/config.example.php
```

