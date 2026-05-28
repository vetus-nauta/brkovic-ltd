# Content Producer Card: Batch 002 Marina / Harbour Basics

Date: 2026-05-27
Role: Content Producer / Captain Ether
Mode: content draft only

## Task Result

PASS.

Drafted Batch 002 for Sea Speak Linguist review:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

No merge into `starter.json` was performed.

## Changed Files

- `content/captain-ether/batches/batch-002-marina-harbour-basics.json`
- `content/captain-ether/roles/content-producer/reports/batch-002-marina-harbour-basics-card-2026-05-27.md`

Forbidden files were not edited by this task.

## Counts

Total items: `50`.

By type:

| Type | Count |
| --- | ---: |
| `word` | 10 |
| `short_expression` | 14 |
| `phrase` | 26 |

By level:

| Level | Count |
| --- | ---: |
| `beginner` | 18 |
| `intermediate` | 27 |
| `advanced` | 5 |

By branch:

| Branch | Count |
| --- | ---: |
| `marina_harbour` | 50 |

By module:

| Module | Count |
| --- | ---: |
| `arrival_call` | 2 |
| `berth_request` | 5 |
| `approach_instructions` | 10 |
| `fuel_water_power` | 11 |
| `mooring_alongside` | 16 |
| `departure_basic` | 6 |

Supporting structures:

- grammar patterns: `22`
- top-level dangerous minimal-pair groups: `12`

## Risky Accepted Variants

Review these item-local accepted variants before integration:

- `request a berth` for `request berth`;
- `requesting berth` / `requesting a berth` for berth-request phrases;
- `request fresh water` for `request water`;
- `request water` for `Request fresh water.`;
- `fenders ready` for `prepare fenders`;
- `lines ready` for `prepare lines`;
- `request permission to depart` for `request departure`;
- `request departure` for `Request permission to depart.`;
- `approach slowly` for `Approach at slow speed.`;
- `after fuel` for `after taking fuel`.

## Should-Accept Examples

Examples included in batch QA notes:

- `berth`
- `request berth`
- `request a fuel berth`
- `request fresh water`
- `request shore power`
- `stand by outside the marina`
- `proceed to berth`
- `port side to`
- `starboard side to`
- `prepare fenders on port side`
- `prepare bow and stern lines`
- `request permission to depart`

## Should-Reject Examples

Examples included in batch QA notes:

- `birth` for `berth`
- `dock`, `quay`, `pier`, `slip` for `berth`
- `need a berth` for `request berth`
- `fuel dock` for `fuel berth`
- `rope` for `line`
- `finder` and `bumper` for `fender`
- `left side to` for `port side to`
- `right side to` for `starboard side to`
- `wait out` and `do not answer` for `stand by outside`
- `go ahead to berth` for `proceed to berth`
- `proceed slowly` for `approach slowly`
- `request power` or `request electricity` for `request shore power`

## Dangerous Minimal Pairs

Top-level dangerous-pair groups prepared in the batch:

- `berth / birth`
- `berth / dock / quay / pier / slip`
- `moor / berth / anchor`
- `line / rope`
- `fender / finder`
- `port side to / starboard side to`
- `ahead / astern / alongside / abeam`
- `stand by outside / wait out / do not answer`
- `proceed / enter / approach / go ahead`
- `request berth / need a berth`
- `water / fuel / shore power`
- `arrival / departure`

## Open Questions For Sea Speak Linguist

- Should `request fresh water` be accepted for `request water`, and should `request water` be accepted for `Request fresh water.`?
- Should `fenders ready` and `lines ready` remain accepted as equivalents for `prepare fenders` and `prepare lines`?
- Should `request departure`, `request departure permission`, and `request permission to depart` be treated as item-local variants?
- Should `dock`, `quay`, `pier`, or `slip` ever be accepted item-locally for berth items, or should they remain rejected across Batch 002?
- Should `bumper` ever be accepted for `fender`, or should `fender` stay strict?
- Should berth identifiers accept compact forms such as `B12`, or should Batch 002 keep only spoken-form `Bravo one two` until matcher QA reviews alphanumeric formats?
- Is `Depart when the fairway is clear.` appropriate for routine marina scope, or too close to authority/traffic-control language?

## Matcher And Policy Risks

No matcher, API, UI, policy, regression, deploy, router, or auth changes were made.

Risks to route to Director-Engineer after Linguist review:

- one-letter typo risks: `berth/birth`, `fender/finder`;
- ordinary-word substitution risks: `line/rope`, `fender/bumper`, `shore power/electricity`;
- operational opposite risks: `port side to/starboard side to`, `outside/inside`, `arrival/departure`;
- movement-procedure risks: `proceed`, `enter`, `approach`, and radio `go ahead`;
- alphanumeric berth shorthand such as `B12` was intentionally not accepted in draft.

## Verification

Local validation performed:

- JSON parse: PASS.
- Exactly `50` items: PASS.
- Type mix `10 / 14 / 26`: PASS.
- Level mix `18 / 27 / 5`: PASS.
- Every item has `branch` and `module`: PASS.
- Every item has required fields and non-empty `accepted_answers`: PASS.
- Every item has QA notes with `should_accept`, `should_reject`, and `dangerous_minimal_pairs`: PASS.
- Batch item and grammar-pattern ids do not collide with `starter.json` or Batch 001: PASS.
- `target_text` is covered by `accepted_answers` after normalization: PASS.
- `git diff --check` for the batch file: PASS.

## Director-Engineer Handoff

Batch 002 is ready for Sea Speak Linguist review only. It should not be merged
into `starter.json` until the risky accepted variants, dangerous minimal pairs,
and matcher/policy risks above are accepted or revised.
