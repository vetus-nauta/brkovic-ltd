# Project Rules

This is the main `brkovic.ltd` project.

Start with the compact path map:

```text
PATHS_QUICK.md
```

Canonical repository:

```text
git@github.com:vetus-nauta/brkovic-ltd.git
```

Constant rule:

```text
brkovic-ltd is the canonical production repository.
game.brkovic.ltd is a subproject inside brkovic-ltd.
Revoyacht / yacht-flex-demo are experimental and must stay separate.
```

Canonical paths:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Local test/browser path:

```text
/home/alexey/WebstormProjects/brkovic-ltd
```

Deprecated path:

```text
/home/alexey/GitHub/Revoyacht/game-brkovic-ltd
```

Canonical local development command:

```bash
php -S 127.0.0.1:18090 -t .
```

Local workflow rule:

```text
GitHub/source copy:  /home/alexey/GitHub/Revoyacht/brkovic-ltd
WebStorm/test copy: /home/alexey/WebstormProjects/brkovic-ltd
```

The local browser etalon already exists. Check existing localhost before creating anything:

```text
http://127.0.0.1:18090/
http://127.0.0.1:18091/
http://127.0.0.1:18091/ship-cashbox/index.html
```

Do not create a new local server, stub, or third project copy unless explicitly requested. `brkovic-local.local` may show an old Apache/PHP stub and is not the current Ship Cashbox etalon.

When code is changed in the GitHub/source copy, mirror the touched files into the WebStorm/test copy before asking for browser inspection.

For Ship Cashbox, if browser behavior looks stale, clear/unregister the `/ship-cashbox/` service worker and site data before assuming the code did not change.

Ship Cashbox product map:

```text
docs/ship-cashbox-product-map-sprint-01.md
docs/ship-cashbox-solo-mode-sprint-02.md
```

Keep the product route locked: personal journal, crew ship cashbox, quick equalizer, and group invitation by code. Do not reintroduce unrelated dashboards, admin panels, or feature-card sprawl into the operational screens. Personal mode must not show group, treasurer, participant, invite, settlement, share, or who-owes-whom language.

Canonical management data file:

```text
data/management-pricing.json
```

The admin and public management page must always reflect this same data file.

Game platform source:

```text
game.brkovic.ltd/
```

Do not mix Captain Ether, Watch Officer, Nav Desk, and main-site changes without an explicit integration task.
