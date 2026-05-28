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

Deprecated path:

```text
/home/alexey/GitHub/Revoyacht/game-brkovic-ltd
```

Canonical local development command:

```bash
php -S 127.0.0.1:18090 -t .
```

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
