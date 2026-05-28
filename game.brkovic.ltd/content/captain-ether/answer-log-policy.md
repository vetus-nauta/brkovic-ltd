# Captain Ether Answer Log Policy

Date: 2026-05-26

## Purpose

The answer log exists to collect real disputed player answers for future Sea Speak review.

It is not a full activity tracker. Clean canonical answers are skipped.

## Logged Cases

Captain Ether logs only answers that can teach us something:

- `wrong`
- `skip`
- `hint`
- `spelling`
- `variant`
- `accepted_variant`

Examples:

- a wrong answer that may reveal a missing accepted phrase;
- a spelling answer that may reveal a common typo;
- an accepted non-canonical phrase that may deserve dictionary review;
- a hint/skip answer that may indicate unclear prompt wording.

## Stored Fields

Each log entry stores:

- `observed_at`
- `source` (`watch` or `lost_oar`)
- `player_hash`
- `watch_id`
- `question_index`
- `level`
- `item_id`
- `item_type`
- `topic`
- `prompt`
- `answer`
- `normalized_answer`
- `target_text`
- `normalized_target`
- `correct`
- `reason`
- `match_type`
- `log_kind`
- `used_hint`
- `skipped`

The log uses a short hash of the local user id. It does not store player email.

## Storage

Runtime storage key:

```text
captain_answer_logs
```

The runtime file is:

```text
storage/captain_answer_logs.json
```

The log keeps the latest `1000` entries.

## Admin Read Endpoint

Admin-only endpoint:

```text
GET /api/captain-ether/answer-log.php
```

Optional filters:

```text
?limit=100
?kind=wrong
?item_id=phrase_eta_001
```

The endpoint is for Captain Ether QA and Sea Speak review. It must not be exposed as a public player feature.

The endpoint returns two layers:

- `entries`: latest raw disputed-answer entries for admin diagnostics;
- `review_groups`: compact groups by `item_id` for Director-Engineer,
  Answer Log Analyst, and Sea Speak Linguist review.

`review_groups` deliberately omits `player_hash` and player identity. It keeps
only the item, prompt, standard form, counts, top observed answers, matcher
types, and review flags.

Review flags:

- `possible_missing_variant`: wrong answers may need Sea Speak review;
- `prompt_or_hint_friction`: skips or hint use may indicate unclear prompt or hint;
- `accepted_variant_review`: accepted non-canonical forms may need dictionary notes;
- `common_spelling_review`: repeated spelling forms may need regression;
- `repeated_pattern`: the same item has multiple logged events.

## Workflow

1. Collect real entries from the admin endpoint.
2. Group by `item_id` and `log_kind`.
3. Send disputed examples to the Sea Speak linguist.
4. Add accepted variants only when maritime meaning remains exact.
5. Add reject cases to `accept-reject-qa-pairs.json` whenever a new dangerous pair appears.
