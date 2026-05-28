# Batch 001 Brief: Core Radio Procedure

Date: 2026-05-26

## Task

Create the first growth batch for Captain Ether.

Target file:

```text
content/captain-ether/batches/batch-001-radio-procedure.json
```

Target count:

```text
about 50 items
```

Do not merge directly into `starter.json`.

Content Producer scope is narrow:

- create or update only the assigned batch JSON;
- do not edit `starter.json`;
- do not edit `answer-policy.md`;
- do not edit matcher/API/UI files;
- do not deploy.

If a policy or matcher issue appears, report it to the Director-Engineer.

## Branch

```text
core_radio
```

Suggested modules:

- `procedure_words`
- `station_calls`
- `message_markers`
- `acknowledgement`
- `repetition_clarification`
- `readback_correction`
- `spelling_numbers`
- `opening_closing`

## Content Mix

Approximate mix:

- `15` word items;
- `15` short_expression items;
- `20` phrase items.

Level mix:

- beginner: `25`
- intermediate: `18`
- advanced: `7`

## Required Content Areas

Include items around:

- over / out;
- roger / affirmative / negative;
- say again;
- stand by;
- read back;
- correction;
- wrong / correct;
- message markers such as question, answer, information, warning, instruction, advice, request, intention;
- how do you read me;
- I read you loud and clear;
- spell / I spell;
- figures / numbers;
- switch channel;
- this is / calling;
- wait / do not answer / resume communication where appropriate.

## Quality Rules

Each item must include:

- stable `id`;
- `type`;
- `level`;
- `difficulty_score`;
- `topic`;
- `branch`;
- `module`;
- `source_language`;
- `source_text`;
- `target_language`;
- `target_text`;
- `accepted_answers`;
- hints.

Each risky item should also have QA notes:

- should-accept examples;
- should-reject examples;
- dangerous minimal pair, if applicable.

## Important Guardrails

Do not collapse Sea Speak distinctions:

- `over` is not `out`;
- `roger` is not `affirmative`;
- `say again` is not `repeat`;
- `negative` is not ordinary free-form `no`;
- message markers must keep their operational meaning.

Minor spelling and punctuation can be accepted, but changed radio meaning must stay wrong.

## Output

The content producer should return:

- the batch JSON;
- a short list of new dangerous minimal pairs;
- notes for Sea Speak Linguist review;
- anything that may require matcher changes;
- confirmation that forbidden files were not changed.
