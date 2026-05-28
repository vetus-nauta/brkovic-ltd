# Game Director Dashboard

**Date:** 2026-05-26  
**Project:** `game.brkovic.ltd`  
**Owner:** Game Director

## Canonical Path

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Old path `/home/alexey/GitHub/Revoyacht/game-brkovic-ltd` is deprecated.

## Current Direction

`game.brkovic.ltd` is the standalone game platform for the Brkovic maritime ecosystem. The root page is the game selection hub. Individual products live as cards and routes inside the same platform.

## Product Registry

| Product | Slug | Status | Route | Notes |
| --- | --- | --- | --- | --- |
| Капитан — Эфир | `captain_ether` | Active | `/games/captain-ether` | Existing Sea Speak / radio trainer. Selected inside game hub. |
| Watch Officer | `watch_officer` | Public prototype / draft | `/games/watch-officer` | Second product. Production prototype is live at `/play/watch-officer/`; final training approval is not granted. |
| Оседлавший ветер | `wind_rider` | Planned | `/games/wind-rider` | Future sailing/wind product. |
| Мистический боцман | `mystic_boatswain` | Planned | `/games/mystic-boatswain` | Future yacht/ship terminology product. |

## Current Decisions

### GD-20260526-00 - CEO Approval

CEO approved the repository structure and confirmed the routes were checked.

### GD-20260526-01 - Root Is Game Selection Hub

The root page must present the platform and game cards, not behave as a landing page for only the first game.

### GD-20260526-02 - Nav Desk Links To Game Hub

The main `brkovic.ltd` Nav Desk card should link to `https://game.brkovic.ltd/`, so Nav Desk opens the training game section. Captain Ether, Watch Officer, and future games are selected inside the game hub.

### GD-20260526-03 - Watch Officer Prototype/Draft Candidate Exists

Watch Officer has advanced past initial registration: it has a local QA-approved prototype/draft public candidate and is assigned for controlled production deployment under `/play/watch-officer/`.

It is still not final maritime training content.

Current production status: controlled prototype deploy completed and independent QA public production smoke approved it as live prototype/draft.

## Active Blockers

| Blocker | Impact | Next Action |
| --- | --- | --- |
| Watch Officer maritime rules are draft-approved, not final maritime authority | Cannot ship final educational claims | Pass report to QA via `TASK-0008` |
| Watch Officer UI/HUD is for review | Cannot build prototype confidently until accepted | Review `TASK-0006` |
| Safe-water geometry monitor is approved by QA | Headless tests through geometry are green | Done; warning foundation implemented |
| Warning escalation foundation is approved by QA | Headless warning test is green | Done; result foundation assigned |
| Scenario result evaluation foundation is approved by QA | Headless result test is green | Done; orchestrator assigned |
| Headless runtime foundation is approved by QA | Orchestrator and all prior tests are green | Done; shift to playable greybox |
| Playable greybox scene pack is approved by QA | Local Godot prototype is accepted as first visible build | Done; HUD/readability assigned |
| HUD binding and readability pack is approved by QA | Local HUD is readable and snapshot-bound | Done; local play loop assigned |
| Local play loop polish pack is approved by QA | Local prototype is ready for export readiness review | Done; export readiness assigned |
| Local Web export behavior is approved by QA | Browser smoke passed with COOP/COEP local server | Done; staged public candidate assigned |
| Watch Officer staged public candidate is created | Local repo integration only, no production deploy | QA review via `TASK-0062` |
| Watch Officer staged public candidate is QA-approved | Public route/browser/header smoke passed locally | Controlled deploy via `TASK-0063` |
| Watch Officer production prototype is live | Independent QA public smoke passed | Keep draft/non-final limits active |
| Captain Ether Batch 003 production smoke passed | Production QA rerun passed with approved private login path | Close Batch 003 |
| Watch Officer briefing + result feedback deployed | Controlled deploy passed | QA production smoke via `TASK-0077` |
| Captain Ether Batch 004 production smoke auth access blocked | Approved private QA code channel returns auth_failed | Platform Auth via `TASK-0076` |
| Shared ecosystem login is disabled | Users still use email-code fallback | Wait for account system on `brkovic.ltd` |

## Next Tasks

1. Review Watch Officer Product Bible and MVP Brief.
2. Review UI/UX report for heading-up lower-third layout.
3. Review Engine report for a tiny Godot prototype plan.
4. Review QA validation checklist.
5. Review first-scenario decision pack.
6. Execute `TASK-0077`: QA production smoke for Watch Officer briefing + result feedback.
7. Execute `TASK-0076`: Platform Auth refresh Captain Ether Batch 004 QA code channel.
8. Then assign Captain Ether Batch 004 rerun when access is restored.
9. Keep Watch Officer as prototype/draft; final maritime training approval remains closed.
10. Keep Captain Ether content/API, Nav Desk, Watch Officer unrelated files, auth implementation, and unrelated production config closed unless explicitly assigned.

## Operational Files

- `docs/game-director/decision-log.md`
- `docs/game-director/workstreams.md`
- `docs/game-director/chat-registry.md`
- `docs/game-director/task-registry.md`
- `docs/game-director/chat-assignment-template.md`
