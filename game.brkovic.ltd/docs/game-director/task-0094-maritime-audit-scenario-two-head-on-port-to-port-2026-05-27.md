# TASK-0094 - Maritime Audit: Scenario 2 Head-On Port-to-Port Rules

**Chat ID:** CHAT-MARITIME-RULES-001  
**Department:** Maritime Rules Auditor  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-27  
**Status:** Assigned

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/README.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/rules.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/onboarding.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/handoff.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/first-brief.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-maritime-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-scenario-one-production-prototype-status-2026-05-27.md`

## Task

Audit the Scenario 2 `Head-On Port-to-Port Drill` rules decision pack before UI/HUD or Engine implementation.

This audit is for rule traceability, algorithm-boundary safety, wording safety, and draft/non-final training limits. It is not final maritime certification.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md
```

The report must state one of:

- `approved-for-ui-engine-planning`
- `changes-required`
- `blocked`

## Required Review Points

Review:

- whether Scenario 2 can remain a narrow MVP head-on drill;
- whether the proposed `head_on` / port-to-port concept is safe as draft scenario wording;
- how to handle `nearly reciprocal` without pretending the threshold is universal law;
- whether `early starboard alteration` wording is acceptable as scenario guidance;
- whether port alteration severity should be treated as critical, serious, or conditional by distance/CPA;
- whether speed reduction alone may count as partial recovery or should stay secondary;
- whether simple channel geometry risks teaching narrow-channel rules accidentally;
- whether proposed CPA/pass-distance thresholds must remain scenario-local debug/training values;
- whether `rule_review_status` may remain `draft` for implementation;
- wording that must be forbidden or softened before player-facing UI;
- specific open questions that require a human maritime expert before final training approval.

## Required Boundaries

Keep explicit:

- this is not legal advice;
- this is not navigation instruction;
- this is not final maritime training;
- this is not official or certified;
- this is not complete COLREGS/MPPSS coverage;
- this is not complete IALA/MAMS coverage;
- IALA Region A remains project scope;
- VTS remains out of Scenario 2 unless separately assigned.

## Required Chat Reply

Use compressed project style:

```text
TASK-0094 done.
Report: game.brkovic.ltd/docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md
Status: <approved-for-ui-engine-planning|changes-required|blocked>
Tests: not run; documentation-only audit.
Scope preserved:
- No code, scenario data, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, or final maritime training claims touched.
Next expected: Game Director decision for UI/HUD Scenario 2 spec and/or Engine planning.
```

## Boundaries

- Documentation audit only.
- Do not edit code.
- Do not edit scenario JSON.
- Do not edit schema.
- Do not edit scenes.
- Do not edit assets.
- Do not export.
- Do not deploy.
- Do not use FTP.
- Do not edit `public/`.
- Do not edit production files.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not modify router or registry.
- Do not touch auth.
- Do not change production config.
- Do not activate VTS.
- Do not add Region B.
- Do not present Watch Officer as official, certified, COLREGS-compliant, legally correct, or final maritime training content.
