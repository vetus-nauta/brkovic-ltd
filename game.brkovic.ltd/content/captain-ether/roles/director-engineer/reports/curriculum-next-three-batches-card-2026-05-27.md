# Technical Card: Curriculum Architect Next Three Batches

Status: PASS  
Date: 2026-05-27  
For: Director-Engineer / chief chat  
Source role: Curriculum Architect / Captain Ether

## Main Report

Full report is fixed in the Curriculum Architect role folder:

```text
content/captain-ether/roles/curriculum-architect/reports/next-three-batches-plan-2026-05-27.md
```

## Core Technical Data

Current baseline after Batch 001:

- playable items: `90`;
- grammar patterns: `39`;
- dangerous minimal-pair groups: `15`;
- watch lengths: beginner `12`, intermediate `16`, advanced `20`;
- watch order: `word -> short_expression -> phrase`;
- Batch 001 status: live PASS, production-smoke accepted.

Recommended next batches:

| Batch | Human name | Branch | Target | Type mix | Level mix |
| --- | --- | --- | ---: | --- | --- |
| `batch-002-marina-harbour-basics` | Marina / Harbour Arrival Basics | `marina_harbour` | `50` | `10` words, `14` short expressions, `26` phrases | `18` beginner, `27` intermediate, `5` advanced |
| `batch-003-navigation-reports-basics` | Navigation Reports: Position, Course, Speed, ETA | `navigation_reports` | `50` | `8` words, `12` short expressions, `30` phrases | `12` beginner, `30` intermediate, `8` advanced |
| `batch-004-safety-securite-warnings` | Safety / Securite: Weather And Navigation Warnings | `safety_securite` | `40` | `6` words, `10` short expressions, `24` phrases | `8` beginner, `24` intermediate, `8` advanced |

Expected growth after all three batches pass QA and merge:

- `+140` items;
- from `90` to about `230` playable items.

## First Assignment

Give Content Producer Batch 002 first:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

Why first:

- turns Batch 001 core radio procedure into practical yacht use;
- covers calm, common player-visible tasks: arrival, berth, fuel, water, shore power, mooring, departure;
- avoids early distress, Pan-Pan, Mayday, SAR, fire, flooding, collision damage, medical assistance, and man overboard expansion.

## Key Risks To Route

Sea Speak Linguist:

- Batch 002: `berth/birth`, `berth/dock/quay/pier/slip`, `line/rope`, `port side to/starboard side to`, `stand by/wait out/go ahead`.
- Batch 003: `heading/course/bearing`, `1400/1500`, `090/90`, `knots/nautical miles/cables`, `decimal/point/dot`, `say again/read back`.
- Batch 004: `Securite/security`, `safety/urgency/distress`, `Securite/Pan-Pan/Mayday`, `warning/advice/information`, `advice/advise`.

QA:

- validate IDs and required schema fields;
- confirm every new item has `branch` and `module`;
- confirm targets and `should_accept` pass;
- confirm `should_reject` stays wrong;
- add dangerous minimal-pair groups before merge;
- run full starter regression after merge;
- smoke beginner/intermediate/advanced watch selection;
- confirm watch lengths and progressive order;
- confirm player payload does not expose `target_text`, `accepted_answers`, or `qa_notes`.

## Scope Confirmation

This card is a summary only. The full curriculum report is in the Curriculum
Architect role folder linked above.

No playable content, matcher, API, UI, batch JSON, QA regression file,
production deploy state, secrets, or answer policy were changed by the
curriculum planning task.
