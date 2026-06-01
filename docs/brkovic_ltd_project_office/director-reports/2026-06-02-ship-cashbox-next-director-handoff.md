# Ship Cashbox Next Director Handoff - 2026-06-02

**Project:** `brkovic-ltd`  
**Local root:** `/home/alexey/GitHub/Revoyacht/brkovic-ltd`  
**Branch:** `handoff-2026-05-20-full`  
**Main file:** `ship-cashbox/assets/app.js`  
**Style file:** `ship-cashbox/assets/app.css`  
**Status:** continue tomorrow from local source as the reference.

This handoff is for WebStorm and the next director chat. It contains operational context only. Do not place passwords, API keys, FTP credentials, MongoDB connection strings, mail tokens, or private URLs in this document or in Git.

## First Commands

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

Run the local Ship Cashbox page:

```bash
php -S 127.0.0.1:18091 -t .
```

Open:

```text
http://127.0.0.1:18091/ship-cashbox/index.html
```

If UI changes appear stale, hard refresh once and unregister the old service worker if needed.

## Current Working Truth

The local repository is the reference. Production may be behind or may have stale service-worker/cache behavior. Do not treat production visuals as source of truth until the next polished local package is validated and uploaded.

The cashbox is an application, not a long web page. The next design pass must move it toward short, fast, app-like screens:

1. Home / current cashbox state.
2. Cashbox menu.
3. Team and contributions.
4. Participant detail.
5. Invite participant.
6. Expenses / working notebook.
7. Final settlement.
8. Archive.
9. Print / PDF report.
10. Starter provisioning pack.

## User Direction Captured

- No heavy headers inside the mobile app.
- Keep only compact identity: `Судовая касса / Vetus Nauta - Brkovic`.
- Use a real app menu, not a vague `Еще`.
- Menu must include:
  - Nav Desk / Shtrurmanskiy stol return,
  - Ship Cashbox app menu,
  - language,
  - day/night,
  - account login/logout,
  - PWA install,
  - active group indicator.
- Entering Ship Cashbox from Nav Desk should reuse Nav Desk auth.
- Entering from browser/search follows normal auth.
- Treasurer creates group and is treasurer/admin only inside that group.
- Invited participant is participant inside that group, but can be treasurer in another group.
- Participant must see only personal group-relevant inputs and own expenses, not full group finances.
- Group logic should infer mode from actual behavior:
  - if money is given to treasurer, treasurer-mediated settlement is used;
  - if not, direct settlement works from personal expenses.
- Invite email must be human:
  - group name visible;
  - large accept button;
  - clear explanation of what the participant can do and how not to lose the group.
- Archive cards should be clean:
  - choose report;
  - modal contains actions: activate, delete with 10-day retention, save PDF;
  - no button pile under every card.
- Final settlement must be its own page/screen in the menu.
- Mobile keyboard behavior in the notebook must be stable.
- Buttons must show clear human feedback; no dead-looking save buttons.

## Reference Package From User

User provided a Drive reference package on 2026-06-02:

```text
https://drive.google.com/file/d/1pRrkQSYVUMdOdFTh_k9FqetGedpE97aI/view
```

It contained a lightweight static front reference:

- `index.html`
- `styles.css`
- `DEVELOPER_NOTE.md`

Important rule from the reference: do not break the quick expense notebook. Do not rewrite notebook API, handlers, payload, photos, scans, autosave, or backend endpoints. The next pass should adapt visual structure and screen routing around the existing working mechanics.

## Work Completed Today

### Auth / runtime stability

- Tool API calls now use no-store fetch and frontend timeouts.
- Viewer checks are guarded against parallel re-entry.
- Service worker bypasses dynamic API/auth paths and network-first shell/runtime paths.
- Shell cache/version was bumped to:

```text
20260602-cashbox-debt-pdf-01
ship-cashbox-shell-v20260602-01
```

### PDF / print report

Added a landscape debt-matrix PDF/print report:

- final settlement matrix;
- who pays whom;
- compact participant totals;
- transfer grid;
- bottom brand/footer;
- reduced header so the table stays whole on the page.

Important functions:

```text
buildDebtMatrix(session)
renderDebtMatrixTable(matrix)
renderDebtTransferGrid(matrix)
buildDebtMatrixPrintHtml(session)
printSettlementPdf()
printArchiveSettlementPdf(sessionId)
```

### Test group

A local preview of the test weekly yacht group was restored for inspection under local auth:

```text
ship-cashbox/storage/sessions/2026/cashbox_test_weekly_yacht_local_preview_20260602.json
```

The original live/test owner context was preserved separately and should not be treated as production data.

### Localization

Debt-matrix / PDF report strings were added to:

```text
lang/ru.json
lang/en.json
lang/de.json
lang/es.json
lang/it.json
lang/sr.json
lang/zh.json
```

## Tomorrow Plan

### Sprint 1 - App shell and navigation discipline

Goal: make Ship Cashbox feel like a compact mobile PWA, not a long accounting page.

Tasks:

1. Introduce short-screen state routing inside `app.js`.
2. Keep existing backend and notebook mechanics.
3. Replace oversized non-operational headers inside secondary screens with compact app title/breadcrumb.
4. Build proper app menu:
   - group,
   - team,
   - invite,
   - expenses,
   - settlement,
   - archive,
   - report/PDF,
   - language,
   - theme,
   - account,
   - PWA install,
   - return to Nav Desk / brkovic.ltd.
5. Fix mobile modal and nested scrolling:
   - page behind modal must not scroll;
   - modal body must scroll when content is longer than viewport.

Done condition:

- mobile viewport has no long header occupying working space;
- all menu entries open meaningful screens;
- no duplicated invite buttons on one screen;
- no stale hidden state after returning from a screen.

### Sprint 2 - Group and participant UX

Goal: make group creation and participation obvious.

Tasks:

1. Treasurer creates/accepts treasury, names group, and sees compact active group card.
2. Invite screen sends human email with accept button and group explanation.
3. Team screen shows participants compactly:
   - pending,
   - accepted,
   - contribution/given amount,
   - remove participant action.
4. Participant view shows only:
   - current group,
   - own notebook,
   - own submitted expense cards,
   - personal status.
5. Treasurer sees group overview and submitted participant cards.
6. Submitted participant card can be accepted/activated and disappears from pending card list after processing.

Done condition:

- seven-person test group is understandable without explanation;
- treasurer and participant views differ cleanly;
- no old numbers remain stuck in input fields after save/submit.

### Sprint 3 - Settlement, archive, PDF

Goal: make final calculation visible, printable, and not buried.

Tasks:

1. Move final settlement to its own screen.
2. Split treasurer personal expenses from treasurer cashbox expenses in charts and stats.
3. Remove irrelevant `cashbox spending` from ordinary participant rows.
4. Compact balance rows so numbers do not stick to words.
5. Move long details behind buttons/modals.
6. Keep PDF button working from active settlement and archive report.
7. Archive opens report detail first, then actions.

Done condition:

- final settlement is found from menu in one tap;
- report prints to landscape PDF without broken half-page table;
- archive has no pile of repeated buttons under every card.

### Sprint 4 - Starter Provisioning Pack

Goal: add a friendly optional starting food checklist for yacht trips.

User idea:

- 2 to 10 people;
- number of days;
- European-style estimated prices;
- quick checklist for provisioning before departure;
- editable quantities/prices;
- export/print together with cashbox if useful.

Recommended MVP:

1. Add static baseline table first, no external dependency.
2. Let user choose people count and days.
3. Generate categories:
   - water and drinks,
   - breakfast,
   - simple lunches,
   - dinners,
   - fruit/snacks,
   - cleaning/consumables,
   - emergency reserve.
4. Allow manual price override.
5. Save generated list as a cashbox expense draft or separate provisioning note.

Possible online price sources for later:

- Open Food Facts Open Prices;
- Voli Montenegro public shop data;
- local public price sites when legally and technically usable.

Do not make online prices required for MVP. Coverage changes, shops alter markup, and the cashbox must remain useful offline.

## Validation Checklist

Run before upload or commit:

```bash
node --check ship-cashbox/assets/app.js
node --check ship-cashbox/sw.js
php -l ship-cashbox/api/index.php
node - <<'NODE'
const fs = require('fs');
for (const file of ['ru','en','de','es','it','sr','zh'].map(x => `lang/${x}.json`)) {
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log('ok', file);
}
NODE
git diff --check
```

Manual test:

1. Open local Ship Cashbox.
2. Login / local auth flow completes without hanging.
3. Open test group.
4. Open team and contributions.
5. Invite participant.
6. Enter/edit participant contribution.
7. Save.
8. Open expenses/notebook on mobile viewport.
9. Type with keyboard open.
10. Submit/save report.
11. Open final settlement screen.
12. Print/save PDF.
13. Open archive and report detail.

## Deployment Discipline

- Do local first.
- Upload only after local smoke passes.
- Do not upload runtime storage unless explicitly needed.
- Do not use destructive mirror-delete.
- Do not commit secrets.
- If production behaves strangely, first suspect stale service worker/cache and verify version strings on live.

## GitHub / WebStorm Closeout

This document is the WebStorm entry point for the next director. The current intended GitHub commit should include:

- Ship Cashbox frontend/runtime fixes.
- Ship Cashbox API/auth timeout hardening.
- Ship Cashbox service worker version/caching update.
- Localized debt-matrix report strings.
- This handoff.

The next chat should start by reading this handoff and then continue implementation from Sprint 1.
