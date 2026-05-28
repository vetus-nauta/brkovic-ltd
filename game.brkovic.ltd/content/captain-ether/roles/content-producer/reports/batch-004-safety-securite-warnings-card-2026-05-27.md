# Content Producer Card: Batch 004 Safety / Securite Warnings

Date: 2026-05-27
Role: Content Producer / Captain Ether
Mode: content draft only

## Task Result

PASS.

Drafted Batch 004 for Sea Speak Linguist review:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

No merge into `starter.json` was performed.

## Validator Command Result

Command run before PASS:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Result: `PASS`.

Batch validator summary:

- items: `40`
- grammar patterns: `24`
- dangerous pairs: `11`
- status: `draft`
- target_text checked: `40`
- should_accept checked: `99`
- should_reject checked: `120`
- dangerous must_accept checked: `30`
- dangerous must_reject checked: `58`

Validator warnings:

- `6` existing `starter_schema` duplicate-normalization warnings were reported for already-existing starter items.
- No Batch 004 warning or failure was reported.

## Changed Files

- `content/captain-ether/batches/batch-004-safety-securite-warnings.json`
- `content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md`

Forbidden files were not edited by this task.

## Counts

Total items: `40`.

By type:

| Type | Count |
| --- | ---: |
| `word` | 6 |
| `short_expression` | 10 |
| `phrase` | 24 |

By level:

| Level | Count |
| --- | ---: |
| `beginner` | 8 |
| `intermediate` | 24 |
| `advanced` | 8 |

By branch:

| Branch | Count |
| --- | ---: |
| `safety_securite` | 40 |

By module:

| Module | Count |
| --- | ---: |
| `safety_signal` | 5 |
| `navigation_warning` | 5 |
| `weather_sea_state` | 7 |
| `restricted_visibility` | 5 |
| `hazard_reporting` | 8 |
| `safety_readback` | 10 |

## Scope Boundary

Batch 004 is a safety-information batch, not an urgency or distress batch.

Included:

- Securite safety signal;
- safety warning, navigation warning, and weather warning phrases;
- restricted visibility;
- hazards and obstructions as safety information;
- safety readback and received-information phrases;
- channel, time, bearing, distance, and direction precision inside safety warnings.

Excluded from playable target content:

- Pan-Pan and urgency traffic;
- Mayday and distress traffic;
- SAR;
- fire;
- flooding;
- MOB;
- medical assistance;
- abandon ship;
- collision damage;
- legal-status phrases;
- heavy VTS, port-control, or commercial-operations instructions;
- collision-avoidance intentions;
- CPA/TCPA.

Pan-Pan and Mayday appear only in reject examples and dangerous minimal pairs.

## Risky Accepted Variants

Review these item-local accepted variants before integration:

- `Securite` and `Sécurité` are accepted for the safety signal.
- Ordinary English `security` is rejected and must not become a global alias.
- Numeric and spoken channel forms are accepted item-locally, for example `channel 16` and `channel one six`.
- Time forms are accepted item-locally, for example `1400 UTC`, `1400Z`, `one four zero zero UTC`, `1500 UTC`, and `1500Z`.
- `UTC`, `Zulu`, and `Z` appear only where the item trains a safety-information time.
- Compact `readback` is accepted for `read back` in safety-readback items.
- `keep a listening watch` is accepted alongside `keep listening watch`.
- `received safety information` and `safety information received` are both accepted where the prompt targets receipt confirmation.
- Numeric shorthand such as `090` and `2 cables` is accepted only in item-local bearing/distance contexts.

## Should-Accept Examples

Examples included in batch QA notes:

- `Securite`
- `Sécurité`
- `Securite Securite Securite`
- `safety warning`
- `navigation warning`
- `weather warning`
- `restricted visibility`
- `keep listening watch`
- `readback warning`
- `Securite navigation warning on channel 16`
- `Safety information valid until 1400Z`
- `Hazard bearing 090 distance 2 cables`

## Should-Reject Examples

Examples included in batch QA notes:

- `security`
- `security security security`
- `pan pan pan pan pan pan`
- `mayday mayday mayday`
- `urgency warning`
- `distress warning`
- `poor visibility`
- `reduced visibility`
- `visibility good`
- `weather warning` for navigation-warning prompts
- `navigation warning` for weather-warning prompts
- `danger reported`
- `obstacle reported`
- `say again warning`
- wrong channel, time, bearing, distance, or direction values, for example `channel 12`, `1500 UTC` for a `1400 UTC` item, `bearing 90`, and `two nautical miles` where `2 cables` is targeted.

## Dangerous Minimal Pairs

Top-level dangerous-pair groups prepared in the batch:

- `Securite / Sécurité / security`
- `Securite / Pan-Pan / Mayday`
- `safety / urgency / distress`
- `warning / advice / information`
- `advice / advise`
- `restricted visibility / poor visibility / visibility good`
- `navigation warning / weather warning`
- `hazard / obstruction / danger`
- `obstruction / obstacle`
- `wind / sea state / visibility`
- exact channels, times, bearings, distances, and directions.

## Open Questions For Sea Speak Linguist

- Should accented `Sécurité` remain accepted wherever `Securite` appears?
- Should `Zulu` and `Z` remain accepted item-locally for safety information times, or should only `UTC` be trained in this batch?
- Should `obstacle` ever be accepted for `obstruction`, or should the current strict rejection stand?
- Should `danger` ever be accepted for `hazard`, or should `hazard` stay strict in this branch?
- Should `keep a listening watch` remain accepted alongside `keep listening watch`?
- Should compact `readback` remain accepted for `read back`?
- Should `wind warning` remain rejected for `weather warning`?
- Should `reduced visibility` remain rejected with `poor visibility` for strict `restricted visibility`?
- Confirm that Pan-Pan and Mayday remain reject-only examples in Batch 004.

## Matcher And Policy Risks

No matcher, API, UI, policy, regression, deploy, router, auth, registry, Nav Desk, or Watch Officer changes were made.

Risks to route to Director-Engineer after Linguist review:

- ordinary English `security` must not normalize to `Securite`;
- distress and urgency signals must not become accepted variants for safety-information items;
- numeric-token protection: `16/12`, `1400/1500`, `090/90`, `2 cables/2 nautical miles`;
- branch boundary protection: safety information versus urgency/distress;
- term boundary protection: `warning`, `advice`, `information`;
- weather and navigation warning separation;
- strict visibility phrase handling: `restricted visibility` versus ordinary `poor/reduced visibility`;
- local handling for `UTC`, `Zulu`, and `Z` rather than broad global aliases.

## Scope Confirmation

Forbidden files were not changed:

- `starter.json`
- `accepted-answer-dictionary.md`
- `accept-reject-qa-pairs.json`
- `answer-policy.md`
- `role-command-protocol.md`
- matcher/API/UI files
- deploy, router, auth, registry, Nav Desk, Watch Officer
- private config, SMTP, cookies, login codes, player identity, or secrets

## Verification

Local validation performed:

- JSON parse: PASS.
- Exactly `40` items: PASS.
- Type mix `6 / 10 / 24`: PASS.
- Level mix `8 / 24 / 8`: PASS.
- Branch is `safety_securite` for every item: PASS.
- Every item has `branch` and `module`: PASS.
- Every item has required fields and non-empty `accepted_answers`: PASS.
- Every item has QA notes with `should_accept`, `should_reject`, and `dangerous_minimal_pairs`: PASS.
- Batch validator command: PASS.
- `git diff --check` for the allowed Batch 004 files: PASS.

## Director-Engineer Handoff

Batch 004 is ready for Sea Speak Linguist review only. It should not be merged
into `starter.json` until the risky accepted variants, dangerous minimal pairs,
and matcher/policy risks above are accepted or revised.
