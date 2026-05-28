# TASK-CE-0013 Duplicate Normalization Warning Triage

Date: 2026-05-27
Role: Captain Ether Sea Speak Linguist
Mode: report-only linguistic triage

## Result

PASS for linguistic triage.

Current validator PASS still reports 9 non-blocking
`Duplicate accepted_answers after normalization` warnings. All 9 are harmless
at runtime because each warning is caused by punctuation, hyphenation, or comma
variants that collapse to the same normalized answer. None of the 9 warnings
requires widening Sea Speak meaning.

Recommended cleanup is content-side deduplication of `accepted_answers` only,
with explicit regression examples retained or added in
`accept-reject-qa-pairs.json` for safety-signal, procedure-marker, and
readback boundaries.

No content JSON, matcher, API, UI, router, auth, deploy, production config, or
Game Director file was edited.

## Validator Source

Command used:

```bash
$HOME/.local/php-codex/bin/php content/captain-ether/tools/validate-captain-ether.php
```

Summary:

```text
PASS
WARN (9)
```

The default `php` binary is not available in this shell, so the existing local
Codex PHP CLI was used.

## Warning Triage

| Item | Duplicate normalized answer | Why it duplicates | Linguistic risk | Recommendation |
| --- | --- | --- | --- | --- |
| `phrase_pan_pan_001` | `pan pan pan pan pan pan` | `pan pan pan pan pan pan` and `pan-pan pan-pan pan-pan` both normalize hyphens to spaces. | Low runtime risk, high signal-boundary importance. `Pan-Pan` must not collapse with `Mayday` or `Securite`, and one/two repetitions must stay wrong. | Remove one duplicate accepted answer. Keep explicit should-accept regression for hyphenless and compact player forms; keep rejects for two calls, `Mayday`, and `Securite`. |
| `phrase_core_radio_check_over_001` | `radio check over` | `radio check over` and `radio check, over` normalize comma away. | Harmless duplicate, but `over / out` is dangerous. | Remove the punctuation-only duplicate from `accepted_answers`. Keep regression for `radio check over`; keep rejects for `radio check out` and `radio check over and out`. |
| `phrase_core_correction_channel_one_three_001` | `correction channel one three` | `correction channel one three` and `correction, channel one three` normalize comma away. | Harmless duplicate. Numeric/channel boundary is meaningful: channel 13 must not become channel 12. | Remove the punctuation-only duplicate. Keep `correction channel 13` because it is a different safe numeric form. Keep regression for channel 13 acceptance and channel 12 rejection. |
| `phrase_core_question_underway_001` | `question are you underway` | `question are you underway` and `question, are you underway` normalize comma away. | Harmless duplicate. Message marker is meaningful: `Question` must not become `Answer` or `Request`. | Remove the punctuation-only duplicate. Keep `question are you under way` because it is a lexical spacing variant. Keep marker-boundary rejects. |
| `phrase_core_answer_affirmative_001` | `answer affirmative` | `answer affirmative` and `answer, affirmative` normalize comma away. | Harmless duplicate. Marker plus acknowledgement boundary is dangerous: `affirmative`, `negative`, `roger`, and `correct` must not collapse. | Remove the punctuation-only duplicate. Keep `answer is affirmative`. Keep explicit regression for `answer affirmative`; keep rejects for bare `affirmative`, `answer yes`, and `answer negative`. |
| `phrase_core_answer_negative_001` | `answer negative` | `answer negative` and `answer, negative` normalize comma away. | Harmless duplicate. Opposite-answer boundary is dangerous: `negative` must not become `affirmative`. | Remove the punctuation-only duplicate. Keep `answer is negative`. Keep explicit regression for `answer negative`; keep rejects for bare `negative`, `answer no`, and `answer affirmative`. |
| `expr_urgency_panpan_001` | `pan pan` | `Pan-Pan` and `Pan Pan` normalize hyphen to space. | Harmless duplicate, but this is a protected urgency signal. Must not accept `Mayday`, `Securite`, or `security`. | Remove one duplicate accepted answer, preferably keep canonical `Pan-Pan`. Keep explicit regression for `Pan-Pan`, `pan pan`, and case-insensitive form. |
| `phrase_urgency_panpan_three_times_001` | `pan pan pan pan pan pan` | `Pan-Pan Pan-Pan Pan-Pan` and `Pan Pan Pan Pan Pan Pan` normalize hyphens to spaces. | Harmless duplicate, high repetition-boundary importance. One `Pan-Pan`, safety signal, and distress signal must stay wrong. | Remove one duplicate accepted answer, preferably keep canonical hyphenated form. Keep explicit regression for hyphenless six-token form and uppercase form; keep rejects for one call, `Securite`, and `Mayday`. |
| `phrase_urgency_read_back_details_001` | `read back pan pan details` | `Read back Pan-Pan details` and `Read back Pan Pan details` normalize hyphen to space. | Harmless duplicate. `Read back` must not become `Say again`, and `Pan-Pan` must not become `Mayday` or `Securite`. | Remove the hyphenless duplicate from `accepted_answers`. Keep `Readback Pan-Pan details` because normalized text differs and compact matching is player-friendly. Keep explicit regression for readback and signal substitutions. |

## Harmless vs Cleanup Decision

All warnings are harmless for current gameplay because duplicate normalization
does not create a new accepted meaning. The matcher already treats the duplicate
strings as the same exact normalized answer.

The duplicates should still be removed because repeated normalized accepted
answers make future linguistic review noisier and can hide a real duplicate
where two different-looking phrases unintentionally collapse into a dangerous
meaning.

No warning should be solved by broad matcher aliases. This is a content hygiene
cleanup, not a runtime behavior change.

## Regression Recommendations

Keep or add explicit regression cases for these player-friendly forms:

- `Pan-Pan` signal forms with hyphens, spaces, capitalization changes, and the
  current compact `panpan panpan panpan` case where already covered.
- comma-free procedure phrases such as `radio check over`,
  `correction channel one three`, `question are you underway`,
  `answer affirmative`, and `answer negative`.
- `Readback Pan-Pan details` as a player-friendly compact procedure spelling,
  while preserving the `read back / say again` boundary.

Keep dangerous-pair rejects around the cleanup:

- `Pan-Pan / Mayday / Securite`;
- one, two, and three repetitions of protected signals;
- `over / out / over and out`;
- `Question / Answer / Request` message markers;
- `affirmative / negative / roger / correct`;
- `channel one three / channel one two`;
- `read back / say again`;
- `Pan-Pan details / Mayday details / Securite details`.

## Best Practice

Accepted answers should stay precise and minimal: store one canonical spelling
per normalized form, plus genuinely different safe variants that preserve the
same Sea Speak meaning. Player-friendly punctuation, capitalization, hyphen, and
spacing behavior should be protected by regression cases and by the conservative
normalizer, not by repeated duplicate entries in `accepted_answers`.

This keeps the game forgiving for real learners while keeping dangerous
maritime pairs visible and reviewable.

## Localization Impact

Learner source language in the affected items is Russian. Sea Speak target
language is English. No player-facing UI copy or translated Sea Speak meaning
was changed. The cleanup recommendation must not localize or translate the
English Sea Speak target phrases.

## Copy-ready Engineer Handoff

TASK-CE-0013 linguistic triage result: PASS.

Safe content-side cleanup: deduplicate the 9 listed `accepted_answers` entries
by keeping one accepted answer per normalized form. Do not change matcher/API.
Keep explicit QA regression coverage for the removed punctuation/hyphen/spacing
forms and all listed dangerous rejects. This is low-risk if done as a content
hygiene patch followed by the full Captain Ether validator.

## Checks Performed

- Read mandatory Game Director chat rules and Captain Ether role protocol.
- Read Sea Speak Linguist rules and handoff.
- Read answer policy, accepted-answer dictionary, regression QA pairs, and
  starter content.
- Ran current validator with local PHP CLI: PASS with 9 duplicate-normalization
  warnings.
- Parsed the 9 affected starter items and QA pairs read-only with Node.
- Report-only scope preserved.
