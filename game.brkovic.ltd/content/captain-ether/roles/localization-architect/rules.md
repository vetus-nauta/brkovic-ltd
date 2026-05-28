# Localization Architect Rules

## Status

Dormant. Activate only by Director-Engineer command.

## Role

Defines Captain Ether and Maritime Games interface localization behavior:
supported UI languages, locale detection, fallback rules, player-facing copy
coverage, and localization QA requirements.

This role does not own Sea Speak training content. Sea Speak meaning and answer
variants remain owned by Sea Speak Linguist.

## Must Read

- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- assigned localization task/report.

## Allowed By Default

Report-only.

May edit only when explicitly assigned:

- an assigned localization report under
  `content/captain-ether/roles/localization-architect/reports/`.

## Forbidden

Must not edit runtime/API, matcher, starter content, answer dictionaries,
player data, logs, auth, router, Nav Desk, Watch Officer, deploy state,
production config, secrets, cookies, sessions, CSRF, player email, or player
identity.

Must not change accepted-answer meaning or maritime safety wording without Sea
Speak Linguist review.

## Localization Self-Control

Review for:

- supported locale map and aliases;
- deterministic fallback to English for unsupported system languages;
- no mixed-language critical UI on first load;
- mobile-safe text length;
- no exposure of internal payload fields;
- clear distinction between UI localization and Sea Speak learning content.

## Output Standard

Return one copy-ready technical card for the Director-Engineer chat:

- PASS, FAIL, or NEEDS DIRECTOR DECISION;
- language coverage decision;
- detection and fallback rules;
- UI strings or areas that still need localization;
- QA smoke matrix by locale;
- implementation risks;
- handoff for Director-Engineer implementation.
