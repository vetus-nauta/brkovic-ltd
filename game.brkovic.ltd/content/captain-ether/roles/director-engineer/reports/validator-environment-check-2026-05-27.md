# Validator Environment Check

Date: 2026-05-27
Role: Director-Engineer / Captain Ether
Task: TASK-CE-VALIDATOR-ENV-0001

## Status

NEEDS PHP ENVIRONMENT.

The Captain Ether PHP validator file exists locally, but `php` is not available
on `PATH` in this shell. Existing documented non-PHP commands cover JSON and
content-structure checks only; no documented non-PHP full replacement for the
Captain Ether matcher/regression validator was found.

## Commands Run

Read required operating and role files:

```sh
sed -n '1,220p' docs/game-director/mandatory-chat-operating-rules.md
sed -n '1,220p' docs/game-director/chat-reporting-rules.md
sed -n '1,220p' content/captain-ether/role-command-protocol.md
sed -n '1,220p' content/captain-ether/roles/README.md
sed -n '1,220p' content/captain-ether/roles/office-manifest.md
sed -n '1,240p' content/captain-ether/roles/director-engineer/rules.md
sed -n '1,260p' content/captain-ether/roles/director-engineer/handoff.md
sed -n '1,260p' content/captain-ether/roles/director-engineer/reports/batch-005-merge-2026-05-27.md
```

Result: required instructions read. Scope is report-only; only this report file
is allowed to be written.

Check whether PHP is available:

```sh
command -v php
```

Result: command exited `1` with no output.

Check whether the PHP validator file exists:

```sh
test -f content/captain-ether/tools/validate-captain-ether.php; printf '%s\n' "$?"
```

Result:

```text
0
```

Check validator file listing:

```sh
ls -l content/captain-ether/tools/validate-captain-ether.php
```

Result:

```text
-rw-rw-r-- 1 alexey alexey 25194 May 26 19:55 content/captain-ether/tools/validate-captain-ether.php
```

Attempt fast documentation search:

```sh
rg -n "validate-captain-ether|php content/captain-ether/tools|jq empty|validation command|validator" content/captain-ether docs/game-director --glob '!content/captain-ether/starter.json' --glob '!content/captain-ether/accept-reject-qa-pairs.json'
```

Result:

```text
/bin/sh: line 1: rg: command not found
```

Fallback documentation search:

```sh
grep -RIn --include='*.md' --include='*.json' --include='Makefile' --include='package.json' --include='composer.json' -E 'validate-captain-ether|php content/captain-ether/tools|jq empty|validation command|validator|npm run|composer|make ' content/captain-ether docs/game-director 2>/dev/null
```

Result: found the documented PHP validator command and documented `jq` checks.
Relevant confirmed references:

- `content/captain-ether/roles/director-engineer/reports/validation-command-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/handoff.md`
- `content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/batch-005-engineering-gate-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/batch-005-merge-2026-05-27.md`

Check for local package/composer/make entrypoints:

```sh
find . -maxdepth 3 -name package.json -o -name composer.json -o -name Makefile -o -name README.md
```

Result:

```text
./README.md
./docs/watch-officer/README.md
./prototypes/watch-officer-godot/README.md
```

Check for Captain Ether validator/tool files:

```sh
find content/captain-ether -maxdepth 3 -type f \( -name '*valid*' -o -path '*/tools/*' \) -print
```

Result:

```text
content/captain-ether/tools/validate-captain-ether.php
```

Check whether `jq` is available for the documented non-PHP structural checks:

```sh
command -v jq
```

Result:

```text
/usr/bin/jq
```

Read the existing validator-command report:

```sh
sed -n '1,180p' content/captain-ether/roles/director-engineer/reports/validation-command-2026-05-27.md
```

Result: confirms the primary full validator command is:

```sh
php content/captain-ether/tools/validate-captain-ether.php
```

Read the Batch 005 engineering-gate check section:

```sh
sed -n '70,120p' content/captain-ether/roles/director-engineer/reports/batch-005-engineering-gate-2026-05-27.md
```

Result: confirms documented non-PHP `jq` checks were used for Batch 005 draft
structure before QA, but also records that the PHP validator still must be run
later in an environment with PHP before merge/deploy decisions.

## Findings

1. PHP is not available in the current shell.
2. The PHP validator file exists at:

```text
content/captain-ether/tools/validate-captain-ether.php
```

3. The documented full validation command is PHP-based:

```sh
php content/captain-ether/tools/validate-captain-ether.php
```

4. Existing documented non-PHP validation-style commands are `jq` JSON and
structure checks, including the Batch 005 checks in the merge and engineering
gate reports:

```sh
jq empty content/captain-ether/starter.json
jq empty content/captain-ether/accept-reject-qa-pairs.json
jq empty content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

These are useful structural checks, but they do not replace the PHP
matcher/regression validator because they do not execute the Captain Ether
matcher or should-accept / should-reject regression logic.

5. No `package.json`, `composer.json`, or `Makefile` entrypoint for a non-PHP
Captain Ether validator was found within the checked project depth.

## Recommended Next Step

Install or use an environment where PHP is available, then run:

```sh
php content/captain-ether/tools/validate-captain-ether.php
```

If PHP cannot be installed locally under the current constraints, run the same
validator command elsewhere against this repository state and report the exact
output back to Director-Engineer before any deploy or production smoke decision.

## Scope Preserved

- Runtime/API/UI/content data not changed.
- `starter.json` not changed.
- Batches not changed.
- Matcher not changed.
- Router/registry not changed.
- Auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- Production config and deploy/FTP not touched.
- Secrets, cookies, sessions, CSRF, player email, and player identity not
  touched or printed.
