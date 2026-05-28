# Sea Speak Linguist Report: Batch 005 Urgency / Pan-Pan Risk Review

Date: 2026-05-27
Role: Sea Speak Linguist / Captain Ether
Task ID: TASK-CE-PROD-005-LING-0001
Mode: linguistic review with content-side patch allowed for assigned batch only

## Task Result

PASS for linguistic/content review.

Batch 005 is fit to route to Director-Engineer gate after a narrow
content-side patch. The batch remains an urgency/Pan-Pan draft only. It should
not be merged into `starter.json` until Director-Engineer acceptance,
validator/regression handling, and QA gate.

## Changed Files

- `content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-005-urgency-panpan-risk-review-2026-05-27.md`

No matcher/API/UI, starter, regression, policy, router/registry, auth/platform,
Watch Officer, Nav Desk, Game Director docs, production config, deploy/FTP, or
secret/private files were edited.

## Counts After Review

Total items: `25`.

By type:

| Type | Count |
| --- | ---: |
| `word` | 4 |
| `short_expression` | 7 |
| `phrase` | 14 |

By level:

| Level | Count |
| --- | ---: |
| `beginner` | 4 |
| `intermediate` | 9 |
| `advanced` | 12 |

By branch:

| Branch | Count |
| --- | ---: |
| `urgency_panpan` | 25 |

By module:

| Module | Count |
| --- | ---: |
| `urgency_signal` | 4 |
| `equipment_failure` | 5 |
| `medical_assistance` | 4 |
| `towing_assistance` | 3 |
| `position_and_intentions` | 5 |
| `urgency_readback` | 4 |

Supporting structures:

- grammar patterns: `0`
- top-level dangerous minimal-pair groups: `8`
- accepted-answer entries after review: `47`

## Content-Side Patch

The batch was lightly expanded with item-local variants that preserve Sea Speak
meaning:

- Added `Request tow` and `Require tow` to
  `phrase_urgency_request_towing_assistance_001`.
- Added matching should-accept examples for `request tow` and `require tow`.
- Kept `request tow` wrong for the short expression
  `expr_urgency_towing_assistance_001`, because that item trains the noun
  phrase `towing assistance`, not a request.
- Added `ETA harbour 1400 Zulu` and `ETA harbour one four zero zero Zulu` to
  `phrase_urgency_eta_harbour_1400_001`.
- Added matching should-accept examples and dangerous-pair must-accept coverage
  for the Zulu time form.
- Updated producer notes from proposed variants to reviewed item-local
  decisions.

No unsafe accepted answers were found that required removal.

## Accepted Answer Decisions

Approved item-local variants:

- `Pan-Pan` and `Pan Pan` for the urgency signal.
- Exactly repeated urgency signal forms:
  `Pan-Pan Pan-Pan Pan-Pan` and `Pan Pan Pan Pan Pan Pan`.
- `request assistance` / `require assistance` only in selected assistance
  phrases.
- `Request tow` / `Require tow` only for the request-towing-assistance phrase.
- `Disabled vessel` / `Vessel disabled` word order variants for basic disabled
  vessel items.
- `keep a listening watch` alongside `keep listening watch`.
- `readback` compact spelling for `read back` in the Pan-Pan readback item.
- `channel one six` only where the exact channel remains channel `16`.
- `1400 UTC`, `1400Z`, `1400 Zulu`, `one four zero zero UTC`, and `one four
  zero zero Zulu` only for the exact ETA `1400` item.
- Numeric `2` for written `two` in the exact position phrase.

Rejected or not approved:

- `panpan` as a no-space/no-hyphen signal form is not added in this review.
  The batch already accepts speech-like `Pan Pan`; tighter spelling is safer
  for signal-family regression.
- `urgency call` remains wrong for `urgency message`.
- `engine problem` and `engine trouble` remain wrong for `engine failure`.
- `rudder failure` remains wrong for `steering failure` until a specific item
  trains it.
- `medical advice` remains wrong for `medical assistance`.
- Broad `help`, `emergency`, `rescue`, `evacuation`, `tug assistance`, and
  `pilot` remain wrong in this batch.

## Must-Stay-Wrong Examples

The following categories must remain wrong for Batch 005:

- Safety or distress signals in urgency items: `Securite`, `Mayday`, repeated
  Securite, and repeated Mayday.
- Branch/category substitutions: `safety`, `distress`, `safety message`,
  `distress message`, and generic `emergency`.
- Changed failure type: `steering failure`, `engine failure`, `power failure`,
  `engine problem`, and `rudder failure` must stay item-specific.
- Changed vessel state: `adrift`, `aground`, `distressed`, `not under command`,
  and `restricted in ability to manoeuvre`.
- Changed assistance type: `medical advice`, `evacuation`, `rescue assistance`,
  `tug assistance`, and `pilot`.
- Changed procedure: `stand by`, `keep listening watch`, `go ahead`, `wait
  out`, `read back`, and `say again` must remain item-specific.
- Changed report object or action: `position` / `destination`, `proceeding` /
  `requesting`, `reduced power` / `without power`.
- Changed exact values: channel `16` / `12`, `1400` / `1500`, harbour /
  marina, north / south, east / west, nautical miles / cables, one person / two
  persons.

## Dangerous Minimal-Pair Decisions

| Pair | Decision |
| --- | --- |
| `Pan-Pan / Securite / Mayday` | Accept only the Pan-Pan forms listed for Pan-Pan items; safety and distress signals stay wrong. |
| `urgency / safety / distress` | Keep branch category strict. Generic `emergency` is not a replacement for urgency. |
| `engine failure / steering failure / power failure` | Keep failure type item-specific. Do not accept broad `engine problem`. |
| `disabled vessel / not under command / restricted manoeuvrability` | Basic disabled-vessel wording is accepted; COLREG legal-status phrases stay wrong. |
| `medical assistance / medical advice / evacuation` | Medical assistance is not medical advice, evacuation, or distress medical emergency. |
| `towing assistance / rescue / tug assistance` | `Request tow` is safe only in the request-towing item; rescue, tug, and pilot remain wrong. |
| `stand by / keep listening watch / go ahead` | These are different procedure actions and must not collapse. |
| exact channels, times, positions, directions, distances, and counts | No fuzzing or semantic substitution for numbers, units, directions, destination, report object, or person count. |

## Matcher / Runtime Findings For Director-Engineer

No matcher/API/UI change is requested by the Sea Speak review.

Director-Engineer should still protect these regression boundaries when the
batch is integrated:

- `Pan-Pan` must not accept `Securite`, `security`, or `Mayday`.
- The repeated-signal item must reject one-time `Pan-Pan`.
- `Pan Pan` is accepted item-locally; no-space `panpan` is not approved here.
- `request tow` is accepted only for the request-towing-assistance phrase, not
  for the short expression `towing assistance`.
- `1400Z` and `1400 Zulu` are accepted only where the exact ETA remains `1400`
  and the destination remains `harbour`.
- Numeric, direction, unit, channel, destination, and person-count tokens must
  keep the existing no-fuzz posture.

## Open Questions

None for Sea Speak content after the patch.

Future branches may add separate items for `rudder failure`, `medical advice`,
`tow required`, `not under command`, `restricted in ability to manoeuvre`, SAR,
evacuation, rescue, tug assistance, and Mayday distress. They should not be
accepted silently in this batch.

## Verification Performed

Commands run:

```sh
jq empty content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
jq '. as $root | {items:($root.items|length), grammar_patterns:($root.grammar_patterns|length), dangerous_pairs:($root.dangerous_minimal_pairs|length), accepted_answers:([$root.items[] | .accepted_answers | length] | add)}' content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
grep -nE "Request tow|Require tow|1400 Zulu|one four zero zero Zulu|Reviewed item-local" content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

Results:

- JSON parse check passed.
- Summary check returned `25` items, `0` grammar patterns, `8` dangerous-pair
  groups, and `47` accepted-answer entries.
- Targeted content check confirmed the reviewed local variants are present.

No runtime validator, matcher regression, API test, UI test, or production
check was run; this was a linguistic review only.

## Copy-Ready Engineer Handoff

Batch 005 Sea Speak review is PASS with a narrow content-side patch. Approved
local expansions are `request/require tow` for the request-towing-assistance
phrase and `1400 Zulu` / spoken Zulu forms for the exact ETA `1400` item.

Keep Pan-Pan, Securite, and Mayday separate. Keep urgency, safety, and distress
separate. Keep failure type, assistance type, procedure word, channel, time,
direction, unit, destination, report object, and person count strict.

No matcher/API/UI/policy change is requested by Linguist. Next expected gate is
Director-Engineer validation/integration decision, then QA regression if the
batch is accepted for merge.
