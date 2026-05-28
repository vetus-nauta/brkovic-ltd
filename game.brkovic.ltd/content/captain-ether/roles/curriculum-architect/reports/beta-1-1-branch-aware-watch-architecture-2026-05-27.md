# Curriculum Report: Beta 1.1 Branch-Aware Watch Architecture

Date: 2026-05-27
Role: Curriculum Architect / Captain Ether
Task: TASK-CE-0001
Mode: report-only

## Status

PASS as a curriculum architecture recommendation.

NEEDS DIRECTOR DECISION before any runtime, API, UI, content data, or QA-gate
change is assigned.

The current Beta 1.0 universal short-watch loop should remain the public
default:

- beginner: 12 questions
- intermediate: 16 questions
- advanced: 20 questions
- order: `word -> short_expression -> phrase`

## Baseline Read

Files read:

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `docs/game-director/task-registry.md`
- `docs/game-director/workstreams.md`
- `docs/game-director/decision-log.md`
- `content/captain-ether/director-ether-beta-1-handoff-2026-05-27.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/roles/curriculum-architect/rules.md`
- `content/captain-ether/roles/curriculum-architect/handoff.md`
- `content/captain-ether/branch-taxonomy.md`
- `content/captain-ether/content-growth-roadmap-1000.md`
- `content/captain-ether/answer-policy.md`
- supporting read-only checks of `starter.json`, `accept-reject-qa-pairs.json`,
  and `start-watch.php`

Current playable corpus:

- total playable items: 230
- levels: 84 beginner, 109 intermediate, 37 advanced
- types: 46 words, 62 short expressions, 122 phrases
- regression source: 230 item entries and 49 dangerous minimal-pair groups
- current branch metadata:

| Branch | Items | Beginner | Intermediate | Advanced | Words | Short expressions | Phrases | Readiness |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `core_radio` | 50 | 25 | 18 | 7 | 15 | 15 | 20 | Ready for hidden/internal branch-watch pilot; closest to UI-ready. |
| `marina_harbour` | 50 | 18 | 27 | 5 | 10 | 14 | 26 | Ready for hidden/internal pilot; needs more beginner buffer before public UI. |
| `navigation_reports` | 50 | 12 | 30 | 8 | 8 | 12 | 30 | Ready for hidden/internal pilot; beginner pool has no repetition buffer. |
| `safety_securite` | 40 | 8 | 24 | 8 | 6 | 10 | 24 | Not ready for public beginner focus; internal pilot only after Director decision. |
| unbranched legacy starter | 40 | 21 | 10 | 9 | 7 | 11 | 22 | Keep in Mixed Watch until branch/module backfill is approved. |

## Recommended Selection Model

Beta 1.1 should introduce branch awareness as an optional selector model, not as
a replacement for the universal watch.

Recommended future modes:

| Mode | Player-facing behavior | Curriculum rule |
| --- | --- | --- |
| `mixed` | Current Beta 1.0 watch. Default for all players. | Draw from all eligible content, including legacy unbranched items, then sort progressively. |
| `focused_branch` | Optional branch watch such as Core Radio or Marina / Harbour. | Draw most items from one branch, with a small review allowance. |
| `focused_module` | Later sub-branch focus, hidden until a branch is large. | Only expose when the module has enough items for multiple short watches. |

Future API shape should be additive if Director-Engineer approves it later:

```json
{
  "level": "beginner",
  "mode": "mixed",
  "branch": null,
  "module": null
}
```

Rules:

- If `mode` is absent, behavior must be exactly the current mixed watch.
- `mixed` must ignore branch filters.
- `focused_branch` may use `branch`.
- `focused_module` may use both `branch` and `module`, but should stay hidden
  until module thresholds are met.
- If a focused pool cannot satisfy the watch safely, the UI should not expose it.
  Runtime fallback should be a controlled Director-Engineer decision, not a
  curriculum assumption.

## Minimum Threshold Before UI Selection

Do not show a public branch selector merely because a branch exists.

Recommended minimum for a public branch tile:

- at least 60 total items in the branch;
- at least 24 beginner-eligible items;
- at least 32 beginner+intermediate eligible items;
- at least 40 total advanced-eligible items;
- at least 6 words, 10 short expressions, and 20 phrases;
- at least 3 modules with regression coverage;
- all items have `branch` and `module`;
- branch-specific QA smoke passes for beginner, intermediate, and advanced.

Recommended minimum for a public module selector:

- at least 24 items in the module;
- at least 8 phrase items;
- at least 4 short-expression items;
- at least 2 word items where relevant;
- at least 2x the shortest watch length if the module is offered to beginner.

Under this threshold, branch/module metadata may still be used for internal
reports, QA sampling, and future architecture design.

## Ready Now Vs Not Ready

Ready now for report-only planning and hidden/internal selector QA after a
Director-Engineer task:

- `core_radio`
- `marina_harbour`
- `navigation_reports`

Partially ready, but not for public focused beginner watches:

- `safety_securite`

Not ready for branch selection:

- `traffic_collision`
- `urgency_panpan`
- `distress_mayday`
- `onboard_operations`
- `vts_port_control`
- `review_minimal_pairs`
- the 40 unbranched legacy starter items

No branch should be exposed in public UI yet without a Director decision,
because the recommended UI threshold and branch-specific QA gate are not closed.

## Mixed Review Coexistence

Focused watches should not become sealed silos. Radio learning needs periodic
cross-branch review, especially for weak items and dangerous minimal pairs.

Recommended future split:

| Watch | Focus quota | Mixed review quota |
| --- | ---: | ---: |
| beginner 12 | 9-10 branch items | 2-3 review items |
| intermediate 16 | 12-13 branch items | 3-4 review items |
| advanced 20 | 15-16 branch items | 4-5 review items |

Review priority:

1. unresolved weak/Lost Oars items from the selected branch;
2. unresolved weak/Lost Oars items from any branch;
3. high-risk core radio or minimal-pair maintenance items;
4. ordinary mixed review only if there is still quota.

The watch length must never grow because of review. Review items must fit inside
the same 12/16/20 limits and the final watch should still be sorted by item type
after selection.

## Level And Item-Type Balance Rules

Keep the existing level eligibility:

- beginner watches use beginner items only;
- intermediate watches may use beginner and intermediate items, preferring
  intermediate;
- advanced watches may use all levels, preferring advanced.

Focused branch watches should keep the same progressive order:

```text
word -> short_expression -> phrase
```

Recommended type floor per watch:

| Level | Watch length | Word target | Short-expression target | Phrase remainder |
| --- | ---: | ---: | ---: | ---: |
| beginner | 12 | 3 | 3 | 6 |
| intermediate | 16 | 4 | 5 | 7 |
| advanced | 20 | 6 | 6 | 8 |

If a branch cannot meet the type floor after level filtering and review quota,
hide that branch/level combination rather than filling with unrelated content
that makes the watch feel mislabeled.

Safety, urgency, distress, VTS, collision, and minimal-pair-heavy branches need
extra caution: beginner items should be explicit beginner training items, not
advanced content pulled down to fill a count.

## Risks

Matcher risks:

- Branch focus concentrates similar phrases, increasing the chance that broad
  aliases or typo logic will collapse dangerous distinctions.
- Navigation and safety branches contain numbers, headings, ETA values,
  channels, directions, and signals that must stay protected.
- A module-specific synonym that is safe in one item may be unsafe globally.

Answer-policy risks:

- Focused branches may tempt content producers to widen accepted answers for
  fluency; accepted variants must remain item-local unless the Sea Speak
  Linguist and Director-Engineer approve broader policy.
- `Securite`, Pan-Pan, Mayday, berth/birth, fender/finder, port/starboard,
  heading/course/bearing, and ETA contrasts need explicit should-reject coverage.

QA risks:

- Current production smoke proves mixed Beta 1.0 behavior, not branch-filtered
  behavior.
- Each exposed branch/level combination needs a start-watch smoke, item-count
  check, type-order check, matcher sample, and dangerous-pair sample.
- The 40 unbranched legacy items can silently disappear from focused watches if
  metadata backfill is not planned.

UX risks:

- A branch menu can make the game feel like a course catalog instead of a short
  radio watch.
- Offering branches with shallow pools will cause repetition fatigue.
- A focused watch that injects too much review may feel mislabeled; one with no
  review may weaken retention.
- Beginner players should not be shown urgency, distress, or dense safety
  branches as equal choices before the curriculum has enough calm beginner
  scaffolding.

## Smallest Safe Next Director Ether Action

Approve this as a planning recommendation only, with no runtime/API/UI/content
change.

Then assign one narrow Director-Engineer report task:

```text
Design the future additive start-watch branch-filter contract for Captain Ether
Beta 1.1 without implementation. It must preserve current mixed behavior when
no mode/branch/module is sent, define underfilled-pool behavior, and list exact
QA smoke cases needed before any UI selector is exposed.
```

A separate later content task can backfill branch/module metadata for the 40
legacy starter items, but that should not be bundled with runtime design.

## Copy-Ready Handoff For Director Ether

```text
Curriculum Architect report PASS as plan, NEEDS DIRECTOR DECISION before
implementation.

Recommendation: keep Beta 1.0 Mixed Watch as the default and add branch-aware
watches later as an optional additive mode only. No public branch UI should be
exposed yet. Core Radio, Marina / Harbour, and Navigation Reports are ready for
hidden/internal selector QA after a Director-Engineer task; Safety / Securite is
partial; Traffic, Urgency, Distress, Onboard, VTS, Review Minimal Pairs, and the
40 unbranched legacy starter items are not ready for public focused selection.

Minimum public branch threshold: 60 total items, 24 beginner-eligible,
32 beginner+intermediate eligible, 40 advanced-eligible, at least 6 words,
10 short expressions, 20 phrases, 3 modules, branch/module metadata, and
branch-specific QA smoke.

Smallest safe next action: assign a Director-Engineer report-only selector
contract for future Beta 1.1. Do not edit runtime/API/UI/content data yet.
```

## Scope

Report-only. Changed file:

- `content/captain-ether/roles/curriculum-architect/reports/beta-1-1-branch-aware-watch-architecture-2026-05-27.md`

Not touched:

- `starter.json`
- batch JSON
- matcher/API/runtime
- UI
- router/registry
- auth/platform
- Watch Officer
- Nav Desk
- Game Director docs
- production config
- deploy/FTP state
- secrets or private config
