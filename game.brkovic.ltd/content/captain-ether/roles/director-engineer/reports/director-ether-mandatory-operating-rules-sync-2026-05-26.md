# Director Ether Mandatory Operating Rules Sync

Date: 2026-05-26
Role: Director Ether / Captain Ether
Task ID: not provided in assignment
Mode: documentation-only

## Result

PASS.

The shared `game.brkovic.ltd` mandatory chat operating rules are now referenced
from Captain Ether Director documentation and role protocol.

## Source Documents Read

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/task-registry.md`
- `docs/game-director/workstreams.md`
- `docs/game-director/decision-log.md`
- `content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/roles/director-engineer/rules.md`

## Files Changed

- `content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/roles/director-engineer/rules.md`
- `content/captain-ether/roles/director-engineer/reports/director-ether-mandatory-operating-rules-sync-2026-05-26.md`

## Decisions Captured

- Repository files are the source of truth.
- Chat is only dispatch, status, or clarification.
- Role and worker chats must not decide direction or change files without a
  task, role, scope, report path, and next gate.
- Full findings go to report files, not chat.
- Chat completion uses compressed `TASK-XXXX done` or `TASK-XXXX blocked`
  status.
- Secrets, login codes, cookies, sessions, CSRF values, SMTP details, `.netrc`,
  private config, player email, player identity data, FTP credentials, API
  keys, tokens, and passwords must never be written or printed.
- Production deploy, FTP, auth access decisions, production config, and remote
  server changes require a separate Game Director task.
- QA approval is not deploy approval.

## Scope Preserved

- Watch Officer not changed.
- Nav Desk not changed.
- Router/registry not changed.
- Auth/platform not changed.
- Game Director docs not changed.
- Production config, FTP/deploy state, and secrets not touched.
- Captain Ether runtime/API/UI/content data not changed.

## Checks

- Documentation-only task.
- No local tests required.
- `php` validation was not run because this task did not change runtime or
  content behavior.

## Open Notes

- The assignment did not include a `TASK-XXXX` ID. This report records that
  fact instead of inventing a Game Director registry task.
