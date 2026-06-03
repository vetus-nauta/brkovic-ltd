# Ship Cashbox Visual Polish Sprint 03

Date: 2026-06-03
Status: active visual/product polish lock
Scope: `ship-cashbox` shell, welcome, header, service utilities
Depends on:

```text
docs/ship-cashbox-product-map-sprint-01.md
docs/ship-cashbox-solo-mode-sprint-02.md
```

## Purpose

Sprint 03 improves the product shell without changing the accounting engine.

The app must feel stable and understandable in daily use: the user sees the current mode, can return to the start screen safely, and can refresh stale PWA/browser cache without losing journal drafts.

## Rules

Allowed:

- compact header polish;
- visible current-mode chip;
- welcome screen proportion polish;
- cache-reset affordance;
- service/help wording;
- CSS-only layout tightening.

Forbidden unless a reproducible bug requires it:

- notebook persistence rewrite;
- autosave algorithm rewrite;
- physical save behavior changes;
- attachment/proof payload changes;
- invite payload changes;
- settlement math changes;
- quick equalizer backend writes.

## Implemented In This Sprint

Runtime version:

```text
Ship Cashbox shell: 20260603-cashbox-dual-mode-25
Service worker cache: ship-cashbox-shell-v20260603-62
API version: 2026.06.03-ship-cashbox-dual-mode-03
```

Changes:

- desktop header now shows a compact current-mode chip;
- mobile masthead now shows the same compact current-mode chip;
- mode chip labels: start, personal, crew, participant;
- app menu includes `Обновить приложение` / `Refresh app`;
- service window includes a cache-refresh card with the current shell version;
- cache refresh clears Ship Cashbox shell caches, unregisters the Ship Cashbox service worker, and reloads with the current `reload` key;
- records, drafts, uploaded proofs, autosave, and API storage are not deleted by refresh.
- active journal layout is denser: smaller active-card padding, shorter command deck on mobile, and more usable height for the notebook textarea.
- desktop start screen uses a wider product layout: personal journal as the large primary card, crew cashbox and quick equalizer as stacked secondary cards, invite below.
- start actions are mode-isolated: personal uses `boot&mode=personal`, group uses `boot&mode=group`, so one active group does not hijack the personal journal entry.

## Acceptance Checklist

- Start page returns 200 with `reload=20260603-cashbox-dual-mode-25`.
- `app.js` returns 200 and contains `resetShipCashboxShell`.
- `sw.js` uses `ship-cashbox-shell-v20260603-62`.
- App menu contains `cashboxMenuRefresh`.
- Desktop/mobile headers contain `data-cashbox-mode-chip`.
- JSON translations parse.
- `node --check` passes for `app.js` and `sw.js`.
- `git diff --check` passes.
- Local WebStorm mirror is synced before browser review.
