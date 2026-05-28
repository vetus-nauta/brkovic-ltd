# Batch 001 Linguist Risk Review

Task label: 2026-05-27
Prepared: 2026-05-26

Scope: `content/captain-ether/batches/batch-001-radio-procedure.json`.

## Decisions

### Risky Accepted Variants

| Area | Decision | Reason |
|---|---|---|
| `info` for `information` marker | Reject | Marker drill trains formal `information`; `info` is informal shorthand and weakens marker discipline. |
| `stand by for one minute` | Accept item-local | Same instruction and same time value as `stand by one minute`. |
| `read it back` | Accept item-local | Safe for the generic readback command; still reject `say again` and `repeat`. |
| `do not reply` | Accept item-local | Same prohibition as `do not answer`; still separate from `stand by`, `wait`, and `go ahead`. |
| shortened `loud and clear` | Accept item-local | Standard shortened readability report; must not collapse into `roger`, `affirmative`, or `I hear you`. |
| `go/change to channel one two` | Accept item-local | Follows starter channel-change policy; channel digits remain strict. |

### Strictness

| Area | Decision | Reason |
|---|---|---|
| `figures` / `numbers` | Strict | Accept `figures`; reject `numbers` and `digits` for the procedure-word drill. |
| `decimal` / `point` | Strict | Accept `decimal`; reject `point`, `dot`, and `comma` for the radio form drill. |
| `niner` / `nine` | Strict | Accept `niner`; reject ordinary `nine` for the radio-pronunciation drill. |
| `Alfa` / `Alpha` | Strict | Accept official ICAO/IMO `Alfa`; reject ordinary spelling `Alpha`. |

### Marker Drills

Confirmed: phrase marker drills must reject plain forms without the required
marker.

- `Question, are you underway?` accepts forms with `Question`; rejects `are you underway`.
- `Request read back.` accepts forms with `Request`; rejects plain `read back` and `please read back`.
- `Answer, affirmative.` accepts forms with `Answer`; rejects plain `affirmative`.
- `Answer, negative.` accepts forms with `Answer`; rejects plain `negative`.

### Procedure Boundaries

Confirmed: keep these concepts separate.

- `wait` is not `stand by` and not `wait out`.
- `stand by` is not `wait` and not `switch`.
- `wait out` is not `wait`, `out`, or `stand by`.
- `do not answer` is not `stand by`, `wait`, or `go ahead`.
- `resume communication` is not `go ahead`, `continue`, or `answer now`.
- `go ahead` remains the permission-to-transmit phrase, not a movement/channel-change substitute outside channel-change items.

### Station Calls

Confirmed: batch station-call policy matches starter policy. Called station stays
first. `Aurora to Marina Control` must remain wrong for
`Marina Control, Aurora calling.`

## Dangerous Pairs

Confirmed dangerous pairs for batch regression:

- `over / out`;
- `say again / repeat`;
- `roger / affirmative / correct`;
- `affirmative / negative`;
- `read back / say again`;
- `channel 12 / channel 13 / channel 16`;
- `1500 / 1400`;
- `Alfa / Alpha`.

## Matcher Findings

Current matcher behavior found during this review:

| Item | Answer | Observed | Expected | Reason |
|---|---|---|---|---|
| `word_core_advice_marker_001` | `advise` | accepted as `spelling` | wrong | `advice` is the marker noun; `advise` is a verb and should not pass in marker drills. |

Existing risky checks remain important:

- alphanumeric time tokens must not fuzz-match, e.g. `1400Z` versus `1500Z`;
- safety signal `Securite/Sécurité` must not accept ordinary English `security`.

## Content Changes Applied

- Removed `info` from `word_core_information_marker_001.accepted_answers`.
- Moved `info` into `word_core_information_marker_001.qa_notes.should_reject`.
- Replaced unresolved `confirm` notes with explicit Sea Speak decisions.
- Added `channel 13` to switch-channel reject coverage for the `channel 12 / 13 / 16` pair.
- Added plain-marker rejects for `Answer, affirmative.` and `Answer, negative.`
- Updated `answer-policy.md` with batch-001 strictness decisions.

## Engineer Notes

The content decision is now strict enough for batch QA. The only newly observed
matcher leak is `advise` passing as a spelling match for `advice`. Suggested
technical guard: marker nouns should not accept verb forms through typo matching,
or `advice/advise` should be treated as a protected minimal pair.
