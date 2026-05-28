# TASK-CE-0010 Branch-Filter Validation Gate

Date: 2026-05-27
Role: Validation Steward
Mode: report-only gate card

## Result

PASS.

The reproducible local validation gate for the Beta 1.1 branch-filter QA rerun
is ready. QA remains the independent acceptance owner; this card only defines
the reproducible command gate, expected fixtures, known warnings, and
PASS/BLOCKED criteria.

## Scope

Allowed file created:

- `content/captain-ether/roles/validation-steward/reports/task-ce-0010-branch-filter-validation-gate-2026-05-27.md`

Preserved scope:

- runtime/API not changed;
- content JSON not changed;
- matcher not changed;
- UI/router/auth/platform not changed;
- Game Director docs not changed;
- production config, deploy/FTP state, secrets, private config, cookies,
  sessions, CSRF values, login codes, SMTP data, player email, and player
  identity data not touched or pasted.

## Source Documents

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/validation-steward/rules.md`
- `content/captain-ether/roles/validation-steward/handoff.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0008-start-watch-static-review-fixes-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/task-ce-0009-urgency-assistance-qa-fixture-fix-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/beta-1-1-start-watch-branch-filter-contract-2026-05-27.md`

## Environment Note

Working directory:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

Use the user-local PHP CLI, not system `php`, for reproducibility in the current
WebStorm/Flatpak shell:

```text
$HOME/.local/php-codex/bin/php
```

Confirmed runtime:

```text
PHP 8.5.6 (cli) (built: May 27 2026 21:15:35) (NTS)
```

`rg` was unavailable in this shell, so static source lookup used `grep` as a
read-only fallback. The QA rerun should not depend on `rg`.

## Commands Run

```sh
$HOME/.local/php-codex/bin/php -v
```

Result: PASS. PHP CLI is available and reports PHP `8.5.6`.

```sh
$HOME/.local/php-codex/bin/php -l public/api/captain-ether/start-watch.php
```

Result: PASS.

```text
No syntax errors detected in public/api/captain-ether/start-watch.php
```

```sh
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Result: PASS with existing warnings.

Summary:

- starter items: `255`;
- grammar patterns: `112`;
- scenarios: `2`;
- QA items: `255`;
- should-accept examples: `711`;
- should-reject examples: `783`;
- dangerous pair groups: `57`;
- watch selection smoke: beginner/intermediate/advanced all `bad_runs: 0`;
- final validator status: `PASS`;
- warnings: `WARN (9)` duplicate `accepted_answers` after normalization.

```sh
node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync("content/captain-ether/starter.json","utf8")); const branches=["core_radio","marina_harbour","navigation_reports","safety_securite","traffic_collision","urgency_panpan","distress_mayday","onboard_operations","vts_port_control","review_minimal_pairs"]; const levels={beginner:["beginner"],intermediate:["beginner","intermediate"],advanced:["beginner","intermediate","advanced"]}; const len={beginner:12,intermediate:16,advanced:20}; const focus={beginner:9,intermediate:12,advanced:15}; const floor={beginner:{word:3,short_expression:3,phrase:6},intermediate:{word:4,short_expression:5,phrase:7},advanced:{word:6,short_expression:6,phrase:8}}; const enabled=(b,l)=>["core_radio","marina_harbour"].includes(b)||(["navigation_reports","safety_securite"].includes(b)&&["intermediate","advanced"].includes(l)); const ok=(b,l)=>{if(!enabled(b,l)) return false; const eligible=data.items.filter(i=>levels[l].includes(i.level)); const own=eligible.filter(i=>i.branch===b); const review=eligible.filter(i=>i.branch!==b); const c=a=>a.reduce((m,i)=>(m[i.type]=(m[i.type]||0)+1,m),{}); const ownC=c(own), totalC=c(eligible); for (const [t,n] of Object.entries(floor[l])) if((totalC[t]||0)<n) return false; return own.length>=focus[l] && review.length>=len[l]-focus[l];}; for (const b of branches) console.log(b, ["beginner","intermediate","advanced"].map(l=>`${l}:${ok(b,l)?"success":"reject"}`).join(" "));'
```

Result: PASS. Static fixture simulation matched the expected branch/level table
below.

## Focused Watch Targets

| Level | Watch length | Focus quota | Review quota | Type floor |
| --- | ---: | ---: | ---: | --- |
| beginner | 12 | 9 | 3 | `3 word / 3 short_expression / 6 phrase` |
| intermediate | 16 | 12 | 4 | `4 word / 5 short_expression / 7 phrase` |
| advanced | 20 | 15 | 5 | `6 word / 6 short_expression / 8 phrase` |

## Expected Branch/Level Fixture Table

These fixtures are hidden/internal API QA fixtures only. They do not approve
public branch selector exposure.

| Branch | Beginner | Intermediate | Advanced | QA note |
| --- | --- | --- | --- | --- |
| `core_radio` | success | success | success | Primary all-level success fixture. |
| `marina_harbour` | success | success | success | Hidden QA success fixture; not public UI approval. |
| `navigation_reports` | reject | success | success | Beginner is intentionally unavailable because the beginner pool cannot safely satisfy the type floor. |
| `safety_securite` | reject | success | success | Beginner is intentionally unavailable for the same safe-focus threshold reason. |
| `traffic_collision` | reject | reject | reject | No enabled focused pool in the current implementation. |
| `urgency_panpan` | reject | reject | reject | Content exists, but focused branch selection is intentionally not enabled for this branch in Beta 1.1 gate. |
| `distress_mayday` | reject | reject | reject | No enabled focused pool in the current implementation. |
| `onboard_operations` | reject | reject | reject | No enabled focused pool in the current implementation. |
| `vts_port_control` | reject | reject | reject | No enabled focused pool in the current implementation. |
| `review_minimal_pairs` | reject | reject | reject | No enabled focused pool in the current implementation. |

Expected reject error for valid but unavailable focused branches/levels:

```json
{
  "ok": false,
  "error": "branch_watch_unavailable",
  "reason": "Focused watch pool is below threshold",
  "required_mode": "mixed"
}
```

Expected request-validation errors:

- invalid `mode`: `invalid_watch_mode`;
- `mode=focused_branch` with missing `branch`: `missing_branch`;
- `mode=focused_branch` with unknown `branch`: `invalid_branch`;
- `mode=focused_module`: `focused_module_unavailable`.

All error cases must avoid session/progress/log mutation and must not expose
secrets, player identity, session, CSRF, accepted answers, QA notes, target
text, or debug payload.

## QA PASS Criteria

QA can mark the Beta 1.1 branch-filter local gate PASS only if all of these are
true:

- `$HOME/.local/php-codex/bin/php -v` confirms the local PHP CLI is available;
- `$HOME/.local/php-codex/bin/php -l public/api/captain-ether/start-watch.php`
  reports no syntax errors;
- `$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php`
  ends in `PASS`;
- the only validator warnings are the known `WARN (9)` duplicate
  `accepted_answers` after normalization listed below;
- the 32-case QA smoke from the Beta 1.1 contract passes;
- focused success cases return exact watch lengths, exact focus/review quotas,
  progressive final order, and no private/internal fields in question payloads;
- focused reject/error cases return controlled errors with no mixed fallback and
  no session/progress/answer-log mutation;
- mixed mode and absent-mode legacy requests preserve Beta 1.0 behavior and
  keep unbranched legacy items eligible.

## QA BLOCKED Criteria

QA should mark the gate BLOCKED and route to Director-Engineer if any of these
occur:

- local PHP CLI at `$HOME/.local/php-codex/bin/php` is missing or cannot run;
- syntax check fails;
- validator exits non-zero or reports a regression failure;
- validator warnings differ from the known duplicate-normalization set without
  Director-Engineer acceptance;
- the branch/level fixture table differs from this card;
- a focused reject silently falls back to mixed;
- a focused reject mutates session/progress/answer-log state;
- any successful response exposes `target_text`, `accepted_answers`,
  `qa_notes`, player email, `user_id`, `player_hash`, session token, CSRF, or
  debug fields in player-facing payloads;
- QA requires production smoke, deploy, auth changes, login-code disclosure, or
  private config access. Those are separate Game Director or Platform/Auth
  decisions, not this local validation gate.

## Remaining Warnings

The validator still reports these duplicate-normalization warnings:

- `phrase_pan_pan_001`: `pan pan pan pan pan pan`;
- `phrase_core_radio_check_over_001`: `radio check over`;
- `phrase_core_correction_channel_one_three_001`: `correction channel one three`;
- `phrase_core_question_underway_001`: `question are you underway`;
- `phrase_core_answer_affirmative_001`: `answer affirmative`;
- `phrase_core_answer_negative_001`: `answer negative`;
- `expr_urgency_panpan_001`: `pan pan`;
- `phrase_urgency_panpan_three_times_001`: `pan pan pan pan pan pan`;
- `phrase_urgency_read_back_details_001`: `read back pan pan details`.

Owner route: Director-Engineer should triage these as a separate content cleanup
or validator hygiene task. They are not branch-filter blockers while the
validator status remains `PASS` and the warning set is unchanged.

## Best-Practice Notes For Future Gates

- Pin local validation commands to `$HOME/.local/php-codex/bin/php` in role
  handoffs until the shell has a reliable system PHP.
- Keep branch-filter QA local unless a separate Game Director task explicitly
  grants production smoke or deploy scope.
- Treat `WARN` output as tracked debt: stable known warnings may be allowed by
  the gate, but any new or changed warning should stop QA for Director-Engineer
  classification.
- Keep fixture simulations read-only and based on repository JSON; do not use
  storage mutation or authenticated API calls for the command gate card.
- Record exact commands and local runtime path in every validation report so a
  future chat can reproduce the same gate without discovering the environment
  again.
- Keep public UI exposure separate from hidden/internal branch filter readiness;
  a passing internal fixture table is not public branch selector approval.

## Localization Impact

N/A for player-facing localization. This task created a Director-facing
validation report only and introduced no player-facing copy, API message, UI
string, or content translation.

## Next Expected Gate

QA should run the Beta 1.1 32-case branch-filter smoke using this command gate
and report PASS/BLOCKED to Director-Engineer. Production smoke/deploy remains a
separate Game Director decision.
