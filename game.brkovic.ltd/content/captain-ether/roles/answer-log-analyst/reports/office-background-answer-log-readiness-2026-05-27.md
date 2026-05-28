# Answer Log Analysis Readiness Card

Task: `TASK-CE-OFFICE-ALA-0001`  
Role: Answer Log Analyst  
Date: 2026-05-27  
Mode: Report-only  
Result: PASS

## Scope Confirmation

This card defines how a future answer-log review can be performed safely.

No production answer logs were accessed. No local answer-log data was accessed.
No runtime/API/UI/content data was edited. No player identity was reviewed or
exposed.

Changed file:

- `content/captain-ether/roles/answer-log-analyst/reports/office-background-answer-log-readiness-2026-05-27.md`

## Safe Data To Review Later

A future Director-Engineer-approved review may use only Captain Ether
disputed-answer data needed for QA and Sea Speak review.

Preferred source:

- admin-only `review_groups` from `GET /api/captain-ether/answer-log.php`

Raw `entries` should be used only when the compact groups are insufficient for
diagnosing a disputed answer. The analyst should avoid raw data by default
because `review_groups` already omits player identity fields.

Safe review fields:

- `item_id`
- `item_type`
- `level`
- `topic`
- `prompt`
- `target_text`
- `normalized_target`
- observed answer text, only as needed for linguistic review
- normalized observed answer
- `correct`
- `reason`
- `match_type`
- `log_kind`
- aggregate counts
- top observed answers
- review flags such as `possible_missing_variant`,
  `prompt_or_hint_friction`, `accepted_variant_review`,
  `common_spelling_review`, and `repeated_pattern`

Useful log kinds:

- `wrong`
- `skip`
- `hint`
- `spelling`
- `variant`
- `accepted_variant`

Canonical exact answers are not expected in the answer log and do not need
analysis.

## Grouping Method

Primary grouping:

1. Group by `item_id`.
2. Within each item, group by `log_kind`.
3. Within each log kind, group by normalized observed answer.
4. Compare each group against `target_text`, accepted meaning, and known
   dangerous minimal pairs.

Each finding should be labelled with one likely cause:

- typo
- safe variant candidate
- unsafe variant
- confusing prompt
- player misunderstanding
- hint/skip friction
- matcher or regression concern

Recommended priority order:

1. Repeated wrong answers for the same `item_id`.
2. Accepted variants that may need dictionary or regression notes.
3. Repeated spelling forms that are safe but should stay conservative.
4. Hint/skip clusters suggesting unclear prompt wording.
5. Single unusual wrong answers, only when they reveal a dangerous minimal pair.

## Privacy Red Lines

Do not include player identity in reports, handoffs, screenshots, test logs, or
chat replies.

Forbidden data:

- player email
- name or profile identity
- login codes
- cookies
- sessions
- CSRF values
- SMTP details
- `.netrc`
- private config contents
- API keys, tokens, passwords, or FTP credentials
- full raw answer-log dumps
- `player_hash` in role reports unless Director-Engineer explicitly approves a
  narrow diagnostic need

The analyst report should use aggregate counts and item-level examples only.
When examples are needed, quote only the disputed answer text and its item
context. Do not combine answer text with any player identifier.

## Acceptance Safety Rules

The Answer Log Analyst does not decide accepted-answer changes.

Safe candidate variants may be proposed only when the answer appears to preserve
the exact maritime meaning. Any uncertainty goes to Sea Speak Linguist.

Do not recommend acceptance when the observed answer changes or weakens:

- port/starboard direction
- ahead/astern/abeam/alongside relation
- channel number
- time, ETA, heading, distance, or bearing
- distress, urgency, or safety marker
- procedure word boundary such as `over`, `out`, `roger`, `affirmative`,
  `negative`, `say again`, `repeat`, `read back`, or `stand by`
- trained term boundaries such as `berth`, `line`, `fender`, `decimal`,
  `figures`, `niner`, or `Alfa`

Unsafe wrong answers should be handed off as possible regression additions, not
as candidate accepted variants.

## Likely Sea Speak Linguist Handoff

A future analysis report should give Sea Speak Linguist a compact review queue:

- item id
- prompt
- target text
- observed answer candidate
- count or frequency signal
- current match type/log kind
- analyst label: safe candidate, unsafe wrong answer, prompt friction, or
  spelling review
- reason the answer may or may not preserve maritime meaning
- known dangerous pair, if applicable

Copy-ready handoff format:

```text
For Sea Speak Linguist review:
- Item: <item_id>
- Prompt: <prompt>
- Target: <target_text>
- Observed: <answer>
- Pattern: <count/log_kind/match_type>
- Analyst route: <safe candidate | must-stay-wrong | prompt friction | spelling review>
- Risk: <dangerous pair or semantic concern>
- Requested decision: accept variant, reject and add regression, revise prompt, or no action
```

Sea Speak Linguist decides Sea Speak meaning. Director-Engineer decides whether
accepted-answer, regression, matcher, or content changes are implemented.

## QA Checks For Accepted-Variant Changes

Any accepted-variant change that comes from answer-log analysis should receive
QA before Director-Engineer acceptance.

Required checks:

- The new `should_accept` example passes for the intended item.
- Existing `should_reject` examples still fail.
- Dangerous minimal pairs for the same concept still fail.
- Numeric tokens, channel numbers, headings, ETA digits, distances, and bearings
  remain exact.
- Short nautical terms are not accepted through unsafe typo fuzzing.
- The accepted answer feedback still shows a useful standard form when needed.
- Lost Oars behavior does not create a review item for a newly accepted correct
  answer.
- No player identity fields appear in UI, API review groups, reports, logs
  copied into reports, or chat output.
- If the change affects runtime matching, the full accept/reject regression must
  be run by the appropriate owner.

Suggested QA owner route:

- Sea Speak Linguist: meaning decision.
- Director-Engineer: content/runtime/regression implementation decision.
- QA: regression and privacy verification.

## Open Risks

- Real logs may include answer text that is personal or sensitive even when no
  identity field is stored. Future reports should quote only what is necessary
  for Sea Speak review.
- Repeated wrong answers can indicate either a missing safe variant or a prompt
  teaching problem. The analyst should avoid treating frequency alone as proof
  that a variant should be accepted.
- Accepted variants can create future matcher risk if they overlap with
  dangerous pairs. Every accepted-variant proposal needs explicit reject-side
  coverage.

## Copy-Ready Director-Engineer Handoff

Readiness card complete. Future answer-log analysis can safely start from
admin `review_groups`, grouped by `item_id`, `log_kind`, normalized observed
answer, and likely cause. Reports must avoid player identity and should route
all accepted-answer decisions to Sea Speak Linguist before Director-Engineer
implementation and QA regression.
