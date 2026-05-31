# Ship Cashbox Review Handoff

**Date:** `2026-05-31`  
**Project:** `brkovic.ltd`  
**Scope:** `Ship Cashbox` review handoff for final cross-check  
**Working branch:** `handoff-2026-05-20-full`

## Review Target

The `Ship Cashbox` tool is ready for cross-review by:

- `SEO Director`
- `QA Director / QA-UX`
- `Frontend Manager`

Primary delivery report:

`docs/brkovic_ltd_project_office/reports/frontend-ship-cashbox-delivery-2026-05-31.md`

## Local Runtime

Repo:

`/home/alexey/GitHub/Revoyacht/brkovic-ltd`

Primary URLs:

- `http://127.0.0.1:18090/navdesk.html`
- `http://127.0.0.1:18090/ship-cashbox/index.html`

Required first action before review:

- open `Ship Cashbox`;
- run `Ctrl+Shift+R` once to refresh the updated service worker shell and current asset versions.

## What Was Fixed Before This Review

### 1. Page discipline

- Tool page was rebuilt into the accepted Nav Desk tool-page shell.
- `Nav Desk` itself was not redesigned.
- The card remains only the entry point.

### 2. Runtime stale-screen bug

- The old “post-login lands on stale version until refresh” bug was traced to the tool service worker shell cache.
- Cache strategy and versions were updated.

### 3. Financial logic

The tool no longer forces the user into a hard technical mode in UI.

User-facing model is now:

- participants spend personally when needed;
- participants may hand money to the treasurer at any moment;
- treasurer may then spend from physically held group money;
- final settlement is computed automatically from what actually happened.

### 4. Human wording

- settlement labels were rewritten away from dry arrow syntax;
- participant and treasurer views now phrase actions more like:
  - transfer to someone;
  - receive from someone;
  - treasurer returns money;
  - add money to treasurer.

## Required Role Reviews

### A. SEO Director

Focus:

- page title / meta description honesty;
- canonical / hreflang continuity;
- manifest/tool page entry sanity;
- no misleading claims around “impossible to lose data”;
- PWA/install copy remains technically honest;
- no accidental SEO drift outside this tool page.

Check files:

- `ship-cashbox/index.html`
- `lang/ru.json`
- `lang/en.json`

Expected result:

- confirm no SEO/copy blocker;
- or list exact metadata/copy corrections.

### B. QA Director / QA-UX

Focus:

- login path after hard reload;
- participant invite path;
- participant read-only path;
- manual sync behavior;
- notebook lock/unlock after pause;
- attachment source sheet;
- camera/gallery/PDF scan behavior on real devices if possible;
- final settlement wording;
- archive and reopen path;
- print / PDF open path.

Mandatory financial rerun set:

1. No physical cashbox, everyone spends personally.
2. No cashbox at start, later one participant hands money to treasurer.
3. Positive remainder with treasurer paying money back out.
4. Negative remainder where group must still cover the treasurer.

Expected result:

- PASS/FAIL report with exact browser/device evidence;
- note any wording that still reads as accounting jargon instead of normal sailing workflow.

### C. Frontend Manager

Focus:

- tool-page shell compliance with accepted Nav Desk structure;
- no accidental breakage of `navdesk.html` beyond the approved tool card;
- service worker/runtime correctness;
- localization governance under site language layer;
- responsive behavior desktop/tablet/mobile;
- in-page popovers/tooltips behavior on touch;
- no technical mode choice visible to the user where the system can infer behavior itself.

Check files:

- `ship-cashbox/index.html`
- `ship-cashbox/assets/app.js`
- `ship-cashbox/assets/app.css`
- `ship-cashbox/sw.js`
- `navdesk.html`
- `css/navdesk.css`

Expected result:

- sign off or list exact frontend cleanup items;
- no broad redesign request unless a real layout defect exists.

## Known Constraints

- This handoff does not claim production deploy.
- This handoff does not claim full real-device camera/scan QA has already been completed.
- This handoff does not claim a production SEO audit has already passed.
- The working local dataset was restored after scenario testing; no synthetic review sessions were left in storage.

## Director Close Condition

The feature should be treated as ready only after:

1. `Frontend Manager` confirms shell/runtime/page-discipline fit.
2. `QA Director / QA-UX` confirms browser/device workflow and settlement understanding.
3. `SEO Director` confirms metadata/copy honesty and no surface-level SEO blocker.

If all three pass, `Ship Cashbox` can move from implementation-complete to release-candidate review status.
