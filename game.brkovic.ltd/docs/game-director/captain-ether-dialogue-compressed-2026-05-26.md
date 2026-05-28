# Captain Ether Dialogue Compressed

**Date:** 2026-05-26  
**Status:** Closed / Success  
**Owner:** Game Director / Platform

## Issue

Captain Ether chat reported that Nav Desk links to:

```text
https://game.brkovic.ltd/games/captain-ether
```

but the shared game platform router must own deep links instead of Captain Ether owning route exceptions.

## Decision

This is a platform/router task, not Captain Ether content/API.

## Result

Local router contract is fixed:

```text
/                         -> game hub
/games/captain-ether      -> Captain Ether
/games/watch-officer      -> Watch Officer brief
unknown route             -> controlled not-found
```

After login, intended route is preserved.

## Captain Ether Boundary

Captain Ether remains a consumer of route `captain_ether`. It must not modify:

- shared platform router;
- game registry contract;
- Watch Officer docs/routes;
- Nav Desk outside a specific assigned card task.

## Next Allowed Captain Ether Task

Completed: Nav Desk now uses a general `Обучающие игры` card that opens the game hub. Captain Ether remains selectable inside the hub.
