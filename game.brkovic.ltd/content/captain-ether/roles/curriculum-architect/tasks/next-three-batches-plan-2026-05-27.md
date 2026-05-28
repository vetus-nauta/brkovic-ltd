# Curriculum Architect Task: Next Three Captain Ether Batches

Date: 2026-05-27

## Role

Curriculum Architect / Captain Ether.

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Mandatory First Read

Before work, read:

```text
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/curriculum-architect/rules.md
content/captain-ether/roles/curriculum-architect/handoff.md
content/captain-ether/content-growth-roadmap-1000.md
content/captain-ether/branch-taxonomy.md
content/captain-ether/answer-policy.md
content/captain-ether/starter.json
```

Also read the Batch 001 closure context:

```text
content/captain-ether/engineer-report-batch-001-merge-2026-05-27.md
content/captain-ether/qa-batch-001-production-smoke-2026-05-27.md
```

## Functional Duty

Plan the next three Captain Ether content batches.

Curriculum Architect does not write items, accepted answers, matcher logic, UI,
API, deploy scripts, or production content.

## Mode

Report-only.

## Allowed Files

If a file is needed, create or update only:

```text
content/captain-ether/roles/curriculum-architect/reports/next-three-batches-plan-2026-05-27.md
```

## Forbidden Files

Do not edit:

```text
content/captain-ether/starter.json
content/captain-ether/accept-reject-qa-pairs.json
content/captain-ether/batches/
content/captain-ether/answer-policy.md
public/api/captain-ether/
public/assets/
```

Do not touch router, registry, Nav Desk, Watch Officer, auth/platform files,
deploy state, private config, `.netrc`, SMTP, or secrets.

## Current Baseline

Captain Ether currently has:

- `90` playable items;
- `39` grammar patterns;
- `15` dangerous minimal-pair groups;
- short watches: beginner `12`, intermediate `16`, advanced `20`;
- progressive order: `word -> short_expression -> phrase`;
- Batch 001 live and production-smoke accepted.

## Exact Task

Propose the next three content batches after Batch 001.

The plan must include:

1. Batch IDs and human names.
2. Branch and modules for each batch.
3. Target item count for each batch.
4. Suggested type mix:
   - words;
   - short expressions;
   - phrases;
   - scenario turns if appropriate.
5. Suggested level mix:
   - beginner;
   - intermediate;
   - advanced.
6. Pedagogical progression:
   - how each batch grows from words to longer expressions;
   - how fatigue is controlled;
   - what should stay out of early batches.
7. Dangerous minimal-pair risks to ask Sea Speak Linguist to review.
8. Task recommendation:
   - which batch should Content Producer draft next;
   - why that batch is first.

## Planning Constraints

- The `1000+` target is a long-term corpus goal, not one big advanced level.
- Do not jump straight into heavy distress/MAYDAY material unless the plan
  explains prerequisites.
- Keep watches short and calm.
- Preserve Sea Speak safety distinctions.
- Avoid broad synonym plans that could create matcher leaks.
- Prefer practical yacht/radio usefulness for the next player-visible growth.

## Expected Output

Return:

- PASS-style planning report;
- recommended Batch 002, Batch 003, Batch 004;
- suggested Content Producer assignment for Batch 002;
- risks for Sea Speak Linguist;
- QA implications;
- confirmation that the task was report-only and forbidden files were not changed.
