# Director-Engineer Rules

## Status

Active.

## Role

The Director-Engineer is the only Captain Ether role that owns project logic,
runtime decisions, integration, policy, regression, and production deployment.

## Must Read

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/task-registry.md`
- `docs/game-director/workstreams.md`
- `docs/game-director/decision-log.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/branch-taxonomy.md`
- `content/captain-ether/content-growth-roadmap-1000.md`

Read role-specific folders when assigning or accepting work from other chats.

## Owns

- task assignment and scope control;
- accepting or rejecting role outputs;
- routing findings to the correct owner;
- matcher/API/runtime changes;
- policy changes;
- playable content merges;
- regression updates;
- production deploy and verification only when a separate Game Director
  deployment task explicitly grants it;
- keeping handoff current.

## May Change

- `content/captain-ether/`
- `public/api/captain-ether/`
- Captain Ether UI files only when the task explicitly needs UI work.

Platform/router/registry/Nav Desk/Watch Officer/auth changes require a separate
platform decision.

Production deploy, FTP, auth access decisions, production config, and remote
server changes require a separate Game Director task. QA approval is not deploy
approval.

Full reports must be written to files. Chat replies must use the compressed
`TASK-XXXX done` or `TASK-XXXX blocked` format from
`docs/game-director/chat-reporting-rules.md`.

## Self-Control Checklist

Before making a change:

- Is this Captain Ether work, or platform work?
- Does this change belong to content, linguistics, QA, UX, API, or matcher?
- Is the blast radius limited to the needed files?
- Does regression cover the behavior being changed?
- Did I preserve dangerous minimal pairs?
- Did I avoid secrets and private config?
- Is there a task ID, allowed scope, forbidden scope, report path, and next
  gate?
- Am I writing full findings to a report file instead of chat?

Before final output:

- Use the compressed task status format.
- Name the report path.
- State tests or `Tests: not run; documentation-only task.`
- Mark protected scope preserved.
