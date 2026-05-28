# Chat Registry

**Owner:** Game Director  
**Updated:** 2026-05-27  
**Project:** `game.brkovic.ltd`

## Registered Chats

| Chat ID | Name | Role | Status | Output |
| --- | --- | --- | --- | --- |
| CHAT-GD-001 | Game Director | Product direction, decisions, task assignment | Active | Decisions, dashboard, task registry |
| CHAT-PLATFORM-001 | Platform | Game hub, registry, routing, auth shell | Ready | Platform implementation report |
| CHAT-PLATFORM-DEPLOY-001 | Platform Deployment Officer | Controlled production upload, backup, public smoke verification | Ready for TASK-0063 | Deployment report without credentials |
| CHAT-PLATFORM-AUTH-001 | Platform Auth | Login flow, production QA access decisions, auth boundaries | Ready for TASK-0065 | Non-secret auth decision report |
| CHAT-CAPTAIN-001 | Captain Ether | Existing Sea Speak game loop and content | Active product | Stability/content reports |
| CHAT-WATCH-001 | Watch Officer | Second product concept and project office | Ready | Product office and MVP reports |
| CHAT-GAMEPLAY-001 | Maritime Rules | IALA/MAMS, COLREGS, scenario rules | Draft-approved | Rule reports |
| CHAT-UX-001 | UI/UX HUD | Game selection, Watch Officer HUD, mobile layout | TASK-0095 for review | Layout reports |
| CHAT-VISUAL-001 | Visual Comfort / Art Direction Lead | Watch Officer visual comfort, art direction, motion comfort, perception rules | Assigned TASK-0091 | Visual direction specs |
| CHAT-AUDIO-001 | Audio Direction / Sound Design Lead | Focus music, maritime ambience, system sounds, warning audio, audio accessibility | Assigned TASK-0092 | Audio direction specs |
| CHAT-LOCALIZATION-001 | Localization / Language Lead | English/Russian copy, terminology, text keys, localization safety | Prepared, not yet activated | Localization baseline and glossary |
| CHAT-ENGINE-001 | Engine / Godot | Watch Officer prototype architecture | TASK-0096 for review | Technical plan |
| CHAT-QA-001 | QA / Validation | Rule verification and scenario validation | For Review | QA reports |
| CHAT-MARITIME-RULES-001 | Maritime Rules Auditor | COLREGS/MPPSS, IALA/MAMS, scenario-rule audit, algorithm boundaries, wording safety | TASK-0094 approved | Maritime-rule audit reports |
| CHAT-BRKOVIC-001 | brkovic.ltd Integration | Nav Desk links and ecosystem account handoff | Active link | Integration notes |

## Operating Rule

New chats must receive a narrow assignment and write a report before changing product direction or implementing Watch Officer gameplay.

Deployment chats have narrower authority than Platform chats. They may only upload files explicitly listed in the assigned deployment task, must backup overwritten remote files, must verify public URLs after upload, and must never store credentials in repository files, reports, screenshots, logs, or chat output.

Platform Auth chats have narrower authority than Platform chats. They may decide approved QA login access methods and auth boundaries, but must not expose secrets, modify Captain Ether content/API, modify Watch Officer, modify Nav Desk, or implement auth changes without a separate reviewed implementation task.

All role chats must follow `docs/game-director/chat-reporting-rules.md`: repository files are the source of truth, and chat replies must stay compressed to task status, report path, tests, preserved scope, and next expected step.
