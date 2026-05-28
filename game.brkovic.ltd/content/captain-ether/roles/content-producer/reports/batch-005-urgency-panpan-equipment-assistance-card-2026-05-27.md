# Content Producer Card: Batch 005 Urgency / Pan-Pan Equipment And Assistance Basics

Date: 2026-05-27
Role: Content Producer / Captain Ether
Task ID: TASK-CE-PROD-005-CP-0001
Mode: content draft only

## Task Result

PASS.

Drafted Batch 005 for Sea Speak Linguist review:

```text
content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

No merge into `starter.json` was performed.

## Changed Files

- `content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json`
- `content/captain-ether/roles/content-producer/reports/batch-005-urgency-panpan-equipment-assistance-card-2026-05-27.md`

Forbidden files were not edited by this task.

## Counts

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

## Scope Boundary

Batch 005 is an urgency batch, not a safety or distress batch.

Included:

- Pan-Pan urgency signal;
- urgency message category;
- engine failure and steering failure;
- disabled vessel basics;
- medical assistance without evacuation or distress declaration;
- towing assistance without rescue or SAR framing;
- position, ETA, channel, direction, distance, and person-count precision;
- urgency readback, stand-by, and listening-watch phrases.

Excluded from playable target content:

- Securite safety broadcasts;
- Mayday distress declarations;
- SAR;
- rescue, evacuation, fire, flooding, sinking, man overboard, abandon ship;
- collision damage with grave and imminent danger;
- legal-status phrases such as `not under command` and `restricted in ability to manoeuvre`;
- heavy VTS, port-control, tug dispatch, pilot service, or collision-avoidance intentions.

Mayday and Securite appear only in reject examples and dangerous minimal pairs.

## Risky Accepted Variants

Review these item-local accepted variants before integration:

- `Pan-Pan` and `Pan Pan` are accepted locally.
- `Pan-Pan Pan-Pan Pan-Pan` and six-token `Pan Pan Pan Pan Pan Pan` are accepted for the formal repeated-signal item.
- `request assistance` and `require assistance` are accepted in selected assistance phrases.
- `disabled vessel` and `vessel disabled` are accepted for one disabled-vessel phrase.
- `keep a listening watch` is accepted alongside `keep listening watch`.
- `readback` is accepted alongside `read back` in one readback item.
- `channel 16` and `channel one six` are accepted locally.
- `1400 UTC`, `1400Z`, and spoken `one four zero zero UTC` are accepted locally.

## Should-Accept Examples

Examples included in batch QA notes:

- `Pan-Pan`
- `Pan Pan`
- `Pan-Pan Pan-Pan Pan-Pan`
- `urgency message`
- `engine failure`
- `steering failure`
- `Engine failure request assistance`
- `Vessel disabled`
- `Request medical assistance`
- `Request towing assistance`
- `Position 2 nautical miles north of the marina`
- `ETA harbour 1400Z`
- `Stand by on channel one six`
- `Readback Pan-Pan details`

## Should-Reject Examples

Examples included in batch QA notes:

- `Mayday`
- `Securite`
- `safety message`
- `distress message`
- `emergency`
- `engine problem`
- `rudder failure`
- `power failure`
- `vessel not under command`
- `vessel restricted in ability to manoeuvre`
- `medical advice`
- `evacuation`
- `rescue assistance`
- `tug assistance`
- wrong channel, time, direction, distance, unit, destination, or person count, for example `channel 12`, `1500 UTC`, `south`, `two cables`, `marina`, and `two persons`.

## Dangerous Minimal Pairs

Top-level dangerous-pair groups prepared in the batch:

- `Pan-Pan / Securite / Mayday`
- `urgency / safety / distress`
- `engine failure / steering failure / power failure`
- `disabled vessel / not under command / restricted manoeuvrability`
- `medical assistance / medical advice / evacuation`
- `towing assistance / rescue / tug assistance`
- `stand by / keep listening watch / go ahead`
- exact channels, times, positions, directions, distances, and counts.

## Open Questions For Sea Speak Linguist

- Should `Pan Pan` without hyphen be accepted wherever `Pan-Pan` appears?
- Should the repeated-signal item require exactly three `Pan-Pan` groups, or should a one-time `Pan-Pan` ever pass?
- Should `urgency call` be accepted for `urgency message`, or should message/call stay strict?
- Should `engine problem` or `engine trouble` remain wrong for `engine failure`?
- Should `rudder failure` be accepted for `steering failure`, or kept as a separate equipment-failure item?
- Should `medical advice` stay wrong for `medical assistance` throughout this batch?
- Should `request tow` be accepted anywhere, or should `request towing assistance` stay the trained phrase?
- Should `disabled vessel` accept `vessel disabled` broadly, while legal-status phrases remain reject-only?
- Should UTC/Zulu/Z time variants follow the same item-local rule used in earlier batches?

## Matcher And Policy Risks

No matcher, API, UI, policy, regression, deploy, router, auth, registry, Nav Desk, Watch Officer, or Game Director doc changes were made.

Risks to route to Director-Engineer after Linguist review:

- signal-family protection: `Pan-Pan` must not accept `Securite` or `Mayday`;
- branch boundary protection: urgency versus safety versus distress;
- assistance category protection: towing, rescue, SAR, tug, pilot, medical assistance, medical advice, and evacuation;
- legal-status protection: disabled vessel versus `not under command` and `restricted in ability to manoeuvre`;
- failure-type protection: engine, steering, rudder, power, and fuel failures;
- numeric-token protection: channel `16/12`, time `1400/1500`, distance and unit, and person count;
- procedure-word protection: `stand by`, `keep listening watch`, `go ahead`, `read back`, and `say again`.

## Scope Confirmation

Forbidden files and areas were not changed:

- `starter.json`
- `accepted-answer-dictionary.md`
- `accept-reject-qa-pairs.json`
- `answer-policy.md`
- `role-command-protocol.md`
- matcher/API/UI files
- router and registry
- auth/platform
- Watch Officer
- Nav Desk
- Game Director docs
- production config
- deploy/FTP
- secrets, private config, login codes, cookies, sessions, CSRF, SMTP, player email, or player identity data

## Verification

Tests not run; content draft only.
