# Platform Router Contract

**Date:** 2026-05-26  
**Owner:** Game Director / Platform  
**Status:** Local patch ready

## Decision

`content/game-registry.json` owns canonical game routes through `entry_route`.

The platform shell in `public/assets/app.js` must:

- load the game registry;
- match `window.location.pathname` to `entry_route`;
- call `renderGameRoute(game)` for known games;
- keep `/` and `/index.html` as the game hub;
- show a controlled not-found screen for unknown routes;
- preserve the intended route through login.

## Current Routes

```text
/                         -> game hub
/games/captain-ether      -> Captain Ether
/games/watch-officer      -> Watch Officer pre-production brief
unknown route             -> controlled not-found screen
```

## Captain Ether Boundary

Captain Ether consumes the route `captain_ether`. It does not own the shared router, registry contract, or hub navigation.

## Validation

Local checks passed:

```bash
node --check game.brkovic.ltd/public/assets/app.js
node -e "JSON.parse(require('fs').readFileSync('game.brkovic.ltd/content/game-registry.json','utf8'))"
```

PHP/browser smoke testing still requires a PHP runtime or deployment environment.
