# Validation Steward Handoff

Date: 2026-05-27

## Current State

Captain Ether local validation was unblocked inside the current WebStorm/Flatpak
shell by building a user-local PHP CLI:

```text
$HOME/.local/php-codex/bin/php
```

Required modules confirmed:

- `json`
- `mbstring`
- `pcre`
- `standard`

Useful commands:

```text
$HOME/.local/php-codex/bin/php -l public/api/captain-ether/start-watch.php
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Latest known result:

- `start-watch.php` syntax: PASS.
- Captain Ether validator: PASS.
- Remaining validator warnings: 9 duplicate `accepted_answers` after
  normalization.

## Active Concerns

- QA 32-case branch-filter smoke still needs independent QA report.
- Duplicate-normalization warnings should be triaged as a separate cleanup
  task, not mixed into branch-filter implementation.
- `navigation_reports` beginner focused watch is now reject by contract because
  beginner content has no phrase items and cannot meet the beginner type floor.
- Production smoke/deploy remains separate and requires Game Director approval.

## First Useful Task

Prepare a reproducible validation gate card for the Beta 1.1 branch-filter QA
rerun:

- exact command list;
- expected branch/level fixture table;
- environment note for `$HOME/.local/php-codex/bin/php`;
- remaining warnings and owner route;
- PASS/BLOCKED criteria for QA.
