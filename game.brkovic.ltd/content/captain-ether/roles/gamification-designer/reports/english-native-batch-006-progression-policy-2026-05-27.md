# Gamification Designer Report: English-Native Batch 006 Progression Policy

Дата: 2026-05-27  
Роль: Gamification Designer / Captain Ether  
Режим: report-only progression/review pacing policy  
Scope: English-native Batch 006 internal pilot

## Status

Overall: PASS FOR REPORT-ONLY POLICY.

NEEDS DIRECTOR DECISION перед implementation только для runtime/storage/UI
интеграции: этот отчет не утверждает код, схему хранения progress, stream
selector, playable merge, answer-log schema patch или production visibility.

FAIL: нет.

## Scope Confirmation

Прочитаны заданные task documents:

- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/gamification-designer/rules.md`
- `content/captain-ether/roles/gamification-designer/handoff.md`
- `content/captain-ether/roles/director-engineer/reports/english-native-batch-006-director-decisions-2026-05-27.md`
- `content/captain-ether/roles/qa/reports/english-native-batch-006-pilot-qa-matrix-review-2026-05-27.md`

Также прочитаны role-required context files:

- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/content-growth-roadmap-1000.md`
- `content/captain-ether/answer-policy.md`
- existing Gamification Designer progression card
- Content Producer и Sea Speak Linguist Batch 006 planning reports

Изменен только разрешенный report path. Runtime/API/UI, `starter.json`,
batches, matcher, router, registry, auth/platform, Watch Officer, Nav Desk,
production config, deploy/FTP, private config, sessions, CSRF, cookies, player
email, player identity и secrets не читались как private material и не
изменялись.

## First Pilot Pacing Policy

Director decision для первого playable pilot уже принят: использовать 35
ordinary English-native items и исключить `EN-B006-REV-001` to
`EN-B006-REV-005` из первого playable pilot.

Canonical 35-item pool:

- `core_radio`: 15 items;
- `marina_harbour`: 10 items;
- `navigation_reports`: 10 items;
- level shape from draft: 19 beginner, 16 intermediate, 0 advanced.

Recommended internal pilot path:

| Watch | Length | New item target | Recommended mix | Purpose |
| --- | ---: | ---: | --- | --- |
| First contact | 12 | 12 new | about 6 core, 4 marina, 2 navigation | prove that English-native prompt to Sea Speak target is understandable without fatigue |
| Working pass | 16 | 16 new | about 6 core, 5 marina, 5 navigation | add channel, marker, berth/service, heading/course/bearing boundaries |
| Review/coverage pass | 20 | 7 new + 13 review/repeat | remaining unseen items first, then Lost Oars or high-risk families from the same 35 items | cover all 35 unique items without adding `REV-*` playable content |

Standalone pacing by current watch length:

- 12-call watch: best first learner experience; beginner-heavy; no review
  pressure; avoid more than 2 navigation reports in the first run.
- 16-call watch: best first QA/content coverage watch; may use the exact 16
  intermediate items after a short beginner warm-up policy is approved, or use
  mixed beginner/intermediate ordering in the internal pilot.
- 20-call watch: internal endurance and review pass only for Batch 006, not an
  "advanced mastery" signal, because Batch 006 has no advanced items.

Ordering should keep the existing Captain Ether rhythm: shorter, clearer
responses first; then procedure markers and channels; then marina operations;
then longer navigation reports. Do not turn the pilot into a shuffled exam deck.

## Lost Oars For Natural-English Wrong Answers

Natural English wrong answers are the central learning signal for this pilot.
Examples such as `repeat`, `yes`, `no`, `got it`, `copy`, `left`, `right`,
`rope`, `bumper`, `dock`, `pier`, `slip`, natural source prompt copies, and
dangerous numeric shorthand should remain wrong when the Linguist/QA matrix says
they are must-stay-wrong.

Recommended Lost Oars treatment:

- create a Lost Oar for a wrong natural-English answer when the player attempted
  the item and the answer is not an accepted target, accepted variant, or
  conservative spelling slip;
- do not create a Lost Oar for accepted capitalization, punctuation, spacing, or
  safe spelling reminders;
- frame the Lost Oar as "standard radio phrase to revisit", not as failure;
- show the canonical Sea Speak target during review only through the existing
  Lost Oars learning pattern, never as internal reject rationale;
- do not auto-promote natural English answers from Lost Oars or answer logs into
  `accepted_answers`.

Suggested player-facing English fallback direction if future UX copy is needed:

- "Review the standard radio phrase."
- "This phrase is ready for a short review."
- "Use the Sea Speak form here."

Avoid copy such as "wrong English", "failed", "bad answer", "lost mastery", or
"your English is incorrect". The learner is not being corrected for native
English fluency; they are being trained to use controlled maritime phraseology.

## Review Loop Without REV-* Playable Items

Do not make `EN-B006-REV-001` to `EN-B006-REV-005` playable in the first pilot.
They should remain QA / second-phase minimal-pair review material.

Recommended first-pilot review loop:

1. Normal watch: player answers only the 35 approved ordinary English-native
   items.
2. Immediate soft feedback: accepted exact/variant/spelling answers reinforce
   the target phrase; wrong natural English creates calm review material.
3. Lost Oars: unresolved wrong answers return as short review, using the same
   original 35 items and their canonical Sea Speak targets.
4. Summary: show review need qualitatively, not as a penalty or branch failure.
5. QA/Director analysis: use `REV-*` and dangerous pairs offline to decide
   whether a second-phase `minimal_pair_review` module is needed.

Minimal-pair learning can happen inside the 35-item pool through item-local
must-stay-wrong answers and Lost Oars. It does not require playable `REV-*`
items in the first internal pilot.

## Progress Separation

Progress for `ru_source` and `english_native` must be separated.

Policy recommendation:

- existing Captain Ether route remains legacy `ru_source` default;
- UI locale must not select `english_native`; specifically, `locale === 'en'`
  must not unlock or default the English-native stream;
- unsupported system language fallback to English UI must remain UI-only and
  must not select English-native learner content;
- progress, Lost Oars, watch history, branch signals, summary state, and future
  mastery labels must be keyed or filtered by learner stream;
- `ru_source` mistakes must not create `english_native` Lost Oars, and
  `english_native` natural-English mistakes must not affect Russian-source
  progress;
- if a future branch card is shown, it should state stream context internally
  and avoid player-facing technical labels unless UX/HUD localizes them.

Recommended progress labels remain qualitative, not percentage-driven:

- New Waters;
- Getting Familiar;
- Holding Watch;
- Review Soon.

For this pilot, do not show "advanced", "certified", "mastered", "failed", or
"complete" status from one 20-call watch.

## Answer-Log Implications

English-native Batch 006 will likely produce valuable wrong-answer evidence.
Those logs should support review and linguist triage, not automatic acceptance.

Recommended answer-log policy:

- wrong natural-English answers should log under existing wrong-answer practice
  when answer logging is enabled for the implemented stream;
- clean canonical exact answers should remain unlogged;
- accepted spelling slips and accepted variants may follow current log kinds,
  but should not create Lost Oars;
- source-prompt-as-answer rejects are useful QA evidence and should be grouped
  by `item_id`;
- answer-log review must not expose player email, player identity, sessions,
  cookies, CSRF, login codes, SMTP, `.netrc`, secrets, or private config;
- future implementation should include `learner_stream=english_native` in
  non-sensitive grouping if Director approves schema/storage changes;
- answer-log clusters must be routed to Answer Log Analyst and Sea Speak
  Linguist before any accepted-answer expansion.

High-risk answer-log clusters for Batch 006:

- natural English synonyms that are operationally unsafe: `repeat`, `yes`,
  `no`, `left`, `right`, `rope`, `bumper`, `dock`;
- numeric compression or changed values: `channel 12`, `90`, `1400 local`,
  `1500 UTC`;
- correct Sea Speak plus dangerous extra phrase, such as `say again please
  repeat`.

## Localization Impact

Localization risk is medium because both source and target are English-looking
strings, while UI language can be English, Russian, or another supported locale.

Policy recommendation:

- UI locale and learner stream remain separate product axes;
- supported UI locales stay `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`;
- unsupported locales continue to fall back to English UI only;
- Sea Speak / SMCP target meaning must not be translated by UI localization;
- Russian UI must not imply Batch 006 belongs to the existing `ru_source`
  stream;
- English UI must not imply ordinary English source prompts are acceptable
  answers;
- `Securite`, `Pan-Pan`, `Mayday`, `port`, `starboard`, `over`, `out`,
  `roger`, `affirmative`, `negative`, `read back`, `say again`, channels,
  UTC/Zulu times, headings, bearings, units, call signs, vessel names, and exact
  numbers remain stable across UI languages.

Any future player-facing copy introduced for this policy needs i18n keys with
English fallback first and mobile length checks for supported languages. This
report does not introduce runtime copy.

## Risks And QA Checks Needed

Risks:

- English-native learners may feel their natural English is being judged rather
  than converted into radio procedure.
- A 20-call watch can look like advanced progress even though the pilot has no
  advanced items.
- Answer-log clusters may tempt global natural-English synonym expansion.
- Stream mixing can corrupt progress or Lost Oars if `ru_source` and
  `english_native` are not separated.
- `REV-*` items can distort the first-pilot learning model if they become
  playable too early.

Future QA checks after Director-approved implementation:

- 12/16/20 watch lengths remain intact;
- first 35 items exclude `REV-*`;
- natural prompt copied as answer fails and creates calm review material;
- accepted punctuation/capitalization/spelling variants do not create Lost Oars;
- Lost Oars are filtered by `learner_stream`;
- finish-watch summary does not expose accepted answers, matcher reasons,
  fixture dimensions, internal branch/module notes, or player identity;
- answer logs show no player email or identity fields;
- UI locale changes do not switch learner stream or accepted-answer policy.

## Implementation Owner Route

No implementation is assigned by this report.

Future route if Director Ether accepts the policy:

- Director-Engineer: decide storage, stream filtering, runtime integration, and
  whether progress metadata can include `learner_stream`.
- UX/HUD Designer: design stream-aware summary/Lost Oars wording and selector
  behavior if assigned.
- Localization Architect: review player-facing copy and UI-locale separation.
- Sea Speak Linguist: review answer-log clusters and any proposed accepted
  variants.
- Answer Log Analyst: cluster real wrong natural-English answers after pilot
  usage.
- QA: verify stream separation, Lost Oars behavior, answer-log privacy, and
  pacing.

## Copy-Ready Handoff For Director Ether

PASS, report-only. Recommend a 35-item English-native internal pilot pacing
policy with no playable `REV-*` items. Use 12 calls for first learner contact,
16 calls for working coverage, and a 20-call internal review/coverage pass that
is not treated as advanced mastery because Batch 006 has no advanced items.

Lost Oars should capture natural-English wrong answers as calm Sea Speak review
material, while accepted capitalization/punctuation/safe spelling variants
should not create Lost Oars. Review loops should use the same 35 playable items
plus item-local dangerous-pair evidence; keep `REV-*` as QA/second-phase review
material only.

Progress, Lost Oars, watch summaries, branch signals, and future answer-log
grouping must remain separated between `ru_source` and `english_native`. UI
locale fallback to English must not select English-native content. Answer logs
may be useful for disputed natural-English answers, but must not auto-expand
accepted answers and must not expose player identity.

No runtime/API/UI, `starter.json`, batches, matcher, router, registry,
auth/platform, Watch Officer, Nav Desk, production config, deploy/FTP, private
config, sessions, CSRF, cookies, player email, player identity, or secrets were
changed.

## Changed Files

- `content/captain-ether/roles/gamification-designer/reports/english-native-batch-006-progression-policy-2026-05-27.md`

## Verification

Runtime tests were not run. This was a report-only progression/review pacing
policy review from Director, QA, role-control, answer-policy, roadmap, Content
Producer, Linguist, and existing Gamification Designer context.
