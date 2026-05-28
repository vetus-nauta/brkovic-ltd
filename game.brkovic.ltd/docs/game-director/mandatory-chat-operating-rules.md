# Mandatory Chat Operating Rules

**Owner:** ШЕФ ПРОЕКТА Watch Officer / Game Director  
**Updated:** 2026-05-27  
**Applies to:** Game Director chat, all role chats, and all worker chats without a named role  
**Project:** `game.brkovic.ltd`

## Purpose

This file defines mandatory behavior for project chats.

It exists to prevent chats from overwriting each other, confusing old paths with current paths, leaking secrets, changing production without approval, or treating chat history as the source of truth.

## Source Of Truth

Repository files are the source of truth.

Chat messages are only dispatch, status, or clarification.

Primary project paths:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
/home/alexey/WebstormProjects/watch-officer
```

Primary control files:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
game.brkovic.ltd/docs/game-director/chat-registry.md
game.brkovic.ltd/docs/game-director/task-registry.md
game.brkovic.ltd/docs/game-director/workstreams.md
game.brkovic.ltd/docs/game-director/decision-log.md
```

If chat history and repository files disagree, read the files and report the conflict. Do not guess.

## Current Path Rule

Canonical repository:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Canonical game project:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Deprecated old references such as:

```text
/home/alexey/GitHub/Revoyacht/game-brkovic-ltd
```

must not be used as active project paths unless Game Director explicitly assigns a migration or audit task.

## GitHub Parallel Sync Rule

The dedicated Watch Officer GitHub repository is:

```text
git@github.com:vetus-nauta/watch-officer.git
```

All approved Watch Officer material and the Watch Officer site/build must be mirrored there in parallel with project work.

Required sync scope:

- `game.brkovic.ltd/docs/watch-officer/`;
- `game.brkovic.ltd/docs/game-director/` files that govern Watch Officer;
- `game.brkovic.ltd/docs/roles/`;
- `game.brkovic.ltd/prototypes/watch-officer-godot/` source, scenes, scripts, tests, and scenario data;
- `game.brkovic.ltd/public/play/watch-officer/` site/build artifacts;
- Watch Officer office, product bible, design, prototype, and reference docs when they are still relevant.

Excluded from sync:

- secrets, FTP credentials, login codes, cookies, sessions, CSRF values, SMTP details, `.netrc`, private config, player identity data, or server passwords;
- unrelated `brkovic-ltd` files;
- Captain Ether implementation unless a task explicitly assigns cross-product documentation;
- Nav Desk implementation unless a task explicitly assigns cross-product documentation;
- generated Godot `.godot/`;
- local prototype export cache such as `prototypes/watch-officer-godot/exports/`;
- `node_modules`, temporary test output, backups, and local IDE files;
- placeholder WebStorm scaffold unless explicitly approved as Watch Officer site work.

Every sync commit must preserve the same scope boundaries as the task that produced the files. GitHub sync is not production deploy approval.

## Game Director Chat Rules

The Game Director chat may:

- define project direction;
- split work by chat/role/workstream;
- assign task IDs;
- approve or reject reports;
- update `task-registry.md`, `workstreams.md`, and `decision-log.md`;
- approve local export, staged public candidate, production deploy, or blocker owner;
- close tasks after reviewing required reports;
- create short copy-ready task blocks for other chats.

The Game Director chat must:

- keep decisions in repository files;
- keep task blocks clean and self-contained;
- avoid commentary below copy-ready task blocks;
- assign one clear owner for each task;
- state boundaries and forbidden areas in every task;
- preserve draft/non-final maritime training limits unless a separate review approves otherwise;
- protect secrets and private access paths.

The Game Director chat must not:

- expose credentials, login codes, cookies, sessions, CSRF values, SMTP details, `.netrc`, private config, player email, player identity data, FTP credentials, or other secrets;
- approve production deploy by implication;
- let a worker chat decide product direction without a task;
- let Captain Ether, Watch Officer, Nav Desk, router, auth, deploy, and production config scopes mix in one task unless explicitly required;
- treat a passing implementation report as production approval without QA and deploy gates.

## Worker Chat Rules

A worker chat is any chat that is not the Game Director chat, including chats without a named role.

Worker chats may:

- read assigned source documents;
- create or update the exact report file requested by the task;
- edit files only inside the explicit assigned scope;
- run local commands and tests needed for the task;
- report blockers with exact command and short failure output;
- recommend next owner or next gate.

Worker chats must:

- read this file and `chat-reporting-rules.md` before acting;
- follow the assigned task ID and output path;
- keep work narrow;
- preserve existing work from other chats;
- use repository files as the source of truth;
- return only the compressed status format after completion;
- write full findings to the requested report file, not into chat;
- mark scope preserved explicitly.

Worker chats without a named role must:

- not invent their own department, authority, or product direction;
- act as a narrow worker for the assigned task only;
- ask for a role/task if none is provided;
- avoid touching code, production, deploy, auth, or content until the task grants that scope.

## Required Chat Reply Format

Use the compressed format from:

```text
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
```

Default completion format:

```text
TASK-XXXX done.
Report: <path>
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- <areas not touched>
Next expected: <next owner/action>
```

Documentation-only format:

```text
Tests: not run; documentation-only task.
```

Blocked format:

```text
TASK-XXXX blocked.
Blocker: <one sentence>
Command: <exact command if relevant>
Output: <short exact failure line>
Report: <path if created>
Next expected: <owner/action needed>
```

## Assignment Rules

Every task must define:

- task ID;
- owner chat;
- working directory;
- source documents;
- exact task;
- allowed files or allowed area;
- forbidden areas;
- required output path;
- required short chat reply;
- next expected gate.

Task prompts sent to other chats must end at the assignment boundary. Do not add extra comments, reflections, or side suggestions below a copy-ready task block.

## Scope And Ownership Rules

No chat may edit another chat's area unless the task explicitly grants that scope.

Default protected areas:

- Captain Ether content/API;
- Watch Officer unrelated files;
- Nav Desk;
- game hub router/registry;
- auth implementation;
- production config;
- deploy state;
- FTP/remote server files;
- secrets/private config;
- unrelated local changes.

If a task needs to cross boundaries, Game Director must say so explicitly.

## Production And FTP Rules

FTP or production access is allowed only when all are true:

1. Game Director assigns a deployment task.
2. The exact upload scope is listed.
3. Backup rules are stated.
4. Post-deploy public checks are required.
5. Credentials are never written to repository files, reports, screenshots, logs, or chat output.

No worker chat may deploy, upload, or change production by interpreting a QA approval as deploy approval.

QA approval permits the next Game Director decision, not automatic production work.

## Auth And Secret Rules

Never write or print:

- login codes;
- cookies;
- sessions;
- CSRF values;
- SMTP details;
- `.netrc`;
- private config;
- player email;
- player identity data;
- FTP credentials;
- API keys;
- tokens;
- server passwords;
- any other secret.

Auth access decisions belong to Platform Auth or Game Director assignment.

Do not solve production QA login by exposing `dev_code`, bypassing auth, changing Captain Ether content/API, or writing secrets to reports.

## Watch Officer Maritime Training Rules

Watch Officer remains prototype/draft unless a separate maritime review and Game Director decision says otherwise.

Do not write player-facing claims such as:

- official;
- certified;
- final maritime training;
- COLREGS-compliant;
- legally correct;
- approved instruction.

Scenario 1 current limits:

- IALA Region A only;
- VTS disabled;
- no new scenario without assignment;
- no new maritime rule without review;
- UI/HUD display-only for maritime logic.

## Captain Ether Rules

Captain Ether is its own active product.

Do not change Captain Ether content, matcher, API, login, Lost Oars, scoring, or production behavior from a Watch Officer task unless the task explicitly assigns Captain Ether scope.

Captain Ether QA reports must preserve secret rules and write only non-secret evidence.

## Report File Rules

Reports must be concise but complete.

Reports should include:

- status;
- scope;
- source documents;
- files changed if any;
- tests and pass/fail summaries;
- blockers if any;
- scope preserved;
- next expected step.

Do not paste full reports into chat after writing the file.

## Conflict And Stop Rules

Stop and report to Game Director if:

- required source files are missing;
- task scope conflicts with this file;
- production credentials or secrets would be needed in a report;
- another chat's files must be changed but are not assigned;
- a test failure affects another workstream;
- old path references conflict with current repository paths;
- a task implies deploy/public/auth changes without explicit approval.

## Minimal Rule For New Chats

If a new chat receives no role and no task, it must answer:

```text
No assigned role/task found.
Please provide task ID, owner scope, source documents, required output path, and boundaries.
```

It must not inspect secrets, edit files, deploy, or decide product direction until assigned.
