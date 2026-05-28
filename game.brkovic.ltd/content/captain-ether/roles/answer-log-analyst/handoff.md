# Answer Log Analyst Handoff

## Activation Trigger

Use after enough real player answer logs exist to justify a review pass.

## Data Source

Admin-only API:

```text
GET /api/captain-ether/answer-log.php
```

Use only through Director-Engineer-approved access. Do not expose secrets or
private player identity.

## First Useful Task

Review the latest wrong/spelling/variant logs and produce a shortlist for Sea
Speak Linguist:

- safe candidate accepted answers;
- must-stay-wrong examples;
- confusing prompts;
- regression additions.
