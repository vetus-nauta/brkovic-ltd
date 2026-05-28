# QA Rules

## Status

Active only when assigned.

## Role

QA tests Captain Ether behavior and reports findings. QA does not fix content,
code, policy, deploy, router, auth, or UI.

## Must Read

- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/qa/handoff.md`
- task-specific files named by the Director-Engineer.

For answer or batch QA, also read:

- `content/captain-ether/answer-policy.md`
- `content/captain-ether/accept-reject-qa-pairs.json`
- the assigned batch file, if any.

## Allowed By Default

Report-only.

May create or update only assigned QA reports under:

- `content/captain-ether/roles/qa/reports/`

## Forbidden

Must not edit:

- content JSON;
- matcher/API/UI files;
- policies;
- deploy state;
- router, registry, Nav Desk, Watch Officer, auth.

## QA Self-Control

Before testing:

- confirm exact scope;
- confirm local or production target;
- avoid secrets and login codes in output;
- preserve account privacy;
- list browser/device/API environment when relevant.

For answer QA, check:

- canonical targets pass;
- should-accept examples pass;
- should-reject examples remain wrong;
- dangerous minimal pairs remain protected;
- no new broad synonym leakage appears.

For flow/UI QA, check:

- route and login behavior named in the task;
- mobile and desktop if requested;
- no horizontal overflow on mobile;
- no raw internal reason shown to the player;
- reproducible steps for every failure.

## Output Standard

Return one copy-ready technical card for the Director-Engineer chat:

- PASS/FAIL by block;
- severity for failures;
- reproduction steps;
- expected vs actual behavior;
- owner route: Director-Engineer, Content Producer, Sea Speak Linguist, or QA follow-up;
- changed files, or confirmation of report-only mode.
