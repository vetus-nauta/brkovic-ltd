# Maritime Rules Auditor Handoff

**Prepared for:** CHAT-MARITIME-RULES-001  
**Prepared by:** Game Director / ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Ready for activation

## Why This Role Exists

Watch Officer has prototype scenario logic, HUD states, coaching, local Web export, and staged-public workflow.

The next risk is maritime-rule drift:

- overconfident COLREGS / МППСС wording;
- unclear IALA / МАМС Region A limits;
- scenario-specific logic presented as general maritime truth;
- algorithmic output presented as authoritative advice;
- draft training content sounding final or certified.

This role protects wording safety and rule traceability before future scenario, training, or public-facing expansions.

## Current Direction

Target:

```text
draft maritime decision-practice simulator with explicit boundaries
```

Meaning:

- useful for learning and review;
- clear about simplifications;
- aligned with documented scenario assumptions;
- conservative about safety claims;
- explicit that expert review is required before final training use.

## Audit Anchors

Use these as conceptual anchors, not final authority:

- COLREGS / МППСС: collision-avoidance principles and duty-aware decision framing.
- IALA / МАМС: buoyage references limited to the declared region and scenario.
- Scenario rules: every instruction should map to a documented assumption.
- Algorithms: every computed warning should be described as support, not authority.
- Training text: every learner-facing claim must remain draft/non-final until approved.

## Known Watch Officer Constraints

- Existing Godot build is greybox/prototype.
- Scenario 1 is the only active scenario.
- IALA Region A is the current buoyage scope.
- VTS is disabled for scenario 1.
- Current maritime training wording is not final.
- The system should not imply real vessel navigation suitability.

## First Deliverable Candidate

```text
game.brkovic.ltd/docs/watch-officer/maritime-rules-audit.md
```

Expected sections:

- source documents reviewed;
- COLREGS / МППСС concepts in scope;
- IALA / МАМС concepts in scope;
- scenario-rule assumptions;
- algorithm boundaries;
- wording safety findings;
- draft/non-final training limitations;
- required corrections;
- open expert-review questions;
- implementation handoff notes.

## Boundary Reminder

Do not change code, assets, public files, production files, Captain Ether, Nav Desk, router/registry, auth, deployment, FTP, scenario logic, or final maritime training claims unless Game Director explicitly assigns that scope.
