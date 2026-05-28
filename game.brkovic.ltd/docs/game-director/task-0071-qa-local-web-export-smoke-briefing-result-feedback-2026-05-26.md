# TASK-0071 - QA Local Web Export Smoke: Briefing + Result Feedback Pack

**Chat ID:** CHAT-QA-001  
**Department:** QA / Validation  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Export Path

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/local-web-export-briefing-result-feedback-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-briefing-result-feedback-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md`
- `game.brkovic.ltd/docs/watch-officer/qa-watch-officer-production-smoke-review.md`

## Task

Run QA local browser smoke for the updated Godot Web export containing the `Briefing + Result Feedback Pack`.

This is local export QA only. Do not copy artifacts to `public/`, deploy, upload by FTP, or modify production files.

## Check Specifically

- required Web export artifacts exist:
  - `index.html`;
  - `index.js`;
  - `index.wasm`;
  - `index.pck`;
  - `index.worker.js`;
  - `index.audio.worklet.js`;
- local server can serve the export with Web runtime headers;
- browser loads the local Web build;
- canvas renders non-empty;
- ready state shows briefing;
- briefing contains objective, situation, controls, and draft/non-final wording;
- `Space` starts the attempt and hides briefing;
- result feedback can be reached if feasible in browser smoke or documented as covered by headless test;
- `R` reset returns to ready state and briefing visible;
- VTS remains disabled/inactive;
- no VTS popup appears;
- no final, official, certified, or COLREGS-compliant training claim appears;
- public production files, Captain Ether, Nav Desk, router/registry, auth, production config, and deploy state remain untouched.

## Suggested Local Server

Use a localhost server that injects the same headers required for Godot Web:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

Document the exact command.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/qa-local-web-export-briefing-result-feedback-review.md
```

The review must state one of:

- `approved-for-staged-public-candidate`
- `changes-required`
- `blocked`

Record:

- local server command;
- browser smoke method;
- pass/fail summaries;
- screenshot paths if produced;
- implementation acceptance result;
- any blocking changes;
- confirmation that QA did not deploy, copy to public, edit code, touch Captain Ether, Nav Desk, router/registry, auth, production config, or deploy state.

## Required Chat Reply

Use compressed project style:

```text
TASK-0071 done.
Report: game.brkovic.ltd/docs/watch-officer/qa-local-web-export-briefing-result-feedback-review.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, Captain Ether, Nav Desk, router/registry, auth, production config, and deploy state not touched.
Next expected: Game Director staged public candidate decision or changes-required owner
```

## Boundaries

- Do not deploy.
- Do not upload by FTP.
- Do not copy artifacts to `game.brkovic.ltd/public/`.
- Do not modify production files.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not modify auth.
- Do not create a new scenario.
- Do not introduce VTS for scenario 1.
- Do not add new maritime rules.
- Do not present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.
