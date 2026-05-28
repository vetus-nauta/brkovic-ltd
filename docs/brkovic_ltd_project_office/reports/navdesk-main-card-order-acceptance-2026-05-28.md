# NavDesk Main Card Order Acceptance

**Date:** 2026-05-28
**Owner:** Frontend Engineer / Director acceptance
**Status:** Approved for MVP

## Summary

The NavDesk main page card-order polish is accepted for MVP.

## Accepted Behavior

- Desktop: cards read as `01-03` on the first row and `04-05` on the second row.
- The operational card (`Вахтенный журнал`) is wider than the learning card, making the progression from simple tools to heavier operational work clearer.
- Tablet: cards flow as `2/2/1`.
- Mobile: cards use one column; number badges do not overlap text.
- Day and night modes both keep the same layout and read as a theme switch, not a page change.
- Shared NavDesk disclaimer behavior was not changed.

## Verification

- `git diff --check -- navdesk.html css/navdesk.css`
- Headless Chrome smoke through local page:
  - desktop `1440`;
  - tablet `900`;
  - mobile `390`;
  - day and night modes.
- Screenshots produced during checks:
  - `/tmp/brkovic-navdesk-main-desktop-day.png`
  - `/tmp/brkovic-navdesk-main-desktop-night.png`
  - `/tmp/brkovic-navdesk-main-tablet-day.png`
  - `/tmp/brkovic-navdesk-main-tablet-night.png`
  - `/tmp/brkovic-navdesk-main-mobile-day.png`
  - `/tmp/brkovic-navdesk-main-mobile-night.png`
  - `/tmp/brkovic-navdesk-order-day.png`
  - `/tmp/brkovic-navdesk-order-night.png`

## Remaining Risk

- On mobile, the tool cards sit below the first screen because the header and hero remain large. The grid itself is correct and has no horizontal overflow; shortening the mobile hero is a separate owner-approved UX decision.
