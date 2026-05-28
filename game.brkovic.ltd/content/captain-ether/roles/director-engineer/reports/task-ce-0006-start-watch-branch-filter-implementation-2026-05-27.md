# TASK-CE-0006 Start-Watch Branch Filter Implementation

Date: 2026-05-27
Role: Director Ether / Captain Ether
Mode: local hidden/internal implementation

## Status

Implemented and locally verified after static review fixes.

The additive hidden/internal branch-filter contract was implemented in
`start-watch.php`. PHP CLI was built locally in the user environment to unblock
syntax and validator checks from the current WebStorm/Flatpak shell.

## Files Changed

- `public/api/captain-ether/start-watch.php`

## Implemented Behavior

Default mixed behavior:

- no `mode` keeps current mixed behavior;
- no `mode` with stray `branch` or `module` keeps current mixed behavior;
- `mode: mixed` ignores `branch` and `module`;
- watch lengths remain `12/16/20`;
- final order still uses `word -> short_expression -> phrase`;
- question/session records do not include `branch` or `module`.

Focused branch behavior:

- `mode: focused_branch` requires a valid branch;
- invalid or missing branch returns a controlled error before session/progress
  mutation;
- first hidden/internal success fixtures:
  - `core_radio`: beginner/intermediate/advanced;
  - `marina_harbour`: beginner/intermediate/advanced;
  - `navigation_reports`: intermediate/advanced only;
  - `safety_securite`: intermediate/advanced only;
- unavailable or underfilled focused requests return
  `branch_watch_unavailable` before session/progress mutation.

Focused module behavior:

- `mode: focused_module` returns `focused_module_unavailable`;
- no session/progress mutation is performed.

Safety behavior:

- invalid `mode` returns `invalid_watch_mode`;
- error responses use controlled error keys and do not echo raw input;
- hard reject paths run before `watch_sessions` or `progress` storage writes;
- branch/module data remains out of player-facing question payloads.
- mixed and focused selection now treat the weak-item quota as a hard cap by
  excluding unselected weak items from ordinary fill pools;
- focused review fill excludes same-branch items, so focus/review quotas remain
  distinct;
- focused branch selection must meet the accepted type floor before returning a
  watch.

## Checks Performed

PASS:

- Node static symbol check confirmed required branch-filter symbols and error
  keys are present.
- Node data fixture check confirmed current hidden/internal success/reject
  expectations are satisfiable from `starter.json` after correcting
  `navigation_reports` beginner to reject.
- Node static payload check confirmed `branch` and `module` are not added to
  the question records created by `start-watch.php`.
- Manual code review confirmed `storage_mutate('watch_sessions', ...)` and
  `storage_mutate('progress', ...)` occur after invalid/unavailable filter
  checks.
- Static review findings closed: same-branch review leakage, weak quota leakage,
  and missing focused type-floor enforcement.

PASS:

```text
$HOME/.local/php-codex/bin/php -l public/api/captain-ether/start-watch.php
```

Output:

```text
No syntax errors detected in public/api/captain-ether/start-watch.php
```

PASS:

```text
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Output summary:

```text
PASS
WARN (9): duplicate accepted_answers after normalization
```

The validator initially exposed one content QA fixture conflict for
`word_urgency_assistance_001`; see TASK-CE-0009.

## Required Next Gate

QA should rerun or accept the 32-case local smoke matrix using the local PHP CLI
now available in this shell. Production smoke remains separate.

At minimum, QA should verify:

- mixed baseline remains unchanged for all three levels;
- invalid focused requests do not create sessions or mutate progress;
- focused branch success/reject fixtures match the contract;
- `focused_module` is unavailable and mutation-free;
- player-facing payload privacy is preserved;
- `submit-answer`, `finish-watch`, `progress`, Lost Oars, and answer-log remain
  compatible;
- matcher regression and dangerous minimal pairs remain clean.

## Scope Preserved

- UI not changed.
- `starter.json` not changed.
- batch JSON not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- production config and deploy/FTP state not touched.
- secrets and private config not touched.
