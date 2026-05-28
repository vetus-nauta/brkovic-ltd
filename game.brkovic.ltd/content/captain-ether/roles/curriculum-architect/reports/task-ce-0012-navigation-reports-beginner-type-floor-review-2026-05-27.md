# TASK-CE-0012 Navigation Reports Beginner Type-Floor Review

Date: 2026-05-27
Role: Curriculum Architect / Captain Ether
Mode: report-only

## Status

PASS as a curriculum recommendation.

Recommendation: keep `navigation_reports` beginner focused-branch requests as
`reject` for the first hidden/internal branch-filter fixture.

The rejection should be treated as a content-readiness decision, not as a
permanent branch policy. `navigation_reports` beginner should become eligible
only after future content fills a beginner phrase floor with enough buffer for
repeated watches.

No runtime/API/UI/content-data change is recommended in this task.

## Inputs Reviewed

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/curriculum-architect/rules.md`
- `content/captain-ether/roles/curriculum-architect/handoff.md`
- `content/captain-ether/roles/curriculum-architect/reports/beta-1-1-branch-aware-watch-architecture-2026-05-27.md`
- `content/captain-ether/roles/director-engineer/reports/beta-1-1-start-watch-branch-filter-contract-2026-05-27.md`
- `content/captain-ether/starter.json`
- `content/captain-ether/branch-taxonomy.md`
- `content/captain-ether/content-growth-roadmap-1000.md`
- `content/captain-ether/answer-policy.md`

## Current Pool Finding

Current `navigation_reports` focused pool by cumulative level eligibility:

| Level request | Eligible total | Words | Short expressions | Phrases |
| --- | ---: | ---: | ---: | ---: |
| beginner | 12 | 6 | 6 | 0 |
| intermediate | 42 | 8 | 12 | 22 |
| advanced | 50 | 8 | 12 | 30 |

Current proposed focused-watch type floor:

| Level | Watch length | Word target | Short-expression target | Phrase remainder |
| --- | ---: | ---: | ---: | ---: |
| beginner | 12 | 3 | 3 | 6 |
| intermediate | 16 | 4 | 5 | 7 |
| advanced | 20 | 6 | 6 | 8 |

The beginner pool has exactly 12 beginner-eligible items, but all are words or
short expressions. It has no beginner phrase items. This means a beginner
focused watch can fill count, but cannot satisfy the intended progression from
recognition units into sentence-level radio production.

## Decision Recommendation

Keep `navigation_reports` beginner as `reject` in the hidden/internal fixture
table until future content adds beginner phrases.

Do not use a different beginner focused-watch policy for this branch yet:

- Do not allow a word/expression-only beginner focused watch under the current
  `focused_branch` contract.
- Do not silently borrow intermediate phrases into beginner. Navigation reports
  carry headings, courses, bearings, ETA, distance, directions, and reporting
  points, so pulling denser items down risks false beginner difficulty.
- Do not fill the missing phrase floor with unrelated mixed content. That would
  make the watch label misleading and weaken QA's ability to test branch
  selection.
- Do not introduce a special `beginner_terms_only` policy for this one branch
  inside the start-watch contract. If such a mode is later wanted, it should be
  a separate curriculum/UI decision with its own name, thresholds, and QA smoke.

Best current policy:

```text
mode=focused_branch, branch=navigation_reports, level=beginner
-> hard reject as branch_watch_unavailable
```

Intermediate and advanced can remain success fixtures because their cumulative
eligible pools have enough phrase coverage.

## Future Content Targets

Recommended target before changing beginner from reject to success:

- Minimum to pass the current floor: add at least `6` beginner phrase items in
  `navigation_reports`.
- Practical minimum for repeated play: add `12-16` beginner phrase items, so a
  12-question watch is not the same six phrases every time.
- Keep the beginner branch pool at no less than `24` beginner-eligible items
  before public UI exposure, matching the earlier branch threshold.
- Keep at least `3` beginner-covered modules represented so the branch does not
  become one narrow heading/course drill.

Recommended first beginner phrase targets:

| Module | Target beginner phrases | Notes |
| --- | ---: | --- |
| `position_reports` | 4-5 | Simple position reports with distance/direction/reference, avoiding dense multi-field reports. |
| `heading_course` | 3-4 | One-field heading/course reports; keep heading/course/bearing contrasts explicit. |
| `speed_distance` | 3-4 | Simple speed and distance phrases using protected units. |
| `eta_reports` | 2-3 | Only very simple ETA phrases; add reject pairs for 1400/1500 style errors. |
| `reporting_points` | 2-3 | Passing or abeam reporting point phrases with stable Alpha/Bravo references. |

Suggested beginner phrase examples for future Content Producer drafting:

- `My position is north of the marina.`
- `My position is two cables south of the marina.`
- `My heading is zero nine zero.`
- `My course is zero nine zero.`
- `Speed five knots.`
- `Distance two cables.`
- `ETA one four zero zero UTC.`
- `I am abeam reporting point Alpha.`

These are content targets only. They still need Sea Speak Linguist review for
accepted answers, must-stay-wrong variants, and dangerous minimal pairs.

## Risks

Retention and repeated-play risk:

- A word/expression-only beginner branch may feel like a vocabulary list rather
  than a radio watch.
- With only 12 beginner-eligible items, a successful focused watch would repeat
  too predictably and could make the branch feel exhausted after one or two
  runs.
- If the watch has no phrases, learners do not practice the transition from
  terms to usable radio utterances, which is the main value of the existing
  `word -> short_expression -> phrase` progression.

Matcher and Sea Speak risk:

- Navigation items concentrate protected values: headings, courses, bearings,
  ETA, distances, directions, and units.
- Beginner content must not loosen numeric, direction, heading/course/bearing,
  `knots`/`nautical miles`/`cables`, or `reporting point` distinctions.
- `heading`, `course`, and `bearing` should remain separate concepts unless a
  specific item intentionally accepts a variant after linguistic review.

QA risk:

- If beginner is allowed with a relaxed floor, QA loses a clear underfilled-pool
  fixture for the branch-filter contract.
- Silent fallback to mixed would hide branch readiness failures.
- Borrowing review items beyond the review quota could pass length checks while
  failing the learner's expectation of a navigation-focused watch.

## Best-Practice Note

For this repo, type balance is not abstract course theory. The current game
loop teaches a short radio watch by moving from small units to usable phrases.
That progression supports retention because players first recognize terms,
then combine them into short expressions, then produce radio-language turns.
It also protects repeated play: a branch with all words and short expressions
becomes repetitive quickly, while a branch with enough phrase variety can
produce different watches without abandoning the same 12/16/20 length limits.

## Localization Impact

- Learner source language reviewed in current content: `ru`.
- Sea Speak target language: `en`.
- This report defines curriculum policy only and does not add player-facing UI
  copy.
- Future source-prompt localization for new beginner navigation phrases should
  stay routed through Curriculum Architect and Sea Speak Linguist before batch
  expansion.
- Do not localize or soften Sea Speak target meaning by UI language.

## Copy-Ready Handoff For Director-Engineer

```text
TASK-CE-0012 Curriculum Architect PASS.

Recommendation: keep navigation_reports beginner focused_branch as reject in
the hidden/internal branch-filter fixture. Current pool has 12 beginner-eligible
items: 6 words, 6 short expressions, 0 phrases. It can fill count but cannot
meet the beginner type floor of 3 words, 3 short expressions, and 6 phrases.

Do not add a special relaxed beginner focused-watch policy for this branch yet.
Do not silently fallback to mixed, do not borrow intermediate phrases into
beginner, and do not fill with unrelated ordinary review beyond the focused
contract.

Future content target: add at least 6 beginner navigation_reports phrases to
pass the floor, preferably 12-16 beginner phrases across position_reports,
heading_course, speed_distance, eta_reports, and reporting_points before making
beginner a success fixture or exposing it publicly.

Next owner: Content Producer for a future navigation_reports beginner phrase
batch brief, then Sea Speak Linguist review, then Director-Engineer integration
and QA smoke.
```

## Scope Preserved

Report-only. Changed file:

- `content/captain-ether/roles/curriculum-architect/reports/task-ce-0012-navigation-reports-beginner-type-floor-review-2026-05-27.md`

Not touched:

- `starter.json`
- content batch JSON
- matcher/API/runtime
- UI/router/registry
- auth/platform
- Watch Officer
- Nav Desk
- Game Director docs
- production config
- deploy/FTP state
- secrets/private config

## Checks

Commands run:

- `node -e '...'` read-only branch/level/type count from `content/captain-ether/starter.json`
- `node -e '...'` read-only listing of `navigation_reports` items from `content/captain-ether/starter.json`
- `git status --short`

Tests: not run; documentation-only task.
