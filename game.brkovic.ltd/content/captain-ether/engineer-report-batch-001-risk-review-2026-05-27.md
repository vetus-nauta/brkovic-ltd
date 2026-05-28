# Engineer Report: Batch 001 Risk Review

Chat: Sea Speak Linguist / Captain Ether

Date: 2026-05-27

## Summary

Completed Sea Speak risk review for:

```text
content/captain-ether/batches/batch-001-radio-procedure.json
```

The pass focused on risky accepted variants, strictness around spelling and
number procedure words, marker drills, procedure-word boundaries, station-call
policy, and dangerous minimal pairs.

## Changed Files

- `content/captain-ether/batches/batch-001-radio-procedure.json`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/batch-001-linguist-risk-review-2026-05-27.md`

## Risky Accepted Variant Decisions

| Variant | Decision | Notes |
|---|---|---|
| `info` for marker `information` | Reject | Removed from `accepted_answers`; added to `should_reject`. Marker drill trains formal `information`. |
| `stand by for one minute` | Accept item-local | Same standby instruction and same time value. |
| `read it back` | Accept item-local | Safe for generic readback command. Still reject `say again` and `repeat`. |
| `do not reply` | Accept item-local | Same prohibition as `do not answer`. Still separate from `stand by`, `wait`, and `go ahead`. |
| shortened `loud and clear` | Accept item-local | Safe shortened readability report. Do not collapse into `roger`, `affirmative`, or `I hear you`. |
| `go/change to channel one two` | Accept item-local | Follows starter channel-change policy. Channel digits remain strict. |

## Strictness Decisions

- `figures` is strict: reject `numbers`, `digits`.
- `decimal` is strict: reject `point`, `dot`, `comma`.
- `niner` is strict: reject ordinary `nine`.
- `Alfa` is strict: reject ordinary spelling `Alpha`.

## Marker Drill Policy

Confirmed: phrase marker drills must reject plain forms without the required
marker.

- `Question, are you underway?` rejects plain `are you underway`.
- `Request read back.` rejects plain `read back` and `please read back`.
- `Answer, affirmative.` rejects plain `affirmative`.
- `Answer, negative.` rejects plain `negative`.

## Procedure Boundaries

Confirmed: keep these procedure concepts separate.

- `wait`
- `stand by`
- `wait out`
- `do not answer`
- `resume communication`
- `go ahead`

These should not be treated as free synonyms for each other.

## Station-Call Policy

Confirmed: batch follows starter station-call policy.

- Called station remains first.
- `Aurora to Marina Control` remains wrong.

## Dangerous Minimal Pairs

Confirmed and kept as regression-critical:

- `over / out`
- `say again / repeat`
- `roger / affirmative / correct`
- `affirmative / negative`
- `read back / say again`
- `channel 12 / channel 13 / channel 16`
- `1500 / 1400`
- `Alfa / Alpha`

## Verification

Validated JSON:

- `content/captain-ether/batches/batch-001-radio-procedure.json`
- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`

Matcher QA results:

- Batch QA accept examples: `147` pass.
- Batch QA reject examples: `150` checked, with `1` known matcher leak.
- Dangerous minimal pairs: `15` must-accept and `25` must-reject checks pass.

Requested spot checks:

- `info` -> wrong.
- `stand by for one minute` -> correct.
- `read it back` -> correct.
- `do not reply` -> correct.
- `loud and clear` -> correct.
- `go to channel one two` -> correct.
- `change to channel one two` -> correct.
- `numbers` for `figures` -> wrong.
- `point` for `decimal` -> wrong.
- `nine` for `niner` -> wrong.
- `Alpha` for `Alfa` -> wrong.
- plain marker forms without `Question`, `Request`, or `Answer` -> wrong.
- `Aurora to Marina Control` -> wrong.
- channel `13` / `16` for channel `12` item -> wrong.
- `1400Z` for `1500` correction item -> wrong.

## Current Matcher Finding

One matcher leak remains for engineering review:

| Item | Answer | Observed | Expected | Reason |
|---|---|---|---|---|
| `word_core_advice_marker_001` | `advise` | accepted as `spelling` | wrong | `advice` is the message-marker noun; `advise` is a verb and should not pass in marker drills. |

Suggested guard:

- protect `advice / advise` as a minimal pair; or
- disable typo acceptance for marker nouns where a one-letter change creates
  another valid English word or form.

Related existing matcher risks remain important:

- alphanumeric time tokens must not fuzz-match, for example `1400Z` versus `1500Z`;
- `Securite/Sécurité` must not accept ordinary English `security`.
