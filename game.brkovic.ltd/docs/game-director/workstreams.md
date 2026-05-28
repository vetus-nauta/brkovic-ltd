# Watch Officer Workstreams

**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Updated:** 2026-05-27

## Purpose

This chat is split into workstreams so reports from other chats do not mix into one decision pile.

## Workstreams

| Stream | Owner Chat | Current Focus | Status |
| --- | --- | --- | --- |
| GD | ШЕФ ПРОЕКТА Watch Officer | Decisions, scope, task assignment | Active |
| Gameplay | Lead Maritime Gameplay Designer | Scenario 2 Head-On Port-to-Port rules decision pack | TASK-0093 for review |
| Visual | Visual Comfort / Art Direction Lead | Watch Officer visual comfort art direction spec | TASK-0091 approved as input |
| Audio | Audio Direction / Sound Design Lead | Watch Officer focus soundscape and sound design spec | TASK-0092 approved as input |
| Localization | Localization / Language Lead | EN fallback plus RU/DE/IT/ES/SRB-MNE-HR/Mandarin policy and text-key readiness | Prepared, not yet activated |
| UI/HUD | UI/UX HUD Designer | Scenario 2 coaching + result feedback spec | TASK-0123 approved for Engine |
| Engine | Engine / Godot Architect | Scenario 2 coaching + result feedback local Web export | TASK-0128 passed |
| QA | Maritime QA / Validation | Scenario 2 coaching + result feedback local Web smoke | TASK-0129 approved |
| Maritime Audit | Maritime Rules Auditor | Scenario 2 Head-On Port-to-Port maritime audit | TASK-0094 approved |
| Platform | Game Platform | Scenario selector staged public candidate | TASK-0118 passed |
| Platform Deploy | Platform Deployment Officer | Scenario selector production deploy | TASK-0120 passed |
| Platform Auth | Platform Auth | One-off private access for Captain Ether Batch 004 completed | TASK-0076 closed |
| Captain Ether | Captain Ether Owner | Batch 004 production smoke closed | TASK-0078 approved |

## Rule

Each stream writes reports inside its own scope. Game Director turns reports into decisions in `decision-log.md`.

Role chats must not paste full reports into chat. They must write the report file, then return only the short status defined in `docs/game-director/chat-reporting-rules.md`.

Task prompts sent to other chats must end at the assignment boundary. Do not add commentary below the task block.

## Current Gameplay Decision

MVP Watch Officer uses IALA Region A only.

Scenario data must still declare:

```json
{
  "iala_region": "A"
}
```

Region B support is not part of MVP, but the data model must not block future Region B scenarios.

## Current Handoff

`docs/watch-officer/mvp-maritime-rules-report.md` is now the input document for:

- UI/HUD.
- Engine / Godot.
- QA / Validation.

`docs/watch-officer/ui-hud-mvp-report.md` is now also an input document for:

- Engine / Godot.
- QA / Validation.

`docs/watch-officer/engine-godot-prototype-report.md` is now also an input document for:

- QA / Validation.

`docs/watch-officer/qa-validation-mvp-report.md` is now the review document for Game Director first-scenario decisions.

`docs/game-director/first-scenario-decision-pack-2026-05-26.md` resolves the first batch of QA open decisions for scenario 1.

`docs/game-director/prototype-scaffolding-readiness-2026-05-26.md` confirms Engine/QA blockers are removed for creating a scaffold task.

`game.brkovic.ltd/prototypes/watch-officer-godot/` now contains the first scaffold.

`docs/game-director/scenario-schema-validation-2026-05-26.md` confirms scenario/schema validation passed.

`docs/watch-officer/qa-safe-water-geometry-monitor-review.md` approves the safe-water geometry monitor for the next Engine slice.

`docs/watch-officer/qa-local-web-export-artifact-review.md` approves local Web export behavior for Game Director public integration decision.

Captain Ether Batch 004 production smoke is closed as PASS by TASK-0078. Watch Officer Scenario 1 Decision Coaching is approved as a public production prototype by TASK-0090. Visual Comfort TASK-0091 and Audio Direction TASK-0092 are approved as direction inputs, not implementation approvals. Localization / Language Lead office is prepared but not activated. Gameplay completed TASK-0093 for Scenario 2 Head-On Port-to-Port rules decision pack; Maritime Rules Auditor approved TASK-0094 for UI/HUD and Engine planning. TASK-0095 UI/HUD spec and TASK-0096 Engine planning are ready for Game Director review. TASK-0097 Scenario 2 schema/data/loader validation passed. TASK-0098 QA review approved the next Engine slice. TASK-0099 passed. TASK-0100 QA review approved the next Engine slice. TASK-0102 passed. TASK-0103 QA review approved the next Engine slice. TASK-0104 runtime state export plan passed. TASK-0105 passed. TASK-0106 QA review approved UI/HUD binding or playable planning. TASK-0107 Scenario 2 UI/HUD binding foundation passed. TASK-0108 QA review approved playable scene planning. TASK-0109 local playable scene planning passed. TASK-0110 local playable scene implementation passed and TASK-0111 QA review approved the next local polish/export-decision slice. TASK-0112/TASK-0113 selector preparation completed. TASK-0114 local scenario selector implementation passed; TASK-0115 QA review approved local Web export decision. TASK-0116 local Web export passed and TASK-0117 QA browser smoke approved staged public candidate decision. TASK-0118 staged public candidate passed and TASK-0119 QA approved production deploy decision. TASK-0120 production deploy passed and TASK-0121 QA production smoke approved public prototype live. TASK-0122 post-recovery sprint control is completed. TASK-0123/TASK-0124/TASK-0126/TASK-0127 closed Scenario 2 Coaching + Result Feedback Pack as local QA approved after one changes-required QA loop. TASK-0128 local Web export passed and TASK-0129 QA local Web export smoke approved staged public candidate decision. Final maritime training approval remains closed.
