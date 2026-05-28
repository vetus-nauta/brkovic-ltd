# Sea Speak Linguist Report: Next Branch Risk Radar

Date: 2026-05-27
Role: Sea Speak Linguist / Captain Ether
Task ID: TASK-CE-OFFICE-LING-0001
Mode: report-only

## Task Result

PASS for report-only linguistic risk radar.

This report covers likely next Captain Ether branches after the Beta 1.1
safety/Securite baseline:

- `urgency_panpan`
- `distress_mayday`
- `traffic_collision`
- `vts_port_control`

No broad synonym expansion is proposed. The recommendation is to grow accepted
answers item-locally, with explicit dangerous-pair regression for every branch.

## Changed Files

- `content/captain-ether/roles/sea-speak-linguist/reports/office-background-next-branch-risk-radar-2026-05-27.md`

No runtime/API/UI/content data, starter JSON, batches, matcher, router,
registry, auth/platform, Watch Officer, Nav Desk, Game Director docs,
production config, deploy/FTP, or secrets were edited.

## Operating Assumptions

Current accepted-answer policy already protects:

- exact channel, time, heading, bearing, distance, unit, direction, and location
  values;
- signal boundaries: `Securite / Pan-Pan / Mayday`;
- branch boundaries: `safety / urgency / distress`;
- procedure boundaries: `over / out`, `roger / affirmative`,
  `say again / read back`, and `advice / advise`.

The next branches should preserve those boundaries. Pan-Pan, Mayday,
traffic/collision, and VTS items will contain phrases that are close in normal
English but materially different in Sea Speak.

## Branch Radar Summary

| Branch | Main linguistic risk | Recommended posture |
| --- | --- | --- |
| `urgency_panpan` | Pan-Pan may be blurred into Mayday, Securite, help requests, or routine defect reports. | Keep urgency as non-distress. Accept exact signal and exact stated condition only. |
| `distress_mayday` | Mayday may be under-accepted due to small form errors, or over-accepted from urgency phrases. | Protect Mayday as distress only. Do not accept Pan-Pan, help, emergency, or alarm as Mayday unless the item explicitly trains them. |
| `traffic_collision` | Collision-avoidance intentions are full of opposite or near-opposite commands. | Keep movement, passing side, CPA/TCPA, and risk wording strict. |
| `vts_port_control` | Authority instructions can be confused with requests, advice, reports, and permission. | Keep VTS instructions item-specific. Reject changed reporting point, channel, berth, pilot, tug, and movement authority. |

## Urgency Pan-Pan Risk Radar

Dangerous minimal pairs:

| Pair | Risk |
| --- | --- |
| `Pan-Pan / Mayday` | Urgency and distress are different operational states. |
| `Pan-Pan / Securite` | Urgency call must not collapse into safety broadcast. |
| `urgency / distress` | A disabled vessel may be urgent without declaring distress. |
| `engine failure / steering failure` | Different assistance and maneuvering implications. |
| `disabled / adrift / aground` | Similar emergency vocabulary, different vessel state. |
| `need assistance / require immediate assistance` | May be item-local, but should not globally substitute for Pan-Pan or Mayday. |
| `medical assistance / medical advice` | Assistance requested is not the same as advice requested. |
| `tow required / tug assistance required` | Towage, tug assistance, and pilot/tug port operations should stay distinct. |
| `not under command / restricted in ability to manoeuvre` | Collision-regulation categories must not blur. |
| `position / destination / last known position` | Urgency calls must preserve exact report object. |

Must-stay-wrong categories:

- Any Mayday signal in a Pan-Pan drill unless the drill explicitly asks for a
  distress contrast.
- Ordinary phrases like `help`, `emergency`, `problem`, or `breakdown` as
  replacements for the trained Pan-Pan signal.
- Changed failure type: engine, steering, power, fuel, battery, fire, flooding,
  and medical condition must not substitute for each other.
- Changed assistance type: tow, tug, medical assistance, medical advice,
  escort, pilot, and evacuation must stay item-specific.
- Missing or changed position, course, speed, persons on board, or ETA.

Matcher-policy risks:

- Do not let hyphen, spacing, or repeated-word normalization turn any
  Pan-Pan-like text into Mayday or Securite.
- `panpan`, `pan pan`, and `pan-pan` can be reviewed as item-local spelling
  variants, but not as a global alias that accepts unrelated repeated words.
- Avoid accepting generic semantic similarity for urgency phrases. The branch
  should train the signal and the exact operational problem.

## Distress Mayday Risk Radar

Dangerous minimal pairs:

| Pair | Risk |
| --- | --- |
| `Mayday / Pan-Pan` | Distress must not be accepted as urgency, or urgency as distress. |
| `Mayday / Securite` | Distress signal must not collapse into safety broadcast. |
| `distress / urgency / safety` | Branch identity must stay strict. |
| `fire / flooding / sinking` | Distress condition changes rescue priority and action. |
| `collision / grounding / aground` | Related casualties, different meaning. |
| `man overboard / abandon ship` | Different emergency action. |
| `require immediate assistance / require assistance` | Distress immediacy must not be weakened when trained. |
| `persons on board / persons missing / persons injured` | Numeric and casualty status changes must not fuzz-match. |
| `Mayday relay / Mayday` | Relay format is not the same as own-vessel distress declaration. |
| `position / last known position / bearing from` | Search and rescue wording must preserve the report object. |

Must-stay-wrong categories:

- Pan-Pan, Securite, routine traffic, or VTS requests in Mayday signal drills.
- Generic `emergency`, `help`, `SOS`, or `alarm` as replacements for Mayday
  unless a specific item later trains an accepted local contrast.
- Changed casualty type: fire, flooding, collision, grounding, sinking,
  capsize, man overboard, and abandon ship are not interchangeable.
- Changed vessel status: `sinking`, `disabled`, `adrift`, `aground`, and
  `not under command` must stay distinct.
- Changed numbers: persons on board, persons missing, MMSI, position,
  channel, time, bearing, distance, and ETA.

Matcher-policy risks:

- The typo layer must not accept `may day`, `made day`, or unrelated ordinary
  words unless an item explicitly lists a reviewed spelling form.
- Repetition count matters in signal drills. Do not let any repeated distress,
  urgency, or safety signal satisfy another signal family.
- Do not add broad `emergency` aliases. They are too vague for distress
  training and may erase Pan-Pan/Mayday boundaries.

## Traffic / Collision Risk Radar

Dangerous minimal pairs:

| Pair | Risk |
| --- | --- |
| `risk of collision / danger of collision` | Existing policy says this boundary must not collapse. |
| `CPA / TCPA` | Closest point and time to closest point are different report values. |
| `crossing / overtaking / head-on` | Encounter types drive different actions. |
| `give way / stand on` | Opposite obligations. |
| `keep clear / keep course` | Opposite or materially different behavior. |
| `alter course to port / alter course to starboard` | Opposite maneuver. |
| `pass port to port / pass starboard to starboard` | Opposite passing arrangement. |
| `reduce speed / increase speed / maintain speed` | Opposite speed instruction. |
| `turn / alter course / change heading` | Related, but should stay item-specific unless reviewed. |
| `ahead / astern / abeam / on port bow / on starboard bow` | Relative bearing changes traffic meaning. |
| `clear astern / clear ahead` | Opposite traffic position. |
| `I will / I am / request you` | Intention, current action, and instruction/request must stay separate. |

Must-stay-wrong categories:

- Opposite side, direction, bearing, or passing arrangement.
- Changed action verb: alter, maintain, reduce, stop, proceed, keep clear,
  stand on, give way.
- Changed encounter type: crossing, overtaking, head-on, close-quarters,
  traffic ahead.
- Changed actor: own vessel, other vessel, VTS, pilot, tug, ferry, sailing
  vessel, vessel on port/starboard side.
- Changed numeric values: CPA, TCPA, bearing, range, speed, heading, course,
  channel, time.
- Collision paraphrases that erase trained wording, especially `danger`,
  `problem`, `near miss`, `close`, and `crash`.

Matcher-policy risks:

- Short nautical tokens are risky here. `port`, `starboard`, `aft`, `astern`,
  `ahead`, `abeam`, `CPA`, and `TCPA` should not be typo-fuzzed into nearby
  words.
- Avoid global equivalence between `heading`, `course`, `bearing`, and
  `direction`; existing navigation boundaries must continue into traffic
  drills.
- Do not accept broad ordinary-English collision paraphrases. Use explicit
  accepted answers per item.

## VTS / Port Control Risk Radar

Dangerous minimal pairs:

| Pair | Risk |
| --- | --- |
| `VTS / port control / marina control` | Authority and operating context may differ by item. |
| `instruction / advice / information / permission` | VTS authority wording must stay item-specific. |
| `reporting point / waypoint / destination / berth` | Report object changes meaning. |
| `report at / report passing / report when abeam` | Reporting trigger changes timing. |
| `proceed / hold position / wait outside / stand by` | Movement authority changes. |
| `enter / depart / shift berth / leave berth` | Port-movement actions are distinct. |
| `pilot required / pilot not required / pilot requested` | Requirement, negation, and request must not blur. |
| `tug assistance / tow required / pilot boat` | Support-vessel functions differ. |
| `channel 12 / channel 13 / channel 14 / channel 16` | VTS channels must not fuzz-match. |
| `north entrance / south entrance / fairway / approach channel` | Location changes route authority. |
| `green buoy / red buoy / reporting point Alpha` | Marker names and colors must stay exact. |
| `one-way traffic / two-way traffic / traffic suspended` | Traffic-state wording changes clearance. |

Must-stay-wrong categories:

- Treating VTS advice, information, permission, and instruction as synonyms.
- Replacing VTS/port-control calls with marina/berth-service calls when the
  item trains a traffic authority exchange.
- Changed route, reporting point, entrance, fairway, buoy, berth, channel, ETA,
  pilot time, tug time, or vessel name.
- Negation loss: `pilot required`, `pilot not required`, `do not enter`,
  `entry permitted`, `traffic suspended`, and `traffic resumed` must stay
  explicit.
- Changed movement authority: hold, proceed, enter, depart, shift, wait,
  anchor, berth, and clear the fairway.

Matcher-policy risks:

- VTS will create many locally safe aliases that are unsafe globally. For
  example, `port control` may be safe in one item and wrong in another if the
  trained call is `VTS`.
- Permission/instruction wording should not be normalized into generic
  `clearance`. Clearance may be a trained phrase only when the item says so.
- Exact named locations and reporting points need numeric/location protection
  like existing channels, ETAs, headings, and bearings.

## Cross-Branch Must-Stay-Wrong Categories

These categories should remain wrong unless a future item explicitly lists a
reviewed accepted answer:

- Safety, urgency, and distress signal substitution:
  `Securite`, `Pan-Pan`, and `Mayday`.
- Generic ordinary-English emergency vocabulary replacing standard radio
  signals.
- Changed operational state: safe, urgent, distressed, disabled, adrift,
  aground, sinking, on fire, flooding, not under command, restricted in ability
  to manoeuvre.
- Changed assistance request: tow, tug, pilot, medical advice, medical
  assistance, evacuation, escort, fire assistance, pumping assistance.
- Changed radio procedure: `say again`, `repeat`, `read back`, `roger`,
  `affirmative`, `negative`, `over`, `out`, `stand by`, `wait out`.
- Changed traffic obligation or intention: give way, stand on, keep clear,
  alter course, maintain course, reduce speed, stop engines, proceed.
- Changed authority relationship: request, report, instruction, advice,
  permission, clearance, information.
- Any changed digit-bearing datum: channel, MMSI, call sign, position, latitude,
  longitude, bearing, heading, course, CPA, TCPA, distance, speed, ETA, UTC
  time, persons on board.
- Any changed side, direction, or relative position: port, starboard, ahead,
  astern, abeam, north, south, east, west, entrance side, fairway side.
- Negation changes, especially `do not`, `not required`, `no traffic`,
  `traffic suspended`, `unable`, and `cannot`.

## Matcher-Policy Risk Register

| Risk | Impact | Recommendation |
| --- | --- | --- |
| Signal-family aliasing | Could accept Mayday for Pan-Pan, or Pan-Pan for safety. | Keep signal words protected and branch-specific. |
| Broad emergency synonyms | Could turn ordinary English into accepted distress/urgency radio. | Do not add global aliases for `help`, `emergency`, `problem`, or `SOS`. |
| Typos on short nautical words | Could swap port/starboard, CPA/TCPA, aft/astern, over/out. | Keep short high-risk terms out of permissive typo matching. |
| Numeric fuzzing | Could change channel, time, bearing, distance, speed, CPA, TCPA, or persons aboard. | Continue existing no-fuzz policy for numeric tokens. |
| Local synonym leakage | A synonym safe for one item may become unsafe in another branch. | Add accepted variants item-locally and regression-test rejects nearby. |
| Procedure-word collapse | Could accept acknowledgement for confirmation, readback for repetition, or closing word for reply invitation. | Keep existing radio-procedure dangerous pairs active in every new branch. |
| Authority-word collapse | Could treat VTS instruction, advice, information, permission, and clearance as one concept. | Require item-level decision for authority wording. |
| Negation loss | Could accept `pilot required` for `pilot not required`, or `enter` for `do not enter`. | Add explicit reject examples for every negated instruction. |
| Repetition normalization | Could accept repeated wrong signal families. | Preserve signal repetition checks and reject cross-family repeated forms. |
| Accent and hyphen normalization | Could help legitimate spelling but also hide signal-family mistakes. | Allow reviewed forms like Pan-Pan spacing/hyphen variants only item-locally. |

## Recommended Regression Pair Seeds

For the next content batches, seed top-level dangerous-pair groups before
runtime merge:

- `Securite / Pan-Pan / Mayday`
- `safety / urgency / distress`
- `Pan-Pan / Mayday`
- `engine failure / steering failure / fire / flooding`
- `disabled / adrift / aground / sinking`
- `medical advice / medical assistance / evacuation`
- `Mayday / Mayday relay`
- `collision / grounding / man overboard / abandon ship`
- `risk of collision / danger of collision`
- `CPA / TCPA`
- `give way / stand on / keep clear`
- `alter course to port / alter course to starboard`
- `pass port to port / pass starboard to starboard`
- `reduce speed / increase speed / maintain speed`
- `VTS / port control / marina control`
- `instruction / advice / information / permission / clearance`
- `reporting point / waypoint / destination / berth`
- `proceed / hold position / wait outside / stand by`
- `pilot required / pilot not required / pilot requested`
- exact channels, times, positions, bearings, distances, speeds, CPA/TCPA,
  persons on board, reporting points, and named locations

## Copy-Ready Director-Engineer Card

Task result: PASS for report-only Sea Speak Linguist risk radar.

Changed files:

- `content/captain-ether/roles/sea-speak-linguist/reports/office-background-next-branch-risk-radar-2026-05-27.md`

Main findings:

- The likely next high-risk branches are `urgency_panpan`,
  `distress_mayday`, `traffic_collision`, and `vts_port_control`.
- Do not propose broad synonym expansion for these branches. Use item-local
  accepted answers only.
- Keep signal-family boundaries strict: `Securite / Pan-Pan / Mayday`.
- Keep branch-state boundaries strict: `safety / urgency / distress`.
- Add dangerous-pair regression before merging any Pan-Pan, Mayday,
  traffic/collision, or VTS batch.
- Protect exact numeric, positional, channel, time, CPA/TCPA, route, reporting
  point, assistance-type, and negation tokens.
- Treat VTS authority wording as high risk: instruction, advice, information,
  permission, and clearance should not be global synonyms.

Validation:

- Report-only review against role rules, handoff, answer policy, existing
  dangerous-pair taxonomy, and branch taxonomy.
- No runtime tests run; no content data or matcher files changed.

Forbidden files preserved:

- runtime/API/UI/content data, `starter.json`, batches, matcher, router,
  registry, auth/platform, Watch Officer, Nav Desk, Game Director docs,
  production config, deploy/FTP, and secrets.
