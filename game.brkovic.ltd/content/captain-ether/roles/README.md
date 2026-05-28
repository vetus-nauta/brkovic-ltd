# Captain Ether Role Folders

Date: 2026-05-27

This folder is the mandatory self-control layer for Captain Ether role chats.
Every role has its own folder named by position.

This is the Captain Ether office. A role is activated only by a clean
Director-Engineer or Director Ether task block. The existence of a folder does
not grant authority to act.

Every role chat must read its folder before starting a new task. If the
assignment conflicts with these files, the role must stop and ask the
Director-Engineer for a narrowed command.

## Office Files

- `README.md`: this office map.
- `office-manifest.md`: role roster, activation status, folders, and next-use
  rules.
- `<role>/rules.md`: role authority, allowed files, forbidden files, and stop
  conditions.
- `<role>/handoff.md`: current state and activation notes for that role.
- `<role>/tasks/`: assigned task files for the role.
- `<role>/reports/`: role reports and acceptance cards.

## Mandatory First Read

Every role reads:

1. `content/captain-ether/role-command-protocol.md`
2. `content/captain-ether/captain-ether-handoff-2026-05-26.md`
3. `content/captain-ether/roles/README.md`
4. `content/captain-ether/roles/office-manifest.md`
5. Its own `rules.md`
6. Its own `handoff.md`

## Active Role Folders

- `director-engineer/`: full project owner for Captain Ether.
- `content-producer/`: assigned content draft only.
- `sea-speak-linguist/`: Sea Speak meaning and accepted/rejected variants.
- `qa/`: test and report only.

## Dormant Role Folders

These roles are prepared for later activation. They must not act unless the
Director-Engineer explicitly assigns a task.

- `curriculum-architect/`: corpus structure, branch sequencing, level balance.
- `scenario-designer/`: scenario turns and realistic radio situations.
- `ux-hud-designer/`: UX/HUD review and proposed interaction changes.
- `gamification-designer/`: motivation loops, progression, review mechanics.
- `answer-log-analyst/`: player answer-log analysis and disputed-answer reports.
- `localization-architect/`: UI localization policy, system-language detection,
  fallback behavior, and localization QA scope.
- `validation-steward/`: local validation environment, reproducible gates,
  validator triage, and QA smoke preparation.

## Activation Rule

Each activation task must state:

- task ID;
- role name;
- working directory;
- files to read first;
- exact task;
- allowed files;
- forbidden scope;
- required report path;
- whether edits are allowed or report-only;
- required short chat reply;
- next expected gate.

If any of those are missing, the role must stop and ask for a narrowed command.

## Global Self-Control

Before changing or reporting anything, every role must check:

- Am I in the correct Captain Ether workstream?
- Did the Director-Engineer explicitly assign this task?
- Are file edits allowed, or is this report-only?
- Are all changed files inside my allowed list?
- Did I avoid router, registry, Nav Desk, Watch Officer, auth, SMTP, and
  private config?
- Did I avoid printing secrets, login codes, `.netrc`, or `private/config.php`
  contents?
- Did I report out-of-scope problems instead of fixing them?

## Stop Conditions

A role must stop and report to the Director-Engineer if:

- it needs matcher/API/runtime/UI/platform changes;
- it needs to edit `starter.json`, unless explicitly assigned;
- it sees a policy contradiction;
- it sees a route/auth/deploy issue;
- it is about to widen accepted answers in a way that may change maritime
  meaning.
- it would need to edit outside its assigned folder or explicitly allowed files.

## Output Standard

Every role output must include:

- task result: PASS, FAIL, or NEEDS DIRECTOR DECISION;
- files changed, or confirmation of report-only mode;
- checks performed;
- risks or open questions;
- copy-ready handoff for the Director-Engineer.

## Report Card Rule

Every role report must be one copy-ready technical card for the
Director-Engineer chat. Do not scatter the report across narrative notes,
partial summaries, or multiple handoff blocks.

When a role writes a report file, store it in that role's own folder so the
Director-Engineer can read role output in place:

```text
content/captain-ether/roles/<role-name>/reports/<report-name>.md
```

Task files should name that role-folder report path in `Allowed Files`. If an
assignment gives an older report path outside the role folder, complete only the
explicitly allowed file and flag that the next assignment should use the
role-folder report path.

## GitHub Visibility Rule

Every role folder must contain tracked files. Empty folders are not visible in
GitHub. Keep `tasks/README.md` and `reports/README.md` in every role folder so
the office structure remains visible even before a role receives its first task.
