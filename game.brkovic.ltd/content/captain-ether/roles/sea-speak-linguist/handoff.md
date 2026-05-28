# Sea Speak Linguist Handoff

## Activation

Use only after Director-Engineer names a batch, item list, or answer-log set.

## Current State

Batch 001 has already received a risk review. The known `advice` / `advise`
runtime leak was accepted by engineering and fixed in matcher.

## Closed Assignment

```text
content/captain-ether/roles/sea-speak-linguist/tasks/batch-002-marina-harbour-risk-review-2026-05-27.md
```

Target batch:

```text
content/captain-ether/batches/batch-002-marina-harbour-basics.json
```

Report:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-002-marina-harbour-risk-review-2026-05-27.md
```

Mode:

```text
linguistic review with content-side patch allowed for assigned batch only
```

Result:

```text
PASS; matcher risks accepted and fixed by Director-Engineer
```

## Previous Closed Assignment

```text
content/captain-ether/roles/sea-speak-linguist/tasks/batch-003-navigation-reports-risk-review-2026-05-27.md
```

Target batch:

```text
content/captain-ether/batches/batch-003-navigation-reports-basics.json
```

Report:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-003-navigation-reports-risk-review-2026-05-27.md
```

Mode:

```text
linguistic review with content-side patch allowed for assigned batch only
```

Focus:

- navigation term boundaries: `heading / course / bearing`;
- report-object boundaries: `position / destination / waypoint / reporting point`;
- numeric boundaries: `090 / 90`, ETA times, spoken-digit forms;
- unit boundaries: `knots / nautical miles / cables`;
- decimal wording: `decimal / point / dot`;
- radio workflow boundary: `say again / read back`.

Result:

```text
PASS; no matcher/API change requested; routed to QA acceptance by Director-Engineer
```

## Last Closed Assignment

```text
content/captain-ether/roles/sea-speak-linguist/tasks/batch-004-safety-securite-risk-review-2026-05-27.md
```

Target batch:

```text
content/captain-ether/batches/batch-004-safety-securite-warnings.json
```

Report:

```text
content/captain-ether/roles/sea-speak-linguist/reports/batch-004-safety-securite-risk-review-2026-05-27.md
```

Mode:

```text
linguistic review with content-side patch allowed for assigned batch only
```

Focus:

- safety signal boundary: `Securite / Sécurité / security`;
- signal family boundary: `Securite / Pan-Pan / Mayday`;
- branch boundary: `safety / urgency / distress`;
- message boundary: `warning / advice / information`;
- visibility boundary: `restricted visibility / poor visibility / visibility good`;
- hazard boundary: `hazard / obstruction / danger`;
- workflow boundary: `read back / say again`;
- exact channels, times, bearings, distances, directions, and units.

Result:

```text
PASS; no matcher/API/policy change requested; routed to QA acceptance by Director-Engineer
```

## Current Assignment

None.

## Next Valid Work

Possible next assignments:

- review disputed real player answers from answer logs;
- review a specific minimal-pair risk.

Do not broaden synonyms globally unless Director-Engineer asks for a policy
proposal.

## Report Shape

Return one copy-ready technical card:

- approved accepted answers;
- must-stay-wrong answers;
- dangerous minimal pairs;
- matcher risks;
- engineer handoff.
