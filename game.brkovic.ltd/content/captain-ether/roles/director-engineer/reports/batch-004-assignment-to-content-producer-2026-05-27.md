# Technical Card: Batch 004 Assignment To Content Producer

Status: ASSIGNED  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether

## Decision

Captain Ether proceeds with the next content-growth batch:

```text
Batch 004: safety / Securite warnings
```

This follows Batch 003 production-smoke acceptance and Game Director `TASK-0066`
approval. Captain Ether can continue content growth while Watch Officer remains
outside this role lane.

## Assigned Role

Content Producer / Captain Ether.

Task:

```text
content/captain-ether/roles/content-producer/tasks/batch-004-safety-securite-warnings-2026-05-27.md
```

Brief:

```text
content/captain-ether/batch-004-safety-securite-warnings-brief.md
```

Target batch:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Expected report:

```text
content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md
```

## Scope

Content draft only.

Content Producer may create or update only:

- `content/captain-ether/batches/batch-004-safety-securite-warnings.json`;
- `content/captain-ether/roles/content-producer/reports/batch-004-safety-securite-warnings-card-2026-05-27.md`.

## Batch Shape

- Branch: `safety_securite`.
- Target items: `40`.
- Type mix: `6` word, `10` short_expression, `24` phrase.
- Level mix: `8` beginner, `24` intermediate, `8` advanced.
- Modules:
  - `safety_signal`;
  - `navigation_warning`;
  - `weather_sea_state`;
  - `restricted_visibility`;
  - `hazard_reporting`;
  - `safety_readback`.

## Guardrails

Batch 004 is safety-information only.

Do not include:

- Pan-Pan expansion;
- Mayday expansion;
- SAR relay;
- abandon ship;
- fire;
- flooding;
- collision damage;
- man overboard;
- medical assistance;
- urgency or distress requests;
- legal-status phrases;
- heavy VTS/port-control instructions;
- CPA/TCPA or collision-avoidance intentions;
- ordinary English `security` as a substitute for `Securite` or `Sécurité`.

## Validation

Content Producer must run:

```text
php content/captain-ether/tools/validate-captain-ether.php --batch=content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

## Current Captain Ether State

Batch 001, Batch 002, and Batch 003 are live/playable and production-smoke
accepted.

Current local corpus:

- `190` playable items;
- `88` grammar patterns;
- `2` scenarios;
- `190` QA regression entries;
- `532` should-accept examples;
- `586` should-reject examples;
- `37` dangerous minimal-pair groups.

## Next Step

Wait for Content Producer report. If PASS, route Batch 004 to Sea Speak
Linguist before any engineering/QA/merge work.
