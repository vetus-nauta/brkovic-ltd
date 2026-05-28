# NavDesk Frontend Polish Sprint

**Date:** 2026-05-27
**Director:** BRKOVIC.LTD MVP Director
**Status:** Assigned

## Sprint Goal

Bring NavDesk MVP to a coherent, working front-end state without redesigning the product:

- preserve the shared NavDesk disclaimer behavior;
- preserve day/night mode as a core NavDesk feature;
- keep all changes local until a separate deploy gate;
- improve visual hierarchy and readability across desktop, tablet, and mobile;
- verify practical tools, especially route calculations and print/PDF output.

## Scope

### Frontend Engineer

Primary ownership:

- `navdesk.html`
- `navdesk-ukv.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-watch.html`
- `navdesk-english.html`
- `css/navdesk.css`
- `js/navdesk.js` only for UI behavior or print behavior fixes

Tasks:

1. Fix night-mode visual treatment of UKV radio-spelling output cards/tokens.
2. Improve NavDesk main page visual hierarchy from simple to complex tools.
3. Keep layout compact and readable across desktop, tablet, and mobile.
4. Avoid product redesign and avoid rewriting marketing text.
5. Report any taste-level UX decision for owner approval instead of silently changing it.

### QA / Functional Audit

Primary ownership:

- functional review, not redesign;
- route calculations, orthodrome/loxodrome, tables, coordinates, print/PDF;
- quick smoke of watch, tides, UKV, English placeholder pages;
- responsive risks across desktop/tablet/mobile.

Tasks:

1. Verify what works, what is facade, and what is incomplete in route tools.
2. Review print/PDF outputs and identify missing report-format work.
3. Report findings by criticality with file and scenario references.

## Guardrails

- No production FTP/SFTP or live API changes.
- No destructive git commands.
- Do not revert unrelated dirty worktree changes.
- Do not break day/night, shared disclaimer, or existing working tools.
- If the decision is visual taste rather than a clear bug, escalate to Director/owner.

## Acceptance

The sprint is ready for Director review when:

- UKV spelling output is visually coherent in night mode;
- NavDesk main page has a clearer MVP hierarchy without radical redesign;
- route/print/PDF functional audit is delivered;
- desktop/tablet/mobile risks are documented;
- changed files and remaining risks are listed in worker reports.
