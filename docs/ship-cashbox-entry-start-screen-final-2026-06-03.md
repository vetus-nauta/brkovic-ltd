# Ship Cashbox Entry Screen Final

Date: 2026-06-03
Build: `20260603-cashbox-entry-final-order-01`
Service worker: `ship-cashbox-shell-v20260603-105`

## Scope

Closed the Ship Cashbox first-entry screen as the current working version.

The final pass stabilizes the start page across day and night modes:

- one fixed geometry contract for the guest entry screen;
- no layout jump between day/night mode switches;
- compact spacing between the Nav Desk header, entry hero, cards, and invite block;
- transparent layout wrappers instead of extra panel backgrounds between cards;
- theme-specific color only, with matching dimensions and placement;
- one guest header menu for Ship Cashbox, with the general site menu guarded from mounting a duplicate.

## Files

- `ship-cashbox/assets/app.css`
- `ship-cashbox/assets/app.js`
- `ship-cashbox/index.html`
- `ship-cashbox/sw.js`
- `ship-cashbox/scripts/smoke-local.sh`
- `js/main.js`

## Verification

Local smoke passed:

```text
SMOKE_OK http://127.0.0.1:18090 20260603-cashbox-entry-final-order-01
```

Inspection URL:

```text
http://127.0.0.1:18090/ship-cashbox/index.html?welcome=1&reload=20260603-cashbox-entry-final-order-01
```

## Handoff Summary

The first-entry screen work involved cleanup after several layered header and guest-layout attempts. The accepted direction is now:

- preserve the mounted Nav Desk-style header;
- stop changing logo assets;
- keep the entry page as a compact working surface, not a marketing hero;
- make day/night twin layouts with only color differences;
- avoid additional background panels between the cards.

Future work should avoid adding another guest-header or start-screen override block. If more polish is needed, edit the final contract block in `ship-cashbox/assets/app.css` instead of adding another competing layer.
