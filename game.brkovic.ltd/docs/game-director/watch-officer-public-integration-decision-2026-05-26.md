# Watch Officer Public Integration Decision

**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Approved for staged public integration candidate  
**Scope:** `game.brkovic.ltd`

## Decision

Watch Officer is approved for a staged public integration candidate in the repository.

This is not a production deployment approval and not a final training-content approval.

The next implementation may place the verified local Godot Web export into a public-path candidate inside the local repo, wire the game hub to it, and prepare headers required by the Godot Web runtime. Production upload/deploy remains closed until a separate QA review and Game Director approval.

## Approved Candidate Path

Use:

```text
game.brkovic.ltd/public/play/watch-officer/
```

Expected public URL after future deployment:

```text
https://game.brkovic.ltd/play/watch-officer/
```

Do not replace the game hub route:

```text
https://game.brkovic.ltd/games/watch-officer
```

The hub route should remain the product card/brief route and may link to the prototype candidate route.

## Required Runtime Headers

The Godot Web build must be served with Cross-Origin Isolation headers:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

The integration must add these headers only for the Watch Officer Web build path if possible, not globally for all `game.brkovic.ltd`.

## Required Copy Source

Use the already verified local export artifacts from:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

Do not run a new export unless the task explicitly requires it.

## Required Hub Behaviour

`/games/watch-officer` should show Watch Officer as a prototype/draft product and offer a clear action to open:

```text
/play/watch-officer/
```

The copy must keep draft/non-final training wording visible. It must not say or imply:

```text
official
certified
COLREGS compliant
correct rule
```

## Boundaries

Do not:

- deploy to production;
- upload through FTP;
- modify Captain Ether gameplay;
- modify auth or production config;
- modify Nav Desk;
- remove draft/non-final status;
- present Watch Officer as final maritime training content.

## Next Task

Assign `TASK-0061 - Watch Officer Staged Public Integration Candidate`.
