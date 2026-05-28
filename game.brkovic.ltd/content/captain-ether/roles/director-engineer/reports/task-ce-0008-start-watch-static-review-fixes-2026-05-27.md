# TASK-CE-0008 Start-Watch Static Review Fixes

Date: 2026-05-27
Role: Director Ether / Captain Ether
Mode: implementation follow-up

## Status

PASS after local PHP CLI environment fix and validator rerun.

## Trigger

Background static review of `public/api/captain-ether/start-watch.php` found
three blockers after TASK-CE-0007:

- focused review fill could include same-branch items and blur the focus/review
  contract;
- weak items could exceed the quota by re-entering ordinary fill pools;
- focused branch selection did not hard-enforce the type floor before returning
  a watch.

## Changes

- Focused branch enablement now rejects `navigation_reports` beginner because
  the beginner pool has no phrase items and cannot meet the beginner type floor.
- Mixed and focused selection exclude unselected weak items from ordinary fill
  pools, keeping the weak quota a hard cap.
- Focused branch selection keeps exact focus/review quotas:
  - beginner: `9/3`;
  - intermediate: `12/4`;
  - advanced: `15/5`.
- Focused review candidates exclude same-branch items.
- Focused branch selection checks type floors before returning:
  - beginner: `3` words, `3` short expressions, `6` phrases;
  - intermediate: `4` words, `5` short expressions, `7` phrases;
  - advanced: `6` words, `6` short expressions, `8` phrases.

## Files Changed

- `public/api/captain-ether/start-watch.php`
- `content/captain-ether/roles/director-engineer/reports/beta-1-1-start-watch-branch-filter-contract-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0006-start-watch-branch-filter-implementation-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/start-watch-branch-filter-implementation-2026-05-27.md`

## Checks

PASS:

- Node static internal-symbol check: no missing local `captain_*` helper after
  excluding bootstrap-provided functions.
- Node brace-balance check: balanced.
- Node fixture simulation against `starter.json`:
  - `core_radio`: beginner/intermediate/advanced success;
  - `marina_harbour`: beginner/intermediate/advanced success;
  - `navigation_reports`: beginner reject, intermediate/advanced success;
  - `safety_securite`: beginner reject, intermediate/advanced success;
  - all other currently allowed taxonomy branches reject.
- Static payload check: question records still contain only `index`, `item_id`,
  and `level`.

PASS:

- `$HOME/.local/php-codex/bin/php -l public/api/captain-ether/start-watch.php`
- `$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php`

Environment note:

- `sudo`, `apt`, and `apt-get` are unavailable inside the current
  WebStorm/Flatpak shell;
- `flatpak-spawn --host` is blocked by Flatpak portal permissions;
- PHP 8.5.6 CLI was built locally from the official source tarball into
  `$HOME/.local/php-codex`;
- required modules confirmed: `json`, `mbstring`, `pcre`, `standard`.

Validator result:

```text
PASS
WARN (9): duplicate accepted_answers after normalization
```

## Next Expected

QA should rerun or accept the 32-case local smoke matrix using
`$HOME/.local/php-codex/bin/php`. Production smoke remains a separate Game
Director decision.

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
