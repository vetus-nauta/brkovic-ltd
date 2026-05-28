# Content Producer Readiness Card: Batch 005

Date: 2026-05-27
Role: Content Producer / Captain Ether
Mode: report-only

## Task Result

PASS as a readiness recommendation.

No batch JSON was drafted. No runtime, API, UI, playable content, matcher,
router, registry, auth/platform, deploy, production config, Watch Officer, Nav
Desk, Game Director, or secret/private files were edited.

## Recommended Next Batch Concept

Recommend Batch 005 as a small urgency batch:

```text
Batch 005: Urgency / Pan-Pan Equipment And Assistance Basics
```

Reasoning:

- Batch 004 has established the `safety_securite` boundary and explicitly kept
  Pan-Pan and Mayday as reject-only examples.
- `urgency_panpan` is the next branch in the current role handoff.
- The roadmap recommends `25` items for emergency, distress, or legal-status
  content, so Batch 005 should be smaller than the normal `50` item batches.
- The batch should train urgency without entering distress, SAR, or legal-status
  complexity too early.

## Target Branch And Modules

Recommended branch:

```text
urgency_panpan
```

Recommended future batch file, if Director-Engineer assigns drafting later:

```text
content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

Recommended modules:

| Module | Count | Purpose |
| --- | ---: | --- |
| `urgency_signal` | 4 | Pan-Pan signal, urgency message label, repeated signal form |
| `equipment_failure` | 5 | Engine failure, steering failure, disabled vessel, reduced manoeuvrability wording |
| `medical_assistance` | 4 | Requesting medical assistance without declaring distress |
| `towing_assistance` | 3 | Request towing/towage assistance without implying rescue |
| `position_and_intentions` | 5 | Urgency position, intention, destination, and ETA fragments |
| `urgency_readback` | 4 | Read back / received urgency message / stand by on channel |

## Item Count Split

Recommended total: `25` items.

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

This keeps Pan-Pan mostly advanced while still introducing a few controlled
recognition terms before phrase production.

## Risky Variants To Prepare For Linguist Review

Potential item-local accepted variants to review, not approve automatically:

- `Pan-Pan`, `Pan Pan`, and capitalization/punctuation variants.
- Three-times signal form: `Pan-Pan Pan-Pan Pan-Pan` versus shorter one-signal
  training prompts.
- `urgency message` versus `urgency call`.
- `engine failure` versus `engine trouble` or `engine problem`.
- `steering failure` versus `rudder failure`.
- `disabled vessel` versus `vessel disabled`.
- `request towing assistance` versus `request tow` or `need a tow`.
- `medical assistance` versus `medical advice`.
- `require assistance` versus `request assistance`.
- `not under command` as a possible legal-status phrase, if it appears at all;
  recommended default is reject-only until a dedicated legal-status module.
- `stand by on channel 16` versus `keep listening watch on channel 16`.
- UTC/Zulu/Z exact time variants, only when the exact time value is preserved.

## Must-Stay-Wrong Categories

Batch 005 should include explicit `should_reject` and dangerous-pair coverage
for these categories:

- Safety signal substituted for urgency: `Securite`, `Sécurité`, `security`.
- Distress signal substituted for urgency: `Mayday`, `mayday mayday mayday`.
- Ordinary English `pan pan` meanings or incomplete signal forms where the item
  requires the formal repeated signal.
- `distress`, `safety`, and `urgency` message categories crossing into each
  other.
- `medical advice` substituted for `medical assistance`, unless Sea Speak
  Linguist approves a specific item-local variant.
- `engine failure`, `steering failure`, `power failure`, and `fuel shortage`
  substituted for each other.
- `disabled vessel` substituted with legal-status phrases such as `not under
  command` or `restricted manoeuvrability`.
- `towing assistance`, `rescue`, and `SAR` substituted for each other.
- `stand by`, `keep listening watch`, `wait out`, `do not answer`, and `go
  ahead` collapsed into one procedure concept.
- Wrong channel, time, position, heading, ETA, distance, or vessel condition.
- Mayday-level distress facts: flooding, fire, sinking, man overboard, abandon
  ship, collision damage with grave and imminent danger.

## Dangerous Minimal Pairs To Seed

Recommended dangerous-pair groups:

- `Pan-Pan / Securite / Mayday`
- `urgency / safety / distress`
- `Pan-Pan / ordinary pan pan / incomplete urgency signal`
- `engine failure / steering failure / power failure / fuel shortage`
- `disabled vessel / not under command / restricted manoeuvrability`
- `medical assistance / medical advice / distress medical emergency`
- `towing assistance / rescue / SAR`
- `request assistance / require assistance / need help`
- `stand by / keep listening watch / wait out / go ahead`
- exact channels, times, positions, headings, ETAs, distances, and directions

## Open Questions For Sea Speak Linguist

- Should `Pan Pan` without hyphen be accepted wherever `Pan-Pan` appears?
- Should a one-time `Pan-Pan` answer be accepted for items that train the formal
  three-times urgency signal, or should three repetitions be required?
- Should `urgency call` be accepted for `urgency message`, or should the batch
  train one phrase strictly?
- Should `engine trouble` or `engine problem` be accepted for `engine failure`,
  or should `failure` remain strict?
- Should `rudder failure` be accepted for `steering failure`?
- Should `medical advice` stay wrong for `medical assistance` in this batch?
- Should `request tow` be accepted for `request towing assistance`, or is it too
  informal for the target register?
- Should `disabled vessel` accept `vessel disabled`, and should legal-status
  phrases stay reject-only?
- Should UTC/Zulu/Z time variants follow the same item-local rule approved in
  Batches 003 and 004?
- Should any Mayday-adjacent facts appear as reject examples only, or should
  they be fully reserved for Batch 006 Distress / Mayday?

## Director-Engineer Handoff

Recommended next assignment: Content Producer may draft Batch 005 only after a
separate Director-Engineer task explicitly allows the batch JSON file.

Suggested drafting target:

```text
content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

Until then, this card is report-only readiness guidance.

## Scope Confirmation

Changed file:

- `content/captain-ether/roles/content-producer/reports/office-background-batch-005-readiness-2026-05-27.md`

Forbidden files and areas were not changed:

- runtime/API/UI/content data
- `starter.json`
- batch JSON files
- matcher
- router and registry
- auth/platform
- Watch Officer
- Nav Desk
- Game Director docs
- production config
- deploy/FTP
- secrets, private config, login codes, cookies, sessions, CSRF, SMTP, player
  email, or player identity data

## Verification

Documentation-only task. No tests were run.
