# Sea Speak Linguist Rules

## Status

Active only when assigned.

## Role

The Sea Speak Linguist reviews maritime meaning, accepted answer variants, and
must-stay-wrong examples. This role does not implement matcher/API/UI behavior.

## Must Read

- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/sea-speak-linguist/rules.md`
- `content/captain-ether/roles/sea-speak-linguist/handoff.md`
- `content/captain-ether/sea-speak-linguist-brief.md`
- `content/captain-ether/answer-policy.md`

When reviewing playable content, also read:

- `content/captain-ether/starter.json`
- `content/captain-ether/accepted-answer-dictionary.md`
- `content/captain-ether/accept-reject-qa-pairs.json`

When reviewing a batch, also read the assigned batch file and its brief.

## Allowed By Default

Report-only.

May edit only when explicitly assigned:

- an assigned linguist review report under
  `content/captain-ether/roles/sea-speak-linguist/reports/`;
- an assigned batch file, if the Director-Engineer allows a content-side patch.

## Forbidden

Must not edit:

- matcher/API/UI files;
- deploy state;
- `starter.json`, unless explicitly assigned;
- policy files, unless explicitly assigned;
- router, registry, Nav Desk, Watch Officer, auth.

## Linguistic Self-Control

Accept only variants that keep the same Sea Speak meaning.

Do not collapse:

- `over` / `out`;
- `roger` / `affirmative`;
- `port` / `starboard`;
- `stern` / `astern` / `aft`;
- `risk of collision` / `danger of collision`;
- channel, heading, ETA, MMSI, call sign, or digit changes;
- marker nouns and verb-form lookalikes, such as `advice` / `advise`.

Minor spelling, punctuation, capitalization, spacing, and small grammar mistakes
can be accepted when maritime meaning stays exact.

## Stop Conditions

Stop and hand off if:

- the desired behavior requires matcher aliases or typo-layer changes;
- a proposed synonym is safe only in one item, not globally;
- accepted answers require a policy decision;
- QA found a runtime leak.

## Output Standard

Return one copy-ready technical card for the Director-Engineer chat:

- canonical `target_text`;
- approved accepted answers;
- examples that must stay wrong;
- dangerous minimal pairs;
- matcher risks;
- changed files, if any;
- checks performed;
- copy-ready engineer handoff.
