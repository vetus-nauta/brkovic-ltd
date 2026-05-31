# Frontend Report - Ship Cashbox Delivery

**Task ID:** `BRK-MVP-FE-SHIP-CASHBOX-001`  
**Date:** `2026-05-31`  
**Owner:** `Codex direct implementation`  
**Status:** `Ready for cross-review`

## Summary

Delivered the `Ship Cashbox` tool page and its working logic inside `brkovic.ltd` / `Nav Desk` without redesigning the rest of the site.

The tool now works as a dedicated page under the site shell, reuses the existing theme/localization stack, supports participant notebooks plus treasurer workflow, and uses one unified settlement model:

- participants may spend their own money on the common purpose;
- participants may hand money to the treasurer at any moment;
- the treasurer may then spend from money physically held in the cashbox;
- final settlement is resolved automatically either as:
  - direct participant-to-participant transfers when no physical cashbox exists;
  - treasurer-mediated payouts/top-ups when money was handed to the treasurer.

## Scope

Changed only the `Ship Cashbox` page, its API, and its Nav Desk entry card.  
No redesign of unrelated Nav Desk tools was performed.

## Changed Files

- `ship-cashbox/index.html`
- `ship-cashbox/assets/app.js`
- `ship-cashbox/assets/app.css`
- `ship-cashbox/api/index.php`
- `ship-cashbox/sw.js`
- `navdesk.html`
- `css/navdesk.css`
- `js/navdesk.js`
- `lang/ru.json`
- `lang/en.json`

## Delivered Behavior

### 1. Site-shell integration

- `Ship Cashbox` is now a real Nav Desk tool page, not a detached mini-app shell.
- It uses:
  - common header;
  - common footer;
  - common disclaimer layer;
  - common `day/night` state via `navdesk_watch_theme_v1`;
  - common site localization flow.

### 2. Nav Desk entry card

- Card is placed first among tools and visually highlighted.
- Card text was rewritten to the honest storage/sync model instead of overstating data safety.
- Card remains only an entry point; the tool itself lives on its own page.

### 3. Main working model

- Main screen reduced to one large working notebook.
- Secondary actions moved into `Menu`.
- Notebook autosaves.
- Participant sees only the minimal working surface plus settlement/result windows in `Menu`.
- Treasurer sees the same main notebook surface plus team/settlement/report windows in `Menu`.

### 4. Participant and treasurer logic

- Treasurer remains a participant when included in settlement.
- Each participant has a personal notebook.
- Participants can open each other in read-only mode.
- Group invite remains treasurer-only.
- Closed cashboxes can be reopened and recalculated.

### 5. Sync model

- Participant notebook is stored locally first.
- Manual sync button is available.
- Scheduled sync slots remain:
  - `07:00`
  - `15:00`
  - `00:00`
- If there is no connection, that slot is skipped.
- Server receives notebook snapshots without duplicate re-append behavior.

### 6. Cashbox and settlement model

The old model was too coarse because it mixed together:

- personal spending on the group;
- money physically handed to the treasurer;
- spending made by the treasurer from the physical cashbox.

That was reworked.

Current model separates:

- participant personal expenses;
- amounts handed to the treasurer;
- treasurer spending from the physical cashbox when such money exists;
- remaining cash physically held by the treasurer.

User-facing behavior:

- every participant row has the field `Передал казначею` / `Given to treasurer`;
- that field can be filled at any moment during the group lifecycle;
- users are not forced to choose a technical settlement mode in advance;
- the backend resolves settlement mode automatically from actual data.

Settlement outcomes:

- if nobody handed money to the treasurer, final settlement becomes direct participant transfers;
- if money was handed to the treasurer, settlement becomes treasurer-mediated payout/top-up logic with remaining cash accounted for.

### 7. Attachments and light PDF scan

- One attachment button now opens a small source sheet:
  - gallery;
  - camera;
  - light PDF scan.
- Scan mode converts an image client-side into a lightweight one-page PDF and uploads it through the existing media backend.
- Attachments list now supports:
  - images;
  - PDF receipts.

### 8. Hints and instruction layer

- Short instruction was added to `Menu`.
- Complex actions received proper in-page question-mark popovers instead of hover-only `title`.
- Popovers work on click/tap, close on outside click, and close on `Esc`.

### 9. PWA/runtime fix

The “old page after login until refresh” problem was real.

Cause:

- the tool service worker cached an old shell and stale asset versions.

Fix:

- `sw.js` cache name bumped;
- stale shell references updated;
- shell requests switched to `network-first` behavior for runtime `html/js/css`;
- login flow now clears `ship-cashbox` caches and redirects cleanly.

## Financial Scenarios Verified

All scenarios were executed against the live local API at:

`http://127.0.0.1:18090/ship-cashbox/api/`

Test safety:

- before running scenarios, `ship-cashbox/storage` was archived;
- after the run, storage was restored to the original state;
- no test sessions were left in the working dataset.

### Scenario 1 - direct only

- no physical cashbox;
- Treasurer spent `20`;
- Vasya spent `70`;
- Tanya spent `0`.

Result:

- direct settlement mode;
- share `30`;
- `Treasurer -> Vasya : 10`;
- `Tanya -> Vasya : 30`.

### Scenario 2 - late handover to treasurer

- initially no physical cashbox;
- Vasya spent `50` personally;
- later Elvira handed `200` to the treasurer;
- treasurer spent `120` from that physical cashbox.

Result:

- treasurer-mediated settlement;
- physical cash remaining with treasurer `80`;
- share `42.5`;
- `Treasurer -> Vasya : 7.5`;
- `Tanya -> Treasurer : 42.5`;
- `Treasurer -> Elvira : 157.5`.

### Scenario 3 - positive remainder

- Vasya handed `300` to the treasurer;
- treasurer spent `90`.

Result:

- physical cash remaining `210`;
- share `30`;
- `Treasurer -> Vasya : 270`;
- `Tanya -> Treasurer : 30`.

### Scenario 4 - negative remainder

- Vasya handed `50`;
- Tanya handed `50`;
- treasurer spent `180`;
- Elvira additionally spent `20` personally.

Result:

- physical cash balance `-80`;
- share `50`;
- `Elvira -> Treasurer : 30`.

## Verification Performed

- `node --check ship-cashbox/assets/app.js`
- `node -e "JSON.parse(...ru.json); JSON.parse(...en.json)"`
- local HTTP reachability:
  - `/ship-cashbox/index.html`
  - `/ship-cashbox/api/?action=boot`
- live scenario execution through local API:
  - create
  - invite/open participant
  - participant save
  - treasurer save
  - settlement confirm
  - export generation
  - archive handoff
- storage restore after scenario execution.

## Important Notes

- `Ship Cashbox` attachment flow reuses the existing admin media backend. No new storage backend was introduced.
- The browser/device path for real camera capture and native share sheets still needs device QA.
- Browser print/PDF opening was not visually audited in a full interactive browser session during this document pass; export generation and print HTML generation are present and the API/export path works.
- Users still need one hard reload after this delivery because:
  - `app.js` version changed;
  - the tool service worker shell changed.

## Residual Risks

- Mobile/browser-specific camera permission quirks may still exist and require real-device QA.
- Service worker update timing can still look stale on a device that has aggressively cached the old shell until the first clean reload.
- The tool is now much more coherent financially, but UX wording should still get a final review from QA/UX to ensure everyday sailors understand:
  - personal spending;
  - money handed to the treasurer;
  - treasurer-held remainder;
  - final settlement outcome.

## Recommended Next Review Order

1. `Frontend Manager`  
   Validate shell integration, cache/runtime behavior, and page discipline.
2. `QA Director` / `QA-UX`  
   Rerun the working scenarios in browser/device flows and print/PDF/UI states.
3. `SEO Director`  
   Verify metadata, manifest/tool-entry behavior, and confirm there are no misleading claims.
