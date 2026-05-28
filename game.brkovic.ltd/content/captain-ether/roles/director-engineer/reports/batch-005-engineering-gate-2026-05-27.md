# Batch 005 Engineering Gate

Date: 2026-05-27
Role: Director-Engineer / Captain Ether
Batch: `batch-005-urgency-panpan-equipment-assistance-basics`

## Status

PASS FOR QA ACCEPTANCE.

Batch 005 may move to QA acceptance review. This gate does not approve merge
into `starter.json`, production deploy, runtime/API/UI changes, matcher changes,
router/registry, auth/platform, Watch Officer, Nav Desk, Game Director docs, or
production config changes.

## Inputs Reviewed

- `content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json`
- `content/captain-ether/roles/content-producer/reports/batch-005-urgency-panpan-equipment-assistance-card-2026-05-27.md`
- `content/captain-ether/roles/sea-speak-linguist/reports/batch-005-urgency-panpan-risk-review-2026-05-27.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/branch-taxonomy.md`

## Gate Findings

Content Producer completed the draft. Sea Speak Linguist reviewed it and made a
narrow content-side patch. The batch remains a draft and is not merged.

Counts after review:

| Check | Result |
| --- | ---: |
| Total items | `25` |
| Words | `4` |
| Short expressions | `7` |
| Phrases | `14` |
| Beginner | `4` |
| Intermediate | `9` |
| Advanced | `12` |
| Branch | `urgency_panpan` |
| Unique item IDs | PASS |
| Required item fields present | PASS |
| `qa_notes.should_accept` present | PASS |
| `qa_notes.should_reject` present | PASS |

## Linguist Decisions Accepted

Accepted as item-local only:

- `Pan-Pan` and `Pan Pan`;
- formal repeated Pan-Pan signal forms;
- `request assistance` / `require assistance` in selected assistance phrases;
- `Request tow` / `Require tow` only for the request-towing-assistance phrase;
- `Disabled vessel` / `Vessel disabled`;
- `keep a listening watch`;
- compact `readback` in the readback item;
- exact channel `16` variants;
- exact ETA `1400` variants including UTC, Z, and Zulu forms;
- numeric `2` only where it preserves exact `two`.

Rejected boundaries remain strict:

- `Pan-Pan / Securite / Mayday`;
- `urgency / safety / distress`;
- `engine failure / steering failure / power failure`;
- `disabled vessel / not under command / restricted manoeuvrability`;
- `medical assistance / medical advice / evacuation`;
- `towing assistance / rescue / tug assistance`;
- `stand by / keep listening watch / go ahead`;
- exact channels, times, positions, directions, distances, and counts.

## Implementation Decision

No matcher/API/UI/policy change is requested at this gate.

No merge is approved yet. The next step is QA acceptance against the batch draft.
If QA passes, Director-Engineer can decide whether to merge Batch 005 into
`starter.json` and update regression.

## Checks Run

```sh
jq empty content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

Result: PASS.

```sh
jq '{batch_id,status,branch,item_count:(.items|length), by_type:(.items|group_by(.type)|map({type:.[0].type,count:length})), by_level:(.items|group_by(.level)|map({level:.[0].level,count:length})), missing_required:([.items[] | select((.id|not) or (.type|not) or (.level|not) or (.branch|not) or (.module|not) or (.target_text|not) or (.accepted_answers|not) or (.qa_notes|not)) | .id] | length), missing_qa_accept:([.items[] | select(.qa_notes.should_accept|not) | .id] | length), missing_qa_reject:([.items[] | select(.qa_notes.should_reject|not) | .id] | length), ids_unique:((.items|map(.id)|unique|length)==(.items|length))}' content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

Result: PASS.

```sh
jq -r '.items[] | [.id,.type,.level,.branch,.module,(.accepted_answers|length),(.qa_notes.should_accept|length),(.qa_notes.should_reject|length)] | @tsv' content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
```

Result: `25` rows checked, `0` bad rows.

PHP validator was not run in this shell because `php` is not available on
`PATH`. This is not a content blocker for QA acceptance, but the validator must
be run later in an environment with PHP before merge/deploy decisions.

## QA Acceptance Focus

QA should verify:

- all `qa_notes.should_accept` examples pass by policy expectation;
- all `qa_notes.should_reject` examples remain wrong by policy expectation;
- dangerous minimal pairs remain protected;
- `Pan-Pan`, `Securite`, and `Mayday` do not collapse;
- `urgency`, `safety`, and `distress` do not collapse;
- numeric/time/channel/direction/unit/person-count values remain exact;
- item-local variants do not imply global matcher expansion.

## Scope Preserved

- `starter.json` not changed.
- Matcher/API/runtime not changed.
- UI not changed.
- Router/registry not changed.
- Auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- Production config and deploy/FTP not touched.
- Secrets, cookies, sessions, CSRF, player email, and player identity not
  touched or printed.

## Copy-Ready QA Task Handoff

```text
Batch 005 Engineering Gate: PASS FOR QA ACCEPTANCE.
Review:
content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json
content/captain-ether/roles/content-producer/reports/batch-005-urgency-panpan-equipment-assistance-card-2026-05-27.md
content/captain-ether/roles/sea-speak-linguist/reports/batch-005-urgency-panpan-risk-review-2026-05-27.md

Focus:
Pan-Pan / Securite / Mayday, urgency / safety / distress, failure type,
assistance type, procedure words, exact channel/time/position/direction/unit/
person-count values, and item-local accepted variants.

No merge, deploy, runtime/API/UI, matcher, router/registry, auth/platform,
Watch Officer, Nav Desk, Game Director docs, production config, or secrets are
approved.
```
