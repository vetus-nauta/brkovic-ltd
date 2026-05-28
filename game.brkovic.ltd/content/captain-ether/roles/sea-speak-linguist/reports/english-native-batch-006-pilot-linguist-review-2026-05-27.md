# Sea Speak Linguist Report: English-Native Batch 006 Pilot Review

Дата: 2026-05-27
Роль: Sea Speak Linguist / Captain Ether
Режим: report-only review

## Status

NEEDS DIRECTOR DECISION.

Лингвистического FAIL по draft нет: модель `natural English source prompt -> Sea Speak target`
соблюдена в основных блоках, и опасное расширение `accepted_answers` не
предложено.

Перед implementation нужен Director decision, потому что:

- English-native stream все еще требует утвержденной storage/schema модели;
- 5 embedded minimal-pair review items являются мета-инструкциями, а не
  естественными English-native source prompts первого пилота;
- несколько пунктов требуют точечной правки target/reject текста до передачи
  QA.

## Scope / Changed Files

Изменен только разрешенный файл:

- `content/captain-ether/roles/sea-speak-linguist/reports/english-native-batch-006-pilot-linguist-review-2026-05-27.md`

Не изменялись runtime/API/UI/content playable data, `starter.json`, batches,
matcher, router, registry, auth/platform, Watch Officer, Nav Desk, production
config, deploy/FTP, secrets, cookies, sessions, CSRF, player email или player
identity.

## Core Radio Review

Все 15 core_radio items можно оставить в первом pilot после Director approval.
Target texts лингвистически безопасны as drafted. Must-reject examples полезны
для QA, потому что закрывают `say again/repeat`, `roger/affirmative`,
`over/out`, `stand by/wait out`, channel changes и marker boundaries.

| Proposed ID | Review | Target text | Must-stay-wrong examples to keep |
| --- | --- | --- | --- |
| EN-B006-CORE-001 | approved as drafted | `Say again.` | `repeat`; `please repeat`; `what did you say` |
| EN-B006-CORE-002 | approved as drafted | `Say again your position.` | `repeat your position`; `say again my position`; `what is my position` |
| EN-B006-CORE-003 | approved as drafted | `Roger.` | `affirmative`; `yes`; `got it`; `copy` |
| EN-B006-CORE-004 | approved as drafted | `Affirmative.` | `yes`; `roger`; `correct`; `OK` |
| EN-B006-CORE-005 | approved as drafted | `Negative.` | `no`; `not roger`; `wrong`; `negative roger` |
| EN-B006-CORE-006 | approved as drafted | `Over.` | `out`; `over and out`; `go ahead`; `roger` |
| EN-B006-CORE-007 | approved as drafted | `Out.` | `over`; `over and out`; `finished`; `roger out` |
| EN-B006-CORE-008 | approved as drafted | `Stand by.` | `wait`; `hold on`; `wait out`; `do not answer` |
| EN-B006-CORE-009 | approved as drafted | `Wait out.` | `stand by`; `wait`; `hold on`; `out` |
| EN-B006-CORE-010 | approved as drafted | `Go ahead.` | `proceed`; `enter`; `continue`; `over` |
| EN-B006-CORE-011 | approved as drafted | `Read back channel one two.` | `say again channel one two`; `read back channel one three`; `channel 12 please` |
| EN-B006-CORE-012 | approved as drafted | `Switch to channel one two.` | `switch to channel one three`; `go to channel 12`; `channel one six`; `change to twelve` |
| EN-B006-CORE-013 | approved as drafted | `Request permission to enter.` | `I need permission`; `question permission to enter`; `answer permission to enter` |
| EN-B006-CORE-014 | approved as drafted | `Question. What is your ETA?` | `what is your ETA`; `request what is your ETA`; `answer ETA` |
| EN-B006-CORE-015 | approved as drafted | `Correction. Channel one two.` | `wrong channel twelve`; `correction channel one three`; `channel 12` |

Core matcher note: `channel 12` may be safe as a numeric rendering only when
the procedure marker is also present and the item-local policy accepts digit
rendering. The reject `channel 12` in EN-B006-CORE-015 should stay wrong
because it omits `Correction`.

## Marina / Harbour Review

8 of 10 marina_harbour items are approved as drafted. One item needs reject
revision only. One item should receive a clearer target_text before playable
implementation.

| Proposed ID | Review | Target text | Must-stay-wrong examples to keep / revise |
| --- | --- | --- | --- |
| EN-B006-MAR-001 | approved as drafted | `Request berth for tonight.` | `need a berth tonight`; `request birth for tonight`; `request slip for tonight`; `request dock` |
| EN-B006-MAR-002 | approved as drafted | `Request berth Bravo one two.` | `request berth B12`; `request birth Bravo one two`; `park at berth Bravo one two` |
| EN-B006-MAR-003 | approved as drafted | `Request fuel.` | `need fuel`; `request water`; `request shore power`; `fuel please` |
| EN-B006-MAR-004 | approved as drafted | `Request fresh water.` | `need water`; `request fuel`; `request shore power`; `request water fuel` |
| EN-B006-MAR-005 | approved as drafted | `Request shore power.` | `request power`; `request fuel`; `request fresh water`; `plug in` |
| EN-B006-MAR-006 | approved as drafted | `Prepare fenders.` | `prepare bumpers`; `prepare finders`; `put out bumpers`; `prepare lines` |
| EN-B006-MAR-007 | approved as drafted | `Prepare lines.` | `prepare ropes`; `tie ropes`; `prepare fenders`; `make fast ropes` |
| EN-B006-MAR-008 | approved as drafted | `Stand by outside the marina.` | `wait out`; `wait outside`; `do not answer outside`; `enter marina` |
| EN-B006-MAR-009 | needs reject revision | `Proceed into harbour.` | Keep `go ahead`; `approach harbour`; `proceed out of harbour`. Replace editorial reject text with exact `enter harbour`. |
| EN-B006-MAR-010 | needs target revision | revise to `I am departing berth now.` | `arrival berth now`; `leaving dock`; `departing birth now`; `request berth now` |

Exact revised target_text:

```text
EN-B006-MAR-010 target_text: I am departing berth now.
```

Exact revised reject example:

```text
EN-B006-MAR-009 replace original reject fragment: `enter harbour` without item-local approval
EN-B006-MAR-009 with: enter harbour
```

Rationale:

- `Departing berth now.` is operationally understandable, but `I am departing
  berth now.` is a clearer beginner/intermediate report form and avoids a
  fragment target in the first English-native pilot.
- `enter harbour` is the actual must-stay-wrong answer. The phrase "without
  item-local approval" is reviewer metadata and should not appear as a player
  reject fixture.

## Navigation Reports Review

8 of 10 navigation_reports items are approved as drafted. One item needs
target_text revision because the target phrase is not idiomatic Sea Speak.
One item needs reject revision because a singular/plural unit slip is too close
to a small grammar mistake and should not be the main must-stay-wrong example.

| Proposed ID | Review | Target text | Must-stay-wrong examples to keep / revise |
| --- | --- | --- | --- |
| EN-B006-NAV-001 | approved as drafted | `I am altering course to starboard.` | `turn right`; `alter course to port`; `I am turning right`; `starboard side to` |
| EN-B006-NAV-002 | approved as drafted | `I am altering course to port.` | `turn left`; `alter course to starboard`; `I am going left`; `port side to` |
| EN-B006-NAV-003 | approved as drafted | `My position is north of the marina.` | `I am at marina`; `position south of the marina`; `my course is north`; `north marina` |
| EN-B006-NAV-004 | approved as drafted | `My heading is zero nine zero degrees.` | `my course is east`; `heading 90 degrees`; `bearing zero nine zero`; `east` |
| EN-B006-NAV-005 | needs target revision | revise to `My course is to waypoint Alpha.` | Keep `my heading is waypoint Alpha`; `bearing waypoint Alpha`; `going to Alpha`. Revise `course Bravo` to `my course is to waypoint Bravo`. |
| EN-B006-NAV-006 | approved as drafted | `My speed is six knots.` | `six nautical miles`; `speed six cables`; `doing six`; `my distance is six knots` |
| EN-B006-NAV-007 | needs reject revision | `Buoy two cables north of my position.` | Keep `two nautical miles`; `two cables south`; `buoy north`. Replace `two cable north` with `two cables north of your position`. |
| EN-B006-NAV-008 | approved as drafted | `ETA harbour one four zero zero UTC.` | `ETA harbour 1500 UTC`; `ETA harbour 1400 local`; `two pm`; `ETA marina 1400 UTC` |
| EN-B006-NAV-009 | approved as drafted | `Read back heading zero nine zero degrees.` | `say again heading zero nine zero`; `read back heading 90 degrees`; `read back bearing zero nine zero`; `heading east` |
| EN-B006-NAV-010 | approved as drafted | `I passed astern of your vessel.` | `I passed behind`; `I passed ahead of your vessel`; `I passed abeam`; `astern side` |

Exact revised target_text:

```text
EN-B006-NAV-005 target_text: My course is to waypoint Alpha.
```

Exact revised reject examples:

```text
EN-B006-NAV-005 replace: course Bravo
EN-B006-NAV-005 with: my course is to waypoint Bravo

EN-B006-NAV-007 replace: two cable north
EN-B006-NAV-007 with: two cables north of your position
```

Rationale:

- `My course is waypoint Alpha.` is not a safe target because it omits the
  relation between course and waypoint. `My course is to waypoint Alpha.` keeps
  the course/heading/bearing boundary.
- `two cable north` is a unit grammar slip, not a strong dangerous-pair reject.
  QA should use direction, distance-unit, or reference-point changes instead.

## Embedded Minimal-Pair Review

Recommendation: remove all 5 embedded minimal-pair review items from the first
playable pilot and keep them as QA fixtures or a Director-approved second-phase
review module.

Reason: the targets and rejects are linguistically useful, but the source
prompts are meta-instructions such as "Do not say yes" and "Do not use repeat".
They do not test the same first-pilot model as the main 35 items:

```text
ordinary English source prompt -> Sea Speak target
```

| Proposed ID | Review | Target text | Must-stay-wrong examples to keep as QA/second-phase material |
| --- | --- | --- | --- |
| EN-B006-REV-001 | should be removed from first pilot | `Roger.` | `affirmative`; `yes`; `correct`; `copy` |
| EN-B006-REV-002 | should be removed from first pilot | `Affirmative.` | `roger`; `yes`; `correct`; `received` |
| EN-B006-REV-003 | should be removed from first pilot | `Say again.` | `repeat`; `please repeat`; `read back`; `say again please repeat` |
| EN-B006-REV-004 | should be removed from first pilot | `Request berth.` | `request birth`; `request dock`; `request pier`; `request slip`; `need a berth` |
| EN-B006-REV-005 | should be removed from first pilot | `Bearing zero nine zero degrees.` | `bearing 90 degrees`; `heading zero nine zero degrees`; `course east`; `east` |

If Director keeps a review block in the first pilot, it should be explicitly
labeled in metadata as review/checkpoint content, not ordinary English-native
source-prompt content.

## Consolidated Item Counts

| Category | Count | Items |
| --- | ---: | --- |
| approved as drafted | 31 | CORE-001 to CORE-015; MAR-001 to MAR-008; NAV-001 to NAV-004; NAV-006; NAV-008 to NAV-010 |
| needs target revision | 2 | EN-B006-MAR-010; EN-B006-NAV-005 |
| needs reject revision | 2 | EN-B006-MAR-009; EN-B006-NAV-007 |
| should be removed from first pilot | 5 | EN-B006-REV-001 to EN-B006-REV-005 |

Note: EN-B006-MAR-009 target is approved; only its reject text needs revision.
EN-B006-NAV-007 target is approved; only its reject set needs revision.

## Dangerous-Pair Risks

The draft correctly exposes the highest-risk English-native substitutions. QA
and matcher review must keep these boundaries strict:

- `say again` / `repeat`;
- `roger` / `affirmative` / `correct` / `yes`;
- `negative` / `no` / `wrong`;
- `over` / `out` / `over and out`;
- `stand by` / `wait out` / `wait` / `do not answer`;
- `go ahead` / `proceed` / `enter` / `continue`;
- `read back` / `say again`;
- `channel one two` / `channel one three` / `channel one six`;
- `correction` marker present / no marker;
- `berth` / `birth` / `dock` / `pier` / `slip`;
- `line` / `rope`;
- `fender` / `bumper` / `finder`;
- `fuel` / `fresh water` / `shore power`;
- `port` / `starboard` / `left` / `right`;
- `heading` / `course` / `bearing`;
- `zero nine zero` / `90` where current item policy requires `090`;
- `knots` / `nautical miles` / `cables`;
- `north` / `south`;
- `astern` / `ahead` / `abeam`;
- `harbour` / `marina` where the target object is exact;
- `UTC` / `local`;
- `1400` / `1500`.

## Matcher Risks

No matcher/API change is requested in this report.

Matcher risks to protect before implementation:

- Source English prompt text must never be copied into `accepted_answers` by
  generation, migration, fixture seeding, or UI fallback.
- Do not add global aliases such as `repeat -> say again`, `yes ->
  affirmative`, `got it -> roger`, `right -> starboard`, `left -> port`,
  `rope -> line`, `bumper -> fender`, `dock/slip/pier -> berth`, `east ->
  zero nine zero`.
- Typo matching must not fuzz numeric tokens, channel numbers, headings,
  bearings, ETA values, UTC/local markers, distance units, side/direction
  terms, or short maritime terms.
- Reject answers that contain the right phrase plus a dangerous extra phrase,
  for example `say again please repeat` for a `Say again.` target.
- Punctuation and capitalization can remain forgiving, but marker words such as
  `Question`, `Request`, and `Correction` must not disappear in marker drills.
- Digit rendering should be item-local. `channel 12` or `1400` may be safe only
  when the exact value and required procedure phrase remain intact.

## Localization Impact

Localization impact is manageable if learner source language is treated as
separate from UI locale.

- UI locale may remain `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`, or fallback
  `en`.
- Learner source language for this pilot is `en`.
- Target language remains English Sea Speak / SMCP-style phraseology.
- English UI is the highest-risk locale because source prompt and target both
  look like "English" to the learner.
- Russian UI must not imply that this pilot belongs to the existing Russian
  source stream.
- Terms such as `Securite`, `Pan-Pan`, `Mayday`, `port`, `starboard`, `over`,
  `out`, `roger`, `affirmative`, `negative`, `read back`, `say again`, channel
  numbers, UTC/Zulu times, headings, bearings, units, call signs, and vessel
  names must remain stable across UI languages.

## QA Fixture Matrix Readiness

QA can design a fixture matrix from this draft after applying the two target
revisions, the two reject revisions, and the first-pilot removal decision for
the 5 embedded review items.

Minimum QA matrix dimensions:

- one canonical target accept per item;
- punctuation/capitalization variants for every target;
- at least one natural-prompt-as-answer reject per item;
- dangerous-pair rejects for every item;
- numeric-change rejects for channels, headings, bearings, ETA and distances;
- unit-change rejects for `knots`, `nautical miles`, and `cables`;
- procedure-marker omissions for `Question`, `Request`, and `Correction`;
- source language/target language separation checks;
- UI locale checks proving that locale does not alter target language or
  accepted-answer policy.

QA should not treat the 5 embedded review items as ordinary first-pilot playable
items unless Director explicitly approves a `minimal_pair_review` content type.

## Copy-Ready Handoff For Director Ether

Status: NEEDS DIRECTOR DECISION, report-only. Sea Speak Linguist review finds
no FAIL in the English-native Batch 006 draft, but first-pilot implementation
should wait.

Approved as drafted: 31 items. Needs target revision: EN-B006-MAR-010 to
`I am departing berth now.` and EN-B006-NAV-005 to `My course is to waypoint
Alpha.` Needs reject revision: EN-B006-MAR-009 replace editorial text with
`enter harbour`; EN-B006-NAV-007 replace `two cable north` with `two cables
north of your position`. Remove EN-B006-REV-001 to EN-B006-REV-005 from the
first playable pilot or keep them only as QA/second-phase minimal-pair review
items.

Director decisions needed: approve English-native stream storage/schema, decide
whether minimal-pair review can be playable in the first pilot, and confirm QA
fixture shape before any runtime/API/UI/batch/starter/matcher work.
