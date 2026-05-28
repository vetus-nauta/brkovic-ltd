# Chat Assignment Template

Use this when opening a new Codex chat for `game.brkovic.ltd`.

```markdown
# Chat Assignment

**Chat ID:**  
**Department:**  
**Assigned by:** Game Director  
**Date:**  
**Task ID:**  
**Status:** Assigned  

## Working Directory

`/home/alexey/GitHub/Revoyacht/brkovic-ltd`

## Main Project

`/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd`

## Source Documents

Read first:

- `game.brkovic.ltd/README.md`
- `game.brkovic.ltd/docs/new-chat-handoff-2026-05-26.md`
- `game.brkovic.ltd/docs/game-director-dashboard-2026-05-26.md`
- `game.brkovic.ltd/docs/game-director/chat-registry.md`
- `game.brkovic.ltd/docs/game-director/task-registry.md`
- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`

## Task

[Describe the narrow task.]

## Required Output

Write a concise report or patch summary. If the task is exploratory, do not edit product code.

Write the full result to the required repository file. Do not paste the full report into chat.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`:

```text
TASK-XXXX done.
Report: <path>
Tests:
- <test_name>: <N> passed, 0 failed
Scope preserved:
- <areas not touched>
Next expected: <next step>
```

## Boundaries

- Do not touch secrets in `private/config.php`.
- Do not revert existing dirty changes.
- Do not implement Watch Officer gameplay before project-office approval.
- Do not present unverified maritime rules as final training content.
- Treat old `game-brkovic-ltd` path references as deprecated and use `game.brkovic.ltd/`.
- Do not paste long reports, repeated task history, or commentary below the task block.
```
