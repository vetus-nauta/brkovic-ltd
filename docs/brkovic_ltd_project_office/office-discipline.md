# BRKOVIC.LTD Office Discipline

**Owner:** Director of BRKOVIC.LTD MVP
**Created:** 2026-05-27
**Applies to:** every BRKOVIC.LTD office chat and worker chat.

## Mandatory Start

Every chat starts with:

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

Then read:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/chat-registry.md
docs/brkovic_ltd_project_office/task-registry.md
```

## Authority

The Director chat may assign work, open gates, close gates, approve deploy scope, and update office files.

Worker chats may only act inside their assigned cabinet, task ID, allowed files, and report path.

## MVP Stabilization Rule

The current phase is MVP release stabilization, not redesign.

- Do not rebuild, restyle, or recompose the interface by initiative.
- UX may report issues and propose corrections, but interface changes require Director/owner approval first.
- Cosmetic improvements are not release blockers unless they affect usability, trust, responsiveness, accessibility, or core conversion.
- Functional completion work before release starts only inside NavDesk tools/functions unless the Director assigns another implementation task.
- Existing approved page direction should be preserved. The goal is to ship a live MVP without breaking working surfaces.

## Forbidden By Default

- Do not run `git reset`, `git checkout --`, or `git clean`.
- Do not revert existing dirty work.
- Do not redesign or "improve" the interface without explicit Director/owner approval.
- Do not edit production, FTP, remote server files, or live backend unless a deploy task explicitly grants it.
- Do not expose or copy secrets: FTP credentials, `.netrc`, API keys, billing tokens, database credentials, cookies, sessions, login codes, private configs, SMTP settings, or personal identity data.
- Do not upload `game.brkovic.ltd/`, `test-results/`, ignored config/storage files, or unrelated local artifacts as part of the main site release.
- Do not rewrite final Russian marketing text without owner approval.
- Do not treat QA approval as deploy approval.

## Reporting

Full findings must be written to the required report file.

## Background Agent Watcher

Every background agent must have Director watcher control.

- When an agent is started, add it to `docs/brkovic_ltd_project_office/director-reports/2026-05-28-agent-control-log.md`.
- Record agent id, role, task id, expected output, safe boundaries, and next director action.
- The Director performs a first check shortly after launch and then repeats checks during the same chat turn.
- If the agent is still active after a check, keep the task visible as active; do not imply completion.
- If the agent appears stalled, request a short status from the agent before reassigning or interrupting.
- When the agent finishes, inspect the report, update the task registry, close the agent, and write the close event.
- Do not leave background processes ambiguous for the owner or the next chat.

Short chat reply format:

```text
TASK-ID done.
Report: <path>
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- <areas not touched>
Next expected: <next owner/action>
```

Blocked format:

```text
TASK-ID blocked.
Blocker: <one sentence>
Command: <exact command if relevant>
Output: <short exact failure line>
Report: <path if created>
Next expected: <owner/action needed>
```

## Release Gate

Before any production upload, the Director must approve:

1. release manifest;
2. local QA/UX report;
3. SEO/I18N report;
4. backend/admin/API report;
5. exact deploy scope;
6. backup and post-deploy check plan.
