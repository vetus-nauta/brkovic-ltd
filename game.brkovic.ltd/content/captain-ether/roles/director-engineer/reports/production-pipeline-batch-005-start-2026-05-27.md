# Production Pipeline: Batch 005 Start Card

Date: 2026-05-27
Role: Director-Engineer / Captain Ether
Mode: production pipeline dispatch, local only

## Status

STARTED.

This starts the next Captain Ether content-production pipeline locally. It does
not approve merge into `starter.json`, runtime/API/UI changes, production
deploy, FTP, router/registry, auth/platform, Watch Officer, Nav Desk, Game
Director docs, or production config changes.

## Decision

Batch 005 starts as:

```text
Urgency / Pan-Pan Equipment And Assistance Basics
```

Target branch:

```text
urgency_panpan
```

Target draft file:

```text
content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

## Why This Batch

Content Producer recommended a focused `urgency_panpan` Batch 005 readiness
card. Sea Speak Linguist risk radar already defines the key Pan-Pan / Mayday /
Securite boundaries. This branch is safer to draft next than public branch UI,
production work, or matcher expansion.

Curriculum Architect also identified `traffic_collision` as a high-value
future branch. That remains a later Director decision, not this batch.

## Pipeline

1. Content Producer drafts Batch 005 JSON and report.
2. Sea Speak Linguist reviews the draft for meaning, variants, must-stay-wrong
   examples, and dangerous pairs.
3. Director-Engineer performs engineering gate and decides whether any content
   patch or regression update is needed.
4. QA performs acceptance review before any merge.
5. Director-Engineer may merge only after all gates pass.
6. Production deploy remains a separate Game Director decision.

## Scope

Allowed for the first task:

- `content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json`
- `content/captain-ether/roles/content-producer/reports/batch-005-urgency-panpan-equipment-assistance-card-2026-05-27.md`

Forbidden:

- `content/captain-ether/starter.json`
- matcher/API/runtime files
- UI files
- router/registry
- auth/platform
- Watch Officer
- Nav Desk
- Game Director docs
- production config
- deploy/FTP
- secrets, cookies, sessions, CSRF, player email, player identity

## Required Draft Shape

Target count: `25` items.

Recommended split:

| Type | Count |
| --- | ---: |
| `word` | 4 |
| `short_expression` | 7 |
| `phrase` | 14 |

Recommended level split:

| Level | Count |
| --- | ---: |
| `beginner` | 4 |
| `intermediate` | 9 |
| `advanced` | 12 |

The draft must include item-local `qa_notes.should_accept`,
`qa_notes.should_reject`, and dangerous minimal-pair notes for risky items.

## Required Boundaries

Batch 005 must keep these boundaries strict:

- `Pan-Pan / Securite / Mayday`
- `urgency / safety / distress`
- `engine failure / steering failure / power failure / fuel shortage`
- `disabled vessel / not under command / restricted manoeuvrability`
- `medical assistance / medical advice`
- `towing assistance / rescue / SAR`
- exact channel, time, position, heading, distance, bearing, unit, and direction

No broad synonym expansion is approved.

## Scope Preserved

- Runtime/API not changed.
- UI not changed.
- `starter.json` not changed.
- Matcher not changed.
- Router/registry not changed.
- Auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- Production config and deploy/FTP not touched.
- Secrets and player identity not touched.
