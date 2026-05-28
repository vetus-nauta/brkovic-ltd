# Sea Speak Linguist Report: English-Native Sea Speak Guardrails

Date: 2026-05-27
Role: Sea Speak Linguist / Captain Ether
Mode: report-only

## Task Result

PASS для лингвистических guardrails в report-only режиме.

NEEDS DIRECTOR DECISION перед любым внедрением: English-native поток должен
быть оформлен как отдельная curriculum/content модель, где natural English
является только source prompt, а не расширением `accepted_answers`.

FAIL условий в рамках отчета не найдено: текущая политика уже запрещает
опасное расширение accepted answers через ordinary English paraphrases,
числа, каналы, стороны, сигналы, procedure words и минимальные пары.

## Scope / Changed Files

Изменен только разрешенный файл:

- `content/captain-ether/roles/sea-speak-linguist/reports/english-native-sea-speak-guardrails-2026-05-27.md`

Не изменялись matcher/API/UI, `starter.json`, batches, answer dictionaries,
QA regression fixtures, router/registry, auth/platform, Watch Officer,
Nav Desk, production config, deploy/FTP, secrets, cookies, sessions, CSRF,
player email или player identity.

## Core Decision

Для English-native learners допустима модель:

```text
natural English / casual maritime source prompt -> standard Sea Speak target
```

Недопустима модель:

```text
natural English / casual maritime phrase -> accepted answer for a Sea Speak target
```

Иными словами, English-native prompt может показывать небезопасную бытовую или
слишком свободную английскую формулировку как исходную мысль ученика, но
игрок должен ответить стандартной Sea Speak / SMCP-style фразой. Prompt text
не является доказательством, что эта же фраза безопасна как answer.

## Natural English Forms Allowed As Source Prompts

Эти формы можно показывать как source prompt для англоязычных учеников, если
target явно обучает стандартную Sea Speak форму:

| Natural English source prompt | Safe target direction |
| --- | --- |
| `Turn right.` | `Alter course to starboard.` |
| `Turn left.` | `Alter course to port.` |
| `What did you say?` | `Say again.` / item-specific `Say again ...` |
| `Please repeat that.` | `Say again ...` |
| `Can you wait?` | `Stand by.` |
| `Stop talking for now.` | `Wait out.` only when the item trains `wait out` |
| `I need a place to stay tonight.` | `Request berth for tonight.` |
| `Put out the bumpers.` | `Prepare fenders.` |
| `Tie the ropes.` | `Prepare lines.` |
| `The weather is bad.` | `Restricted visibility` / `weather warning`, item-specific |
| `There is something blocking the channel.` | `Obstruction in the channel.` |
| `I need a tow.` | `Request towing assistance.` |
| `Someone needs medical help.` | `Request medical assistance.` |
| `My engine died.` | `I have engine failure.` |
| `Keep listening on sixteen.` | `Keep listening watch on channel 16.` |

Prompt safety requirements:

- Source prompt may be casual, incomplete, or unsafe only because it is the
  learner's starting language, not because it is an accepted maritime answer.
- Prompt must not include a wrong exact value unless the target explicitly
  teaches correction from that wrong value.
- Prompt must not hide critical ambiguity: if `right` means starboard, the
  learning item must make vessel orientation clear.
- Prompt must not train jokes or non-radio idioms such as `over and out` unless
  the item target explicitly corrects them.

## Forms That Must Stay Wrong Even For English-Native Learners

These forms may appear as source prompts only with care, but must stay wrong as
answers when the target expects Sea Speak:

| Must-stay-wrong answer | Why it stays wrong |
| --- | --- |
| `left` / `right` | Must not replace `port` / `starboard`. |
| `turn right` | Must not replace `alter course to starboard`. |
| `repeat` / `please repeat` | Must not replace `say again` in this training. |
| `over and out` | Contradicts `over` and `out` procedure meanings. |
| `yes` / `no` | Must not replace `affirmative` / `negative` in trained items. |
| `copy` / `got it` | Must not replace `roger`. |
| `wait` / `hold on` | Must not replace item-specific `stand by` or `wait out`. |
| `rope` | Must not replace `line` in mooring-line drills. |
| `bumper` | Must not replace `fender`. |
| `dock` / `pier` / `slip` | Must not replace `berth` in berth drills. |
| `poor visibility` / `bad visibility` | Must not replace `restricted visibility`. |
| `security` | Must not replace `Securite` / `Sécurité`. |
| `danger of collision` | Must not replace `risk of collision`. |
| `engine trouble` | Must not replace `engine failure` unless a future item trains it. |
| `medical advice` | Must not replace `medical assistance`. |
| `rescue assistance` | Must not replace `towing assistance`. |

## Dangerous Minimal Pairs For English-Native

English-native learners are high-risk for replacing standard radio language
with familiar ordinary English. Protect these pairs in source/target design and
QA:

| Pair | Guardrail |
| --- | --- |
| `port / starboard` vs `left / right` | Left/right may be source prompt only; answer must use port/starboard. |
| `over / out / over and out` | Never accept `over and out`; keep reply-inviting and closing meanings separate. |
| `say again / repeat` | `repeat` may be prompt wording; answer remains `say again`. |
| `roger / affirmative / correct / yes` | Receipt, yes, and correctness are separate concepts. |
| `read back / say again` | Confirmation vs retransmission request must not collapse. |
| `stand by / wait out / do not answer / wait` | Procedure actions stay item-specific. |
| `berth / dock / pier / slip / birth` | `berth` remains the trained harbour term; `birth` is never typo-accepted. |
| `line / rope` | `rope` is natural English prompt only, not accepted answer. |
| `fender / bumper / finder` | `bumper` and `finder` stay wrong in answer checking. |
| `restricted visibility / poor visibility / bad weather` | Ordinary weather phrasing prompts the standard term; it is not equivalent. |
| `Securite / security / Pan-Pan / Mayday` | Signal family and pronunciation/spelling boundaries stay strict. |
| `urgency / safety / distress / emergency` | Generic `emergency` must not blur signal category. |
| `risk of collision / danger of collision / collision happened` | Keep the standard risk phrase separate from danger/result wording. |
| `heading / course / bearing` | Related navigation terms are not interchangeable. |
| `090 / 90`, `1400 / 1500`, channel `16 / 12` | Numeric values must not fuzz-match. |
| `knots / nautical miles / cables` | Speed and distance units remain separate. |
| `decimal / point / dot` | Current training keeps `decimal` strict. |
| `north / south / east / west` | Direction changes are operationally wrong. |
| `engine failure / engine trouble / steering failure` | Failure type must remain item-specific. |
| `medical assistance / medical advice / evacuation` | Assistance type and severity must remain item-specific. |

## Accepted / Rejected Policy For English-Native

Accepted for English-native answer checking:

- Canonical Sea Speak target text.
- Existing item-local accepted answers already approved by Sea Speak Linguist.
- Minor spelling, punctuation, capitalization, spacing, and small grammar slips
  when maritime meaning remains exact.
- Approved compact forms only where already accepted, for example `1400Z` for
  exact UTC/Zulu ETA items or `readback` where item-local policy allows it.
- UI language-independent Sea Speak terms: target meaning does not change
  because the player interface is English, Russian, German, Italian, Spanish,
  Serbian, or Chinese.

Rejected for English-native answer checking:

- Natural English paraphrases that weaken or replace trained Sea Speak terms.
- Casual maritime slang unless item-local review explicitly approves it.
- Any answer that changes signal family, procedure word, side, direction,
  heading/course/bearing, channel, time, unit, ETA, MMSI, call sign, count,
  vessel status, failure type, assistance type, warning category, or report
  object.
- Prompt wording reused as an answer when it is intentionally non-standard.
- Global synonym expansions such as `right -> starboard`, `repeat -> say
  again`, `rope -> line`, `bumper -> fender`, `emergency -> urgency`, or
  `security -> Securite`.

Director decision needed before implementation:

- Whether English-native items should live in separate batches/modules or as
  alternate source-prompt layers over existing targets.
- Whether source prompts can include explicitly unsafe phrases marked only in
  internal metadata, without exposing that label in UI.
- Whether QA fixtures should add an `english_native_source_prompt` dimension
  separate from `should_accept` / `should_reject`.

## 10 Safe Prompt -> Target Pairs

| # | English-native source prompt | Standard Sea Speak target |
| ---: | --- | --- |
| 1 | `Turn right to avoid me.` | `I am altering course to starboard.` |
| 2 | `What did you say about my position?` | `Say again your position.` |
| 3 | `Please say that channel back to me.` | `Read back channel one two.` |
| 4 | `I need a place in the marina tonight.` | `Request berth for tonight.` |
| 5 | `Put out the bumpers on the left side.` | `Prepare fenders on port side.` |
| 6 | `Tie the front and back ropes.` | `Prepare bow and stern lines.` |
| 7 | `There is fog in the approach channel until two o'clock UTC.` | `Navigation warning restricted visibility in the approach channel until 1400 UTC.` |
| 8 | `Something is blocking the channel two cables north of Alpha.` | `Navigation warning obstruction two cables north of reporting point Alpha.` |
| 9 | `My engine died and I need help.` | `Engine failure require assistance.` |
| 10 | `Keep listening on sixteen until three o'clock UTC.` | `Keep listening watch on channel 16 until 1500 UTC.` |

Notes:

- These are safe as prompts because the target supplies the standard phrase.
- They are not safe as automatic accepted answers.
- Pairs with `left/right`, `two o'clock/three o'clock`, or ordinary place words
  require item metadata to make the intended target unambiguous.

## 10 Must-Stay-Wrong Answer Pairs

| # | Target item meaning | Must-stay-wrong submitted answer |
| ---: | --- | --- |
| 1 | `port` | `left` |
| 2 | `starboard` | `right` |
| 3 | `say again your position` | `repeat your position` |
| 4 | `read back channel one two` | `say again channel one two` |
| 5 | `over` | `over and out` |
| 6 | `request berth for tonight` | `need a berth tonight` |
| 7 | `prepare fenders on port side` | `prepare bumpers on left side` |
| 8 | `restricted visibility` | `poor visibility` |
| 9 | `Securite Securite Securite` | `security security security` |
| 10 | `towing assistance` | `rescue assistance` |

## QA Cases

Recommended report-only QA additions for a future Director-approved fixture
change. These are not applied in this task.

| Case | Source prompt | Target | Should accept | Should reject |
| --- | --- | --- | --- | --- |
| EN-NATIVE-001 | `Turn right.` | `alter course to starboard` | `alter course to starboard` | `turn right`; `alter course to port` |
| EN-NATIVE-002 | `What did you say?` | `say again` | `say again`; `please say again` | `repeat`; `please repeat` |
| EN-NATIVE-003 | `Tell me the channel back.` | `read back channel one two` | `read back channel 12`; `read back channel one two` | `say again channel one two`; `read back channel 13` |
| EN-NATIVE-004 | `I need a slip for tonight.` | `request berth for tonight` | `request berth for tonight` | `need a berth tonight`; `request slip for tonight` |
| EN-NATIVE-005 | `Put out the bumpers.` | `prepare fenders` | `prepare fenders` | `prepare bumpers`; `prepare finders` |
| EN-NATIVE-006 | `Tie the ropes.` | `prepare lines` | `prepare lines` | `prepare ropes` |
| EN-NATIVE-007 | `Fog in the channel.` | `restricted visibility in the channel` | `restricted visibility in the channel` | `poor visibility in the channel`; `fog in the channel` |
| EN-NATIVE-008 | `Safety call.` | `Securite Securite Securite` | `Securite Securite Securite`; `Sécurité Sécurité Sécurité` | `security security security`; `Pan-Pan Pan-Pan Pan-Pan` |
| EN-NATIVE-009 | `Engine died.` | `engine failure` | `engine failure` | `engine trouble`; `steering failure` |
| EN-NATIVE-010 | `Need a tow.` | `request towing assistance` | `request towing assistance`; `request tow` only if item-local approved | `request rescue assistance`; `request tug assistance` |
| EN-NATIVE-011 | `Yes.` | `affirmative` | `affirmative` | `yes`; `roger` |
| EN-NATIVE-012 | `Got it.` | `roger` | `roger` | `got it`; `copy`; `affirmative` |
| EN-NATIVE-013 | `Collision danger.` | `risk of collision` | `risk of collision`; `there is risk of collision` | `danger of collision`; `collision happened` |
| EN-NATIVE-014 | `At two pm UTC.` | `ETA 1400 UTC` | `ETA 1400 UTC`; `ETA 1400Z`; `ETA one four zero zero UTC` | `ETA 1500 UTC`; `ETA 1400 local`; `ETA two pm` |
| EN-NATIVE-015 | `Bearing is east.` | `bearing 090 degrees` | `bearing 090 degrees`; `bearing zero nine zero degrees` | `bearing 90 degrees`; `heading 090 degrees`; `east` |

QA acceptance rule:

- Source prompt text must never be copied into `should_accept` unless the same
  phrase independently passes Sea Speak Linguist review as a standard target or
  item-local accepted answer.
- Every English-native prompt item should carry at least one must-reject case
  that repeats the natural prompt as an answer.

## Localization Impact

Learner source language:

- This report covers English-native learner prompts only.
- UI localization remains separate and can stay in supported UI languages:
  `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.

Sea Speak target language:

- Target Sea Speak remains English / SMCP-style maritime radio phraseology.
- Sea Speak meaning must not be translated by UI locale.
- `Securite` / `Sécurité`, `Pan-Pan`, `Mayday`, `port`, `starboard`, `over`,
  `out`, `roger`, `affirmative`, `negative`, `read back`, `say again`,
  channels, UTC/Zulu times, headings, units, call signs, and vessel names must
  remain stable across UI languages.

Localization risk:

- English UI can make prompt and target both look like "English"; the product
  must distinguish natural English source from Sea Speak answer expectations.
- Non-English UI should not translate English-native source prompts unless a
  separate source-language stream is designed.
- If a lesson is for English-native learners, localized UI labels may be in the
  user's interface language, but the source prompt should be marked internally
  as `source_language: en` and not adapted by automatic UI i18n.
- Long natural prompts may create mobile text-length risk; Curriculum Architect
  should keep beginner prompts short and Content Producer should avoid verbose
  explanatory prompt copy.

## Handoff: Curriculum Architect

Recommended next curriculum decision:

- Define an English-native learning stream as "natural English to Sea Speak",
  not as a relaxed accepted-answer mode.
- Start with high-frequency ordinary English misconceptions:
  `left/right`, `repeat`, `yes/no`, `got it`, `wait`, `rope`, `bumper`,
  `dock/slip`, `bad visibility`, `engine trouble`, `need help`.
- Sequence from short prompt-to-term items to operational phrases:
  sides/procedure words first, then marina, navigation reports, safety,
  urgency.
- Require every English-native item to include a prompt-as-wrong QA case.

## Handoff: Content Producer

Content production rules:

- Add English-native source prompts only as source prompt fields or separate
  draft fields approved by Director-Engineer; do not add them to
  `accepted_answers`.
- For each item, write one natural prompt, one canonical target, safe
  item-local accepted answers, and must-stay-wrong prompt echo.
- Avoid source prompts with ambiguous exact values unless the target supplies
  the exact value unambiguously.
- Flag any proposed ordinary-English answer variant for Sea Speak Linguist
  review instead of adding it directly.

## Handoff: QA

QA should verify:

- Natural English prompt text is displayed as prompt only and is not accepted
  as answer by side effect.
- Prompt echo answers fail for every English-native item unless explicitly
  reviewed as safe.
- Existing dangerous minimal pairs still fail after any English-native content
  addition.
- English UI and non-English UI do not change Sea Speak target meaning.
- Mobile prompt text does not overlap controls or hide target/feedback areas.

Priority regression groups for English-native QA:

- `left/right` vs `port/starboard`
- `repeat` vs `say again`
- `got it/copy/yes` vs `roger/affirmative`
- `over and out` vs `over/out`
- `rope/bumper/dock/slip` vs `line/fender/berth`
- `poor visibility/security/emergency` vs `restricted visibility/Securite/urgency`
- exact channels, times, headings, directions, distances, units, and counts

## Copy-Ready Director Handoff

English-native Sea Speak guardrails are PASS as report-only guidance, with
NEEDS DIRECTOR DECISION before implementation. The safe model is natural
English source prompt -> standard Sea Speak target. The unsafe model is adding
natural English prompt text to accepted answers.

Do not relax accepted answers for English-native learners. Keep existing
minimal-pair protections and add prompt-echo rejection cases when the
English-native stream is implemented. Route curriculum shape to Curriculum
Architect, item drafting to Content Producer, and regression expansion to QA
after Director-Engineer chooses the data model.

## Verification Performed

Read:

- `README.md`
- `docs/captain-ether-repository-sync-rule.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/sea-speak-linguist/rules.md`
- `content/captain-ether/roles/sea-speak-linguist/handoff.md`
- `content/captain-ether/sea-speak-linguist-brief.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/accepted-answer-dictionary.md`
- `content/captain-ether/accept-reject-qa-pairs.json`

Checks:

- Confirmed assigned report path did not exist before this task.
- Confirmed report-only scope and forbidden areas were not edited.
- No runtime tests, matcher regression, API checks, UI checks, production
  checks, deploy, or auth/platform checks were run because this task is
  report-only and restricted to linguistic guardrails.
