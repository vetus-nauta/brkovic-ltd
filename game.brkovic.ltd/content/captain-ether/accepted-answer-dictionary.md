# Captain Ether Accepted Answer Dictionary

Task label: 2026-05-27
Prepared: 2026-05-26

Scope: Sea Speak linguist pass over `starter.json`.

Principle: accept clear maritime meaning, standard radio variants, minor spelling,
spacing, punctuation, and small grammar slips. Do not accept ordinary English
paraphrases when they weaken or change the Sea Speak term.

## Applied Dictionary

| Item | Canonical `target_text` | `accepted_answers` added | Safe variants / synonyms | Must stay wrong | Reason |
|---|---|---|---|---|---|
| `word_port_001` | `port` | `port side` | `the port side` via optional article | `left`, `left side`, `harbour` | `port` is the nautical side term; ordinary `left` is not Sea Speak. |
| `word_starboard_001` | `starboard` | `starboard side` | `the starboard side` via optional article | `right`, `right side` | `starboard` is the nautical side term; ordinary `right` should not pass. |
| `word_astarn_001` | `astern` | none | minor typos only | `aft`, `behind`, `abaft`, `stern` | `astern` means behind the vessel; `aft`/`stern` point to another onboard concept. |
| `expr_say_again_001` | `say again` | none | `please say again`, `say again please` | `repeat`, `please repeat`, `again` | Radio procedure prefers `say again`; `repeat` is not the trained form. |
| `expr_stand_by_001` | `stand by` | none | `please stand by` | `wait`, `hold on`, `standing by` | Imperative `stand by` is not the same as reporting `standing by`. |
| `expr_keep_clear_001` | `keep clear` | `keep clear of me`; `keep well clear` | `please keep clear` | `stay away`, `move away`, `avoid me` | `keep clear` is the collision-avoidance term; added object/intensifier are safe. |
| `phrase_this_is_aurora_001` | `This is sailing yacht Aurora.` | `this is aurora`; `this is sy aurora`; `this is s y aurora`; `sy aurora`; `s y aurora` | `this is the sailing yacht aurora`; `s/y aurora` | `aurora` alone, `this is motor yacht aurora`, `aurora here` | Safe vessel-ID variants keep the same vessel and sailing-yacht identity. |
| `phrase_require_assistance_001` | `I require assistance.` | `i require help`; `i need help`; `need assistance`; `need help`; `assistance required`; `assistance needed` | `i need assistance`, `require assistance` | `mayday`, `help me`, `i want service`, `i am in distress` | Assistance/help variants are equivalent; distress calls or service requests change severity. |
| `phrase_position_is_001` | `My position is two cables south of the marina.` | `my position is two cable lengths south of the marina`; `position is two cable lengths south of the marina`; `my position is two cable south of the marina`; `position is two cable south of the marina` | optional `the` | `near the marina`, `south of marina` without distance, `two miles south`, `north of the marina` | Distance unit and bearing must remain exact. |
| `expr_switch_channel_001` | `switch to channel seven two` | `change channel seven two`; `go to channel seven two`; `switch to vhf channel seven two`; `change to vhf channel seven two`; `channel seven two`; `channel seventy two`; `channel 72` | `channel seven-two` via punctuation cleanup | `switch off channel seven two`, `channel seven one`, `go to marina` | Channel number and channel-change action must stay intact. |
| `phrase_altering_course_001` | `I am altering course to starboard.` | `i alter course to starboard`; `alter course to starboard`; `i am changing course to starboard`; `changing course to starboard`; `i am altering course starboard`; `altering course starboard`; `i alter course starboard`; `alter course starboard`; `i am changing course starboard`; `changing course starboard` | missing `to` accepted directly as a small grammar slip | `turn right`, `altering course to port`, `changing channel to starboard` | `change course` is safe item-local wording; `right`/`port` lose or reverse Sea Speak meaning. |
| `phrase_request_berth_001` | `Requesting berth.` | `requesting a berth`; `i request berth`; `i request a berth` | `request berth`, optional article | `request mooring`, `request dock`, `request anchor`, `berth confirmed` | A berth request is not the same as mooring, docking, anchoring, or confirmation. |
| `phrase_restricted_visibility_001` | `I am navigating in restricted visibility.` | `i am proceeding in restricted visibility`; `proceeding in restricted visibility`; `in restricted visibility`; `restricted visibility` | optional article before `restricted visibility` | `poor visibility`, `reduced visibility`, `fog`, `limited visibility` | `restricted visibility` is the nautical/COLREG term; plain weather paraphrases should train back to it. |
| `phrase_man_overboard_001` | `Man overboard.` | `person overboard`; `mob` | `m.o.b.` via compact matching | `man aboard`, `man on board`, `crew missing`, `falling overboard` | MOB/person-overboard report is the emergency condition; similar onboard wording reverses meaning. |
| `word_bow_001` | `bow` | none | `the bow` | `front`, `ahead`, `bow line` | `bow` is the vessel part; `ahead` is a relative direction. |
| `word_stern_001` | `stern` | none | `the stern` | `back`, `aft`, `astern` | `stern` is the vessel part; `astern` is behind the vessel. |
| `word_ahead_001` | `ahead` | none | minor typos only | `forward`, `bow`, `in front` | `ahead` is the relative direction; `bow` is a vessel part. |
| `word_abeam_001` | `abeam` | `on the beam` | optional article in `on the beam` | `alongside`, `beside`, `beam` | `abeam` is a relative bearing; `alongside` implies being next to a berth/vessel. |
| `expr_over_001` | `over` | none | minor typo only | `out`, `over and out`, `finished` | `over` invites reply; `out` closes the exchange. |
| `expr_out_001` | `out` | none | exact only | `over`, `over and out`, `bye` | `out` ends communication; `over and out` is contradictory for this drill. |
| `expr_roger_001` | `roger` | none | minor typo only | `affirmative`, `yes`, `wilco`, `copy` | `roger` means received/understood, not yes or will comply. |
| `expr_affirmative_001` | `affirmative` | none | minor typo only | `roger`, `yes`, `correct`, `confirmed` | The trained radio answer is `affirmative`; `roger` only acknowledges receipt. |
| `expr_negative_001` | `negative` | none | minor typo only | `no`, `deny`, `not correct` | The trained radio answer is `negative`; ordinary `no` is too free for this item. |
| `expr_go_ahead_001` | `go ahead` | none | `please go ahead` | `continue`, `go forward`, `proceed`, `ahead` | Radio `go ahead` means transmit now; movement wording changes sense. |
| `expr_read_back_001` | `read back` | `read back the message`; `read it back` | `readback` via compact matching | `say again`, `repeat`, `roger` | `read back` is receiver confirmation; `say again` asks the sender to repeat. |
| `phrase_call_marina_001` | `Marina Control, this is sailing yacht Aurora.` | `marina control sailing yacht aurora`; `marina control this is sy aurora`; `marina control this is s y aurora`; `marina control sy aurora`; `marina control s y aurora` | `marina control this is the sailing yacht aurora`; `s/y aurora` | `aurora to marina control`, `marina control this is motor yacht aurora`, `marina control aurora` | Added variants keep called station first and preserve vessel identity. |
| `phrase_my_heading_001` | `My heading is zero nine zero degrees.` | `heading is zero nine zero degrees`; `my heading is zero nine zero`; `heading zero nine zero`; `my heading is zero nine zero deg`; `heading zero nine zero deg`; `heading is zero nine zero deg`; `zero nine zero degrees`; `zero nine zero deg`; `zero nine zero`; `090 degrees`; `090 deg`; `090` | `090 degrees`, `090 deg`, `090` accepted directly | `90 degrees`, `east`, `course zero nine zero`, `bearing zero nine zero` | Heading needs the three-digit form; course/bearing are different navigational data. |
| `phrase_my_speed_001` | `My speed is five knots.` | `speed is five knots`; `my speed five knots`; `my speed is five kts`; `speed five kts`; `speed is five kts`; `five knots`; `5 knots`; `five kts`; `5 kts` | `5 knots`, `5 kts` accepted directly | `slow speed`, `five miles`, `five nautical miles`, `five knot wind` | Speed and unit must remain vessel speed in knots. |
| `phrase_request_fuel_001` | `Requesting fuel berth.` | `requesting a fuel berth`; `i request fuel berth`; `i request a fuel berth` | optional article | `fuel dock`, `fuel station`, `request fuel`, `request berth` | The request is specifically for a fuel berth, not generic fuel or a normal berth. |
| `phrase_eta_001` | `My ETA is one four zero zero UTC.` | `eta is one four zero zero utc`; `my eta one four zero zero utc`; `my eta is one four zero zero zulu`; `eta one four zero zero zulu`; `my eta is one four zero zero z`; `eta one four zero zero z`; `one four zero zero utc`; `one four zero zero zulu`; `one four zero zero z`; `1400 utc`; `14 00 utc`; `1400z`; `1400 z`; `14 00z`; `14 00 z` | `1400 UTC`, `14:00 UTC`, `1400Z` accepted directly after normalization | `fourteen hundred local`, `two pm`, `eta one five zero zero utc`, `eta soon` | Time must remain 1400 UTC/Zulu; local or vague time changes meaning. |
| `phrase_reduce_speed_001` | `I am reducing speed.` | `i reduce speed`; `reduce speed`; `i am reducing my speed`; `reducing my speed` | minor tense/grammar slips | `slow down`, `stop engine`, `increase speed`, `reduced speed` as completed status | The item reports active reduction, not stopping, increasing, or merely being already reduced. |
| `phrase_will_pass_astern_001` | `I will pass astern of you.` | `i am passing astern of you`; `pass astern of you`; `i will pass astern of your vessel`; `will pass astern of your vessel`; `passing astern of your vessel` | `passing astern of you` | `pass ahead of you`, `pass port side`, `pass behind you`, `pass astern` without object | `astern of you/your vessel` preserves the collision-avoidance relation. |
| `phrase_traffic_information_001` | `Request traffic information.` | `request traffic info`; `requesting traffic info`; `i request traffic info`; `request information about traffic`; `requesting information about traffic`; `request information on traffic` | `requesting traffic information`, `i request traffic information` | `request weather information`, `traffic advisory`, `report traffic`, `traffic information received` | The item is a request for traffic information, not another information type or a report. |
| `phrase_pan_pan_001` | `Pan-Pan, Pan-Pan, Pan-Pan.` | none | hyphen/spacing/case variants; `panpan panpan panpan` via compact matching | one or two `pan-pan` calls, `mayday`, `securite` | Urgency signal must remain Pan-Pan repeated three times. |
| `phrase_securite_001` | `Securite, Securite, Securite.` | `sécurité sécurité sécurité` | punctuation/case variants | one or two calls, `pan-pan`, `mayday`, `security` | Safety signal must remain Securite/Sécurité repeated three times. |
| `phrase_mayday_001` | `Mayday, Mayday, Mayday.` | none | `may day may day may day` through compact matching | one or two calls, `pan-pan`, `mayday relay` | Distress signal must remain Mayday repeated three times; relay is a different call. |
| `phrase_engine_failure_001` | `I have engine failure.` | `engine has failed`; `engine failed`; `my engine has failed`; `my engine failed` | `i have an engine failure` via optional article | `engine trouble`, `mechanical problem`, `out of fuel`, `propeller fouled` | Added variants keep actual engine failure; broader machinery trouble is not precise enough. |
| `phrase_taking_water_001` | `I am taking on water.` | `i am taking in water`; `taking in water`; `i have water ingress`; `water ingress` | minor article/tense slips | `leaking`, `sinking`, `wet deck`, `water on board` | Water ingress/taking in water is equivalent; leaking or sinking changes severity/state. |
| `phrase_not_under_command_001` | `I am not under command.` | `vessel not under command`; `my vessel is not under command`; `nuc`; `n u c` | `n.u.c.` via explicit abbreviation form | `not in command`, `not under control`, `restricted in ability to manoeuvre`, `cannot steer` | `not under command` is a legal vessel status; near phrases may indicate different COLREG categories. |
| `phrase_risk_collision_001` | `There is risk of collision.` | `risk of collision exists`; `collision risk`; `there is collision risk`; `there is a collision risk` | optional article in `there is a risk of collision` | `danger of collision`, `possible collision`, `collision happened`, `near miss` | The Sea Speak term is `risk of collision`; event/result wording changes meaning. |

## Matcher Alias Suggestions

No matcher code change was required for this pass. The current token matcher already
handles punctuation, spacing, optional `please`/articles, number words, and small
typos.

Future safe alias candidates, if answer logs show repeated misses:

- `zulu` / `z` -> `utc` for time reports.
- `kts` / `kt` -> `knots` for speed reports.
- `deg` -> `degrees` for heading reports.
- `sy` and `s y` -> sailing-yacht vessel identifier, but this may need item-aware
  handling because it expands one token into two concepts.

Avoid global `change -> alter`: `change` is already used safely for channel
switching, while course alteration should remain item-local to avoid false
matches.
