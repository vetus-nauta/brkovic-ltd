# Paths Quick

**Use this first.** Long handoffs may mention old paths.

## Canonical Repo

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Site

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Local:

```bash
php -S 127.0.0.1:18090 -t .
```

## Game Platform

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Local:

```bash
php -S 127.0.0.1:18110 -t game.brkovic.ltd/public
```

Production domain:

```text
https://game.brkovic.ltd/
```

Production document root:

```text
/home/brkovic/game.brkovic.ltd/public
```

## Old Path

Do not use:

```text
/home/alexey/GitHub/Revoyacht/game-brkovic-ltd
```

If an older document says `game-brkovic-ltd`, read it as:

```text
brkovic-ltd/game.brkovic.ltd
```

## Nav Desk To Game Hub

```text
navdesk.html
-> https://game.brkovic.ltd/
-> game.brkovic.ltd public hub
-> user selects Captain Ether, Watch Officer, or future games
```

## Products

Captain Ether:

```text
https://game.brkovic.ltd/games/captain-ether
game.brkovic.ltd/content/captain-ether/
game.brkovic.ltd/public/api/captain-ether/
```

Watch Officer:

```text
game.brkovic.ltd/docs/watch-officer/
```

Game registry:

```text
game.brkovic.ltd/content/game-registry.json
```

Game Director:

```text
game.brkovic.ltd/docs/game-director/
```

## FTP

FTP access is allowed for project work. Do not write passwords into repository files, docs, logs, or chat handoffs.

Use only for inspection/deploy tasks and prefer local source files as source of truth.
