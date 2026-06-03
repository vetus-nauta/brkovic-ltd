# BRKOVIC.LTD Agent Rules

These rules are mandatory for any coding agent working in this repository.

## Project Identity

This repository is the main production website project for:

```text
brkovic.ltd
```

It also contains the game platform subproject:

```text
game.brkovic.ltd/
```

Before reading long handoffs, open:

```text
PATHS_QUICK.md
```

Do not treat this project as `Revoyacht`.

`Revoyacht`, `yacht-flex-demo`, and old nested site copies are experimental/legacy areas and must not be mixed into the main `brkovic.ltd` project unless the user explicitly asks for a separate experimental branch or repo.

## Source Of Truth

The source of truth for development is this Git repository:

```text
git@github.com:vetus-nauta/brkovic-ltd.git
```

The local workflow is a paired workflow:

```text
GitHub/source copy:  /home/alexey/GitHub/Revoyacht/brkovic-ltd
WebStorm/test copy: /home/alexey/WebstormProjects/brkovic-ltd
```

When a user says the local site, localhost, WebStorm, or the browser view, assume they mean the WebStorm/test copy and the already-running local site. If you edit the GitHub/source copy for canonical work, mirror the same touched files into the WebStorm/test copy before asking the user to inspect the browser.

Do not silently create a third server, third project copy, mock site, or replacement localhost setup.

Local Apache folders such as:

```text
/home/alexey/Sites/brkovic-local
```

are runtime/test mirrors only. Do not assume they are the canonical source.

## Canonical Paths

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Deprecated path:

```text
/home/alexey/GitHub/Revoyacht/game-brkovic-ltd
```

If an older handoff mentions `game-brkovic-ltd`, translate it to `brkovic-ltd/game.brkovic.ltd`.

## Local Run

The local site is expected to already open in the browser. Check the existing local site first:

```text
http://127.0.0.1:18090/
http://127.0.0.1:18091/
http://127.0.0.1:18091/ship-cashbox/index.html
```

Do not create a new local server or Python/PHP stub unless the user explicitly asks. The hostname below is not the current Ship Cashbox test target:

```text
http://brkovic-local.local/
```

It may show an old Apache/PHP stub and must not be treated as the etalon site.

If the existing local site is not running and PHP is available in the shell, use this from the repo root:

```bash
php -S 127.0.0.1:18090 -t .
```

Then check:

```text
http://127.0.0.1:18090/
http://127.0.0.1:18090/services/yacht-management.html
http://127.0.0.1:18090/admin-mnr.html
```

For Ship Cashbox, after JS/CSS/service-worker changes, always suspect browser service-worker cache before assuming the code failed:

```text
Hard refresh.
If needed: DevTools -> Application -> Service Workers -> unregister /ship-cashbox/.
Then clear site data for the local Ship Cashbox origin and reopen:
http://127.0.0.1:18091/ship-cashbox/index.html
```

## Ship Cashbox Product Map

Ship Cashbox must follow the locked product map:

```text
docs/ship-cashbox-product-map-sprint-01.md
docs/ship-cashbox-solo-mode-sprint-02.md
docs/ship-cashbox-visual-polish-sprint-03.md
```

Do not turn Ship Cashbox back into a set of unrelated cards or admin panels. Preserve the four entry scenarios: personal journal, crew ship cashbox, quick equalizer, and group invitation by code. In personal mode, do not leak group, treasurer, participant, invite, settlement, share, or who-owes-whom language. Personal and group starts are mode-isolated: an active group must not hijack the personal journal entry.

## Yacht Management Rule

The public yacht management page and the admin must use the same catalog:

```text
data/management-pricing.json
```

Do not create a second hardcoded pricing/service list in the public page.

## Game Platform Boundaries

Game hub files:

```text
game.brkovic.ltd/content/game-registry.json
game.brkovic.ltd/public/index.html
game.brkovic.ltd/public/assets/app.js
game.brkovic.ltd/public/assets/app.css
```

Captain Ether files:

```text
game.brkovic.ltd/content/captain-ether/
game.brkovic.ltd/public/api/captain-ether/
```

Watch Officer planning files:

```text
game.brkovic.ltd/docs/game-director/
game.brkovic.ltd/docs/watch-officer/
```

Do not let a Captain Ether chat rewrite Watch Officer docs or game hub routing unless the Game Director assigns an integration task.

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
