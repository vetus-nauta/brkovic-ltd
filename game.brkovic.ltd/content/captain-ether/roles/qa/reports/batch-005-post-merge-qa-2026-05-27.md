# Batch 005 Post-Merge QA

Date: 2026-05-27
Task: TASK-CE-POST-MERGE-QA-BATCH-005-0001
Role: QA / Captain Ether
Mode: Report-only, local file-structure QA only

## Result

PASS WITH DEPLOY BLOCKER.

Local merged content structure for Batch 005 matches the Director-Engineer
merge report from repository files. No content, runtime, API, UI, matcher,
router, registry, auth, platform, deploy, or production files were edited.

The remaining blocker is environment-only: PHP is not available on `PATH` in
this shell, so the Captain Ether PHP validator could not be run. This blocks a
deploy or production smoke decision, but is not a content-structure failure.

## Files Reviewed

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/batch-005-urgency-panpan-equipment-assistance-basics.json`
- `content/captain-ether/roles/director-engineer/reports/batch-005-merge-2026-05-27.md`

## Checks Performed

### JSON Structure

PASS.

- `starter.json`: valid JSON by `jq empty`.
- `accept-reject-qa-pairs.json`: valid JSON by `jq empty`.
- Batch 005 file: valid JSON by `jq empty`.

### Starter Counts

PASS.

Observed from `starter.json`:

| Metric | Count |
| --- | ---: |
| Items | `255` |
| Grammar patterns | `112` |
| Scenarios | `2` |
| Duplicate item IDs | `0` |
| Playable items with `qa_notes` | `0` |

This matches the merge report.

### Type Counts

PASS.

| Type | Count |
| --- | ---: |
| `word` | `50` |
| `short_expression` | `69` |
| `phrase` | `136` |

### Level Counts

PASS.

| Level | Count |
| --- | ---: |
| `beginner` | `88` |
| `intermediate` | `118` |
| `advanced` | `49` |

### Branch Counts

PASS.

| Branch | Count |
| --- | ---: |
| unbranched legacy starter | `40` |
| `core_radio` | `50` |
| `marina_harbour` | `50` |
| `navigation_reports` | `50` |
| `safety_securite` | `40` |
| `urgency_panpan` | `25` |

### Batch 005 Item Presence

PASS.

Batch file state:

- Batch ID: `batch-005-urgency-panpan-equipment-assistance-basics`
- Status: `merged`
- Branch: `urgency_panpan`
- Items: `25`
- Dangerous minimal-pair groups: `8`

ID comparison results:

- Batch 005 IDs missing from `starter.json`: `0`
- Batch 005 IDs present in `starter.json`: `25`
- Batch 005 IDs missing from `accept-reject-qa-pairs.json`: `0`
- Batch 005 QA entries present in `accept-reject-qa-pairs.json`: `25`

### Batch 005 Type And Level Mix

PASS.

Batch 005 type counts:

| Type | Count |
| --- | ---: |
| `word` | `4` |
| `short_expression` | `7` |
| `phrase` | `14` |

Batch 005 level counts:

| Level | Count |
| --- | ---: |
| `beginner` | `4` |
| `intermediate` | `9` |
| `advanced` | `12` |

### QA Regression Entries

PASS.

Observed from `accept-reject-qa-pairs.json`:

| Metric | Count |
| --- | ---: |
| QA item entries | `255` |
| Should-accept examples | `710` |
| Should-reject examples | `784` |
| Dangerous minimal-pair groups | `57` |
| Duplicate QA item IDs | `0` |

Batch 005 ID-scoped regression entries:

- Batch 005 QA item entries: `25`
- Batch 005 should-accept examples: `79`
- Batch 005 should-reject examples: `75`
- Batch 005 QA items missing `should_accept`: `0`
- Batch 005 QA items missing `should_reject`: `0`

### Dangerous Minimal-Pair Groups

PASS.

The last `8` dangerous minimal-pair groups in
`accept-reject-qa-pairs.json` match the Batch 005 dangerous-pair set:

- `Pan-Pan / Securite / Mayday`
- `urgency / safety / distress`
- `engine failure / steering failure / power failure`
- `disabled vessel / not under command / restricted manoeuvrability`
- `medical assistance / medical advice / evacuation`
- `towing assistance / rescue / tug assistance`
- `stand by / keep listening watch / go ahead`
- `exact channels, times, positions, directions, distances, and counts`

These groups are also present in the Batch 005 source file, and the Batch 005
source reports `8` dangerous minimal-pair groups.

## Remaining Blockers

### BLOCKER FOR DEPLOY: PHP Validator Unavailable

Severity: High for deploy gate, not a content-structure failure.

Reproduction:

```sh
command -v php
```

Observed:

- Exit code: `1`
- Output: no path returned

Expected before deploy:

```sh
php content/captain-ether/tools/validate-captain-ether.php
```

Owner route: Director-Engineer.

## Scope Preserved

- Runtime/API/UI not touched.
- Content data, `starter.json`, batches, matcher, router/registry not edited.
- Auth/platform not touched.
- Watch Officer, Nav Desk, and Game Director docs not touched.
- Production config and deploy/FTP not touched.
- Secrets, cookies, sessions, CSRF, player email, and player identity not read,
  printed, or changed.

## QA Handoff

Local content-structure QA passes for Batch 005 post-merge. The next gate is
Director-Engineer PHP validation in an environment where PHP is available, or a
Director-Engineer decision to assign QA smoke after validator completion.
