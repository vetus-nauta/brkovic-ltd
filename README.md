# brkovic.ltd

Clean source project for the main `brkovic.ltd` website.

This repository intentionally excludes the Revoyacht experimental branch and old backup folders. Keep `/revoyacht`, `/yacht-flex-demo`, and `/public_html_nested` outside the main production project unless they are moved to a dedicated branch or repository.

## Repository Map

Fast path summary:

```text
PATHS_QUICK.md
```

See [REPOSITORY_MAP.md](REPOSITORY_MAP.md) before starting new work.

Canonical paths:

```text
Main site: /home/alexey/GitHub/Revoyacht/brkovic-ltd
Game platform: /home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

The old staging path `/home/alexey/GitHub/Revoyacht/game-brkovic-ltd` is deprecated.

## Local Run

```bash
php -S 127.0.0.1:18090 -t .
```

Open:

- Public site: `http://127.0.0.1:18090/`
- Yacht management public page: `http://127.0.0.1:18090/services/yacht-management.html`
- Yacht management admin: `http://127.0.0.1:18090/admin-mnr.html`

Game platform local run, if PHP is available:

```bash
php -S 127.0.0.1:18110 -t game.brkovic.ltd/public
```

## Writable Data

The yacht management admin saves pricing to:

```text
data/management-pricing.json
```

On Apache/PHP, the web user must be able to write both the `data` directory and this JSON file.

Example for a local Ubuntu Apache install:

```bash
setfacl -m u:www-data:rwx data
setfacl -m u:www-data:rw data/management-pricing.json
```

## Mail Config

The real SMTP config is local/server-only and must not be committed:

```text
forms/config.php
```

Create it from:

```text
forms/config.example.php
```

## Management Module

The public management page and admin now use the same pricing catalog:

```text
data/management-pricing.json
```

Admin supports:

- monthly base pricing by yacht length/type/crew
- monthly add-on services
- one-time services
- adding/removing non-core services
- public visibility toggles
- local diagnostics for auth and write permissions
