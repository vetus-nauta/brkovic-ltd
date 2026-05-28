# Nav Desk To Game Hub Route Note

**Date:** 2026-05-26  
**Owner:** Game Director  
**Status:** Current

## Current Route

```text
brkovic-ltd/navdesk.html
  -> https://game.brkovic.ltd/
  -> game.brkovic.ltd/public/.htaccess
  -> game.brkovic.ltd/public/index.html
  -> game.brkovic.ltd/public/assets/app.js
  -> game hub
  -> user selects Captain Ether, Watch Officer, or future games
```

## What Was Changed

The Nav Desk card was changed from a single-game entry:

```text
https://game.brkovic.ltd/games/captain-ether
```

to:

```text
https://game.brkovic.ltd/
```

This keeps Nav Desk focused on the training games section. Captain Ether keeps its direct route inside the hub.

## Validation Performed

- `public/assets/app.js` syntax checked with `node --check`.
- `content/game-registry.json` parsed as JSON.
- PHP lint was not available locally because `php` is not installed in the current shell.
