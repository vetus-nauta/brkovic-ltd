# Localization / Language Lead Handoff

## Inputs Usually Needed

- Game Director task file.
- Current scenario UX/spec report.
- Maritime audit report.
- UI/HUD text surfaces.
- Visual comfort wording constraints.
- Existing source copy.

## Outputs Usually Produced

- Localization baseline report.
- Glossary.
- Text-key inventory.
- Supported-language copy table.
- Wording risk list.
- UI/HUD length-risk notes.
- Sea Speak fixed-English protection notes.
- Handoff notes for Engine/UI.

## Escalation

Escalate to Game Director if:

- source copy sounds final/certified;
- translation changes maritime meaning;
- text requires Maritime Rules Auditor decision;
- UI cannot fit Russian copy without design adjustment;
- locale fallback would block gameplay;
- Sea Speak phrases are accidentally translated as ordinary UI;
- implementation contains hard-coded player-facing text that blocks localization.

## Closed Areas Unless Assigned

- code edits;
- Godot scene edits;
- audio assets;
- visual assets;
- production files;
- public deploy;
- Captain Ether;
- Nav Desk;
- router/registry;
- auth;
- VTS;
- Region B;
- final maritime training approval.
