# Content Producer Card: Batch 003 Navigation Reports Basics

Date: 2026-05-27
Role: Content Producer / Captain Ether
Mode: content draft only

## Task Result

PASS.

Drafted Batch 003 for Sea Speak Linguist review:

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

No merge into `starter.json` was performed.

## Validator Command Result

Command run before PASS:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Result: `PASS`.

Batch validator summary:

- items: `50`
- grammar patterns: `27`
- dangerous pairs: `10`
- status: `draft`
- target_text checked: `50`
- should_accept checked: `131`
- should_reject checked: `150`
- dangerous must_accept checked: `36`
- dangerous must_reject checked: `52`

Validator warnings:

- `6` existing `starter_schema` duplicate-normalization warnings were reported for already-existing starter items.
- No Batch 003 warning or failure was reported.

## Changed Files

- `content/captain-ether/batches/batch-003-navigation-reports-basics.json`
- `content/captain-ether/roles/content-producer/reports/batch-003-navigation-reports-basics-card-2026-05-27.md`

Forbidden files were not edited by this task.

## Counts

Total items: `50`.

By type:

| Type | Count |
| --- | ---: |
| `word` | 8 |
| `short_expression` | 12 |
| `phrase` | 30 |

By level:

| Level | Count |
| --- | ---: |
| `beginner` | 12 |
| `intermediate` | 30 |
| `advanced` | 8 |

By branch:

| Branch | Count |
| --- | ---: |
| `navigation_reports` | 50 |

By module:

| Module | Count |
| --- | ---: |
| `position_reports` | 9 |
| `heading_course` | 12 |
| `speed_distance` | 8 |
| `eta_reports` | 6 |
| `reporting_points` | 5 |
| `navigation_readback` | 10 |

## Risky Accepted Variants

Review these item-local accepted variants before integration:

- `position` for `my position`;
- `heading` for `my heading`;
- `course` for `my course`;
- `kts` for `knots`;
- `E.T.A.` through explicit `e t a` accepted form;
- `UTC`, `Zulu`, `Z`, `1400 UTC`, `1400Z`, and spoken-digit ETA variants;
- bare `090` for course reports;
- `readback` compact form for `read back`;
- compact phrase forms such as `position east of reporting point Alpha`;
- `after punctuation cleanup` forms such as `ETA update 1500Z`.

## Should-Accept Examples

Examples included in batch QA notes:

- `position`
- `heading`
- `course`
- `bearing`
- `reporting point`
- `speed five kts`
- `ETA 1400Z`
- `bearing 090`
- `distance 2 nautical miles`
- `readback position`
- `My course is zero nine zero degrees.`
- `Correction, ETA 1500Z`

## Should-Reject Examples

Examples included in batch QA notes:

- `destination` for `position`
- `waypoint` for `reporting point`
- `heading zero nine zero` for bearing/course items
- `course 90 degrees`
- `ETA 1500 UTC` for ETA 1400 items
- `ETA 1400 local`
- `five nautical miles` for speed-in-knots items
- `one point five nautical miles` for decimal-distance items
- `position west of reporting point Alpha` for east items
- `left side` / `right side` for port/starboard navigation phrases
- `say again position` for readback items
- `read back position` for say-again items

## Dangerous Minimal Pairs

Top-level dangerous-pair groups prepared in the batch:

- `heading / course / bearing`
- `position / destination / waypoint / reporting point`
- `ETA 1400 / ETA 1500`
- `1400 UTC / 1400Z / one four zero zero UTC`
- `090 / 90`
- `knots / nautical miles / cables`
- `decimal / point / dot`
- `north / south / east / west`
- `port / starboard inside navigation phrases`
- `say again position / read back position`

## Open Questions For Sea Speak Linguist

- Should bare `090` be accepted for course reports, or only when the prompt asks for heading-style numeric value?
- Should `E.T.A.` via `e t a` remain accepted for the single-word ETA item?
- Should `Zulu` and `Z` remain accepted item-locally for ETA reports, or should only `UTC` be trained in Batch 003?
- Should compact forms such as `position east of reporting point Alpha` remain accepted, or should full `My position is...` be required?
- Should `waypoint` remain rejected for all `reporting point` items in this beginner/intermediate batch?
- Should `range` ever be accepted for `distance`, or should `distance` stay strict?
- Should `point` or `dot` remain rejected for decimal navigation reports under Batch 001 strictness?

## Matcher And Policy Risks

No matcher, API, UI, policy, regression, deploy, router, or auth changes were made.

Risks to route to Director-Engineer after Linguist review:

- numeric-token protection: `090/90`, `080/80`, `1400/1500`, `1430/1400`;
- unit substitution: `knots`, `nautical miles`, `cables`;
- strict radio decimal form: `decimal` versus `point` / `dot`;
- navigation term boundaries: `heading`, `course`, `bearing`;
- report-object boundaries: `position`, `destination`, `waypoint`, `reporting point`;
- ETA accepted forms may require careful item-local handling rather than global aliases.

## Scope Confirmation

Batch 003 includes routine yacht navigation reports only:

- position;
- heading/course/bearing;
- speed and distance;
- ETA;
- reporting points;
- navigation readback and correction.

Forbidden files were not changed:

- `starter.json`
- `accepted-answer-dictionary.md`
- `accept-reject-qa-pairs.json`
- `answer-policy.md`
- `role-command-protocol.md`
- matcher/API/UI files
- deploy, router, auth, private config, SMTP, cookies, login codes, player identity, or secrets

## Verification

Local validation performed:

- JSON parse: PASS.
- Exactly `50` items: PASS.
- Type mix `8 / 12 / 30`: PASS.
- Level mix `12 / 30 / 8`: PASS.
- Every item has `branch` and `module`: PASS.
- Every item has required fields and non-empty `accepted_answers`: PASS.
- Every item has QA notes with `should_accept`, `should_reject`, and `dangerous_minimal_pairs`: PASS.
- Batch validator command: PASS.
- Keep-out term scan on batch JSON: PASS.
- `git diff --check` for the batch file: PASS.

## Director-Engineer Handoff

Batch 003 is ready for Sea Speak Linguist review only. It should not be merged
into `starter.json` until the risky accepted variants, dangerous minimal pairs,
and matcher/policy risks above are accepted or revised.
