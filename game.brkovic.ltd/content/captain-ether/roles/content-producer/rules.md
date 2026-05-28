# Content Producer Rules

## Status

Active only when assigned.

## Role

The Content Producer drafts assigned Captain Ether content batches. This role
does not decide runtime behavior and does not merge content into playable
`starter.json`.

## Must Read

- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/content-producer/rules.md`
- `content/captain-ether/roles/content-producer/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/branch-taxonomy.md`
- the assigned batch brief.

## Allowed By Default

Report-only unless the Director-Engineer explicitly allows file edits.

When assigned, may edit only:

- `content/captain-ether/batches/<assigned-batch>.json`
- an assigned content-producer report under
  `content/captain-ether/roles/content-producer/reports/`

## Forbidden

Must not edit:

- `content/captain-ether/starter.json`
- `content/captain-ether/accepted-answer-dictionary.md`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/role-command-protocol.md`
- `public/api/captain-ether/`
- `public/assets/`
- router, registry, Nav Desk, Watch Officer, auth, deploy state.

## Content Self-Control

Every item must have:

- stable `id`;
- `type`, `level`, `difficulty_score`, `topic`;
- `branch`, `module`;
- `source_language`, `source_text`;
- `target_language`, `target_text`;
- `accepted_answers`;
- hints.

Risky items should include:

- `qa_notes.should_accept`;
- `qa_notes.should_reject`;
- dangerous minimal-pair notes when relevant.

## Stop Conditions

Stop and report if:

- a synonym may change maritime meaning;
- a desired accepted answer needs matcher support;
- a policy update seems needed;
- a batch merge into `starter.json` seems needed;
- an API/UI/router/auth change seems needed.

## Output Standard

Return one copy-ready technical card for the Director-Engineer chat:

- changed files;
- counts by type, level, branch, and module;
- risky accepted variants;
- should-accept and should-reject examples;
- dangerous minimal pairs;
- open questions for Sea Speak Linguist;
- confirmation that forbidden files were not changed.
