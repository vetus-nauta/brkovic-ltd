# Repository Map

**Updated:** 2026-05-26
**Canonical repository:** `git@github.com:vetus-nauta/brkovic-ltd.git`

## Canonical Local Paths

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Main website source:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Game platform source:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Deprecated Path

Do not use this old path for new work:

```text
/home/alexey/GitHub/Revoyacht/game-brkovic-ltd
```

It was an early staging location before the game platform was moved under the main `brkovic-ltd` repository.

## Product Boundaries

| Area | Path | Owner |
| --- | --- | --- |
| Main public site | `./` | brkovic.ltd site chats |
| Nav Desk | `navdesk*.html`, `css/navdesk.css`, `js/navdesk.js` | Nav Desk chats |
| Game platform hub | `game.brkovic.ltd/public/`, `game.brkovic.ltd/content/game-registry.json` | Game Director / Platform chats |
| Captain Ether | `game.brkovic.ltd/content/captain-ether/`, `game.brkovic.ltd/public/api/captain-ether/` | Captain Ether chat |
| Watch Officer | `game.brkovic.ltd/docs/watch-officer/` then future product folder | Watch Officer / Game Director chats |

## Routing

Main Nav Desk card:

```text
brkovic-ltd/navdesk.html -> https://game.brkovic.ltd/
```

Game platform routes:

```text
https://game.brkovic.ltd/
https://game.brkovic.ltd/games/captain-ether
https://game.brkovic.ltd/games/watch-officer
```

## Rule For Agents

Before editing, identify whether the task belongs to the main site, Nav Desk, the game hub, Captain Ether, or Watch Officer. Do not edit another product's files unless the task explicitly requires an integration change.
