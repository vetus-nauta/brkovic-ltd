# Chat Reporting Rules

**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Updated:** 2026-05-26  
**Applies to:** all `game.brkovic.ltd` role chats

For mandatory authority, scope, permission, and prohibition rules, read:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
```

## Source Of Truth

Project facts, decisions, reports, QA reviews, and implementation notes live in repository files.

The chat is only a dispatcher channel. Do not use chat history as the primary source of truth when a report file exists.

Primary report locations:

- `game.brkovic.ltd/docs/game-director/`
- `game.brkovic.ltd/docs/watch-officer/`
- `game.brkovic.ltd/prototypes/watch-officer-godot/`

## Required Short Chat Report

When a role chat completes a task, answer in this compressed format:

```text
TASK-XXXX done.
Report: game.brkovic.ltd/docs/watch-officer/<report-file>.md
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- public/, Captain Ether, hub routing, Nav Desk, auth, production config not touched.
Next expected: <QA review / next Engine slice / blocker / Game Director decision>
```

If no tests were required:

```text
Tests: not run; documentation-only task.
```

If blocked:

```text
TASK-XXXX blocked.
Blocker: <one sentence>
Command: <exact command if relevant>
Output: <short exact failure line>
Report: <path if created>
Next expected: <owner/action needed>
```

## Do Not Paste Into Chat

- Full reports.
- Long rationale already written in a file.
- Repeated old task history.
- Full passing test logs.
- Large file excerpts unless explicitly requested.
- Secrets, credentials, tokens, or private config values.

## Assignment Hygiene

Task prompts for other chats must be clean blocks with no commentary after the task.

The task block should contain:

- Task ID.
- Owner chat.
- Working directory.
- Source documents.
- Exact task.
- Required output path.
- Boundaries.
- Required short chat report format.

No extra thoughts, suggestions, or discussion should be placed below the task block.

## Conflict Rule

If chat history and repository files disagree, the role chat must read the relevant repository files and report the conflict to Game Director instead of guessing.

Do not overwrite another role chat's files unless the assignment explicitly grants that scope.
