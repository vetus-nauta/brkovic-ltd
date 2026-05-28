# NavDesk Maritime Glossary - 2026-05-28

**Task:** `BRK-MVP-LOC-007`  
**Role:** Localization Architect  
**Status:** For Director / owner review  
**Scope:** report-only terminology and localization rules  
**Product code:** untouched  
**Production / FTP / backend / data / secrets / OpenAI:** untouched

## 1. Director Summary

NavDesk must not be localized as a normal marketing page. It is a working navigation desk with UI text, maritime terms, safety-critical notices, generated documents, print/PDF output, radio templates and the owner's explanatory tone living together.

Current language strategy:

- English is the primary public site language.
- Russian is the active additional UI language and the owner's working authoring language.
- Target roadmap languages are `de`, `it`, `es`, regional `srb/mne/hr`, and Mandarin (`zh`).
- Only `en` and `ru` are currently selectable in the frontend.

Main rule: translate UI, explain standards, but do not freely translate the standards themselves.

Locked / sensitive examples:

- `Mayday`, `Mayday Relay`, `Pan-Pan`, `Securite` / `Sécurité`, `MMSI`, `VHF`, `VTS`, `UTC`, `ETA`, `GPS`, `GNSS`, `HW`, `LW`, `UKC`, `nm`, `kn`.
- Coordinates, radio outputs, formulas, thresholds, signed-watch records and disclaimer text.
- The informal internal idea of "dog watch" must not become visible UI wording. If needed, mark such periods neutrally as night/short/high-fatigue watch intervals.

## 2. Sources Read

- `docs/brkovic_ltd_project_office/cabinets/localization-architect/task-0007-navdesk-maritime-glossary.md`
- `docs/brkovic_ltd_project_office/reports/frontend-i18n-surface-step2-2026-05-28.md`
- `docs/brkovic_ltd_project_office/reports/localization-page-readiness-step2-2026-05-28.md`
- `docs/brkovic_ltd_project_knowledge.md`
- `docs/brkovic_ltd_project_office/reports/target-language-matrix-2026-05-28.md`
- `navdesk.html`
- `navdesk-watch.html`
- `navdesk-tides.html`
- `navdesk-route.html`
- `navdesk-ukv.html`
- `navdesk-english.html`
- `js/navdesk.js`
- `lang/ru.json`
- `lang/en.json`

## 3. Classification Rules

Use four classes for every NavDesk string:

| Class | Meaning | Localization rule |
| --- | --- | --- |
| UI | Navigation, buttons, labels, empty states, helper text | Can be translated through `lang/*.json` after key inventory. |
| Maritime standard | Stable nautical term, abbreviation, unit or format | Keep standard abbreviation/name; translate only explanation. |
| Safety-critical | Disclaimer, radio emergency, GPS/tide/depth warning, rest-control threshold, print document | Requires specialist review and QA; no free AI translation. |
| Owner-voice | Explanatory, educational or editorial text in the Brkovic tone | Requires owner meaning approval before public target languages. |

Implementation consequence:

- `lang/en.json` and `lang/ru.json` can hold UI and approved explanatory text.
- Future `de/it/es/sr/zh` files must not be generated until key coverage, storage, owner approval and QA gates exist.
- Emergency/radio outputs should use a locked phrase registry, not general translation keys.

## 4. NavDesk Common Shell And Disclaimer

| English term / source | Russian working term | Class | Notes for `de/it/es` | Warnings for `srb/mne/hr` and Mandarin |
| --- | --- | --- | --- | --- |
| NavDesk | Штурманский стол | UI / owner-voice | Treat as product section name; do not literalize as office furniture. | Regional languages may prefer a practical "navigation desk/tools" phrase; Mandarin needs a concise functional label. |
| navigation tools | навигационные инструменты | UI | Straightforward, but keep practical tone. | Avoid official-sounding overclaim that implies certified navigation system. |
| preliminary calculations | предварительные расчеты | Safety-critical | Must preserve "preliminary" in every language. | Mandarin and regional wording must not imply official/guaranteed calculation. |
| disclaimer / terms of use | условия использования / предупреждение | Safety-critical | Legal-safety wording requires review, not marketing polish. | Must be reviewed as a complete paragraph; do not split into casual UI snippets. |
| official sources | официальные источники | Safety-critical | Use wording that clearly points outside NavDesk. | Avoid ambiguity between official hydrographic data and site data. |
| actual conditions | фактическая обстановка | Safety-critical | Preserve "check actual conditions". | Mandarin must avoid a soft "reference only" line that hides risk. |
| day mode / night mode | дневной режим / ночной режим | UI | Short labels; icons can carry meaning. | Do not translate as separate pages; it is a screen mode switch. |
| local time | местное время | Maritime standard / UI | Keep `Local time` acceptable in EN; translate labels only. | Avoid regional ambiguity with ship's time unless separately defined. |
| UTC | UTC / всемирное координированное время | Maritime standard | Keep `UTC`; explanation can be localized. | Keep Latin acronym in all languages. |
| Print / PDF | печать / PDF | UI / safety-critical when document output | Preserve document intent; print layouts need locale QA. | Mandarin line length and regional button width must be tested. |
| Save / Share / Copy | сохранить / поделиться / копировать | UI | Normal UI strings. | For signed watch documents, "share" can expose safety/log data; keep warning flow if added. |

Common shell rule:

- The disclaimer remains common to NavDesk entry and tools. Do not duplicate or rewrite per tool without a separate safety/legal content task.
- Day/night is a NavDesk-specific behavior and must remain visible across localized pages.

## 5. Watch Log, Signed Watch, Rest Control, Reminder

| English term / source | Russian working term | Class | Notes for `de/it/es` | Warnings for `srb/mne/hr` and Mandarin |
| --- | --- | --- | --- | --- |
| watch log | вахтенный журнал | Maritime standard / UI | Use nautical log terminology, not generic "work journal". | Regional variants differ; Mandarin should be checked against maritime training usage. |
| passage / voyage route | переход / маршрут | Maritime standard / owner-voice | Keep distinction: passage as sea trip, route as planned line. | Do not collapse into tourist route in regional/zh. |
| watch | вахта | Maritime standard | Standard nautical term; UI may need short form. | In Mandarin, choose term for watchkeeping duty, not general "guard". |
| shift | смена | UI / maritime standard | Use for a scheduled time block; do not replace every "watch". | Regional variants may use different operational terms. |
| watchkeeper | вахтенный | Maritime standard | Use person on duty, not generic worker. | Mandarin must avoid security guard wording. |
| senior watchkeeper / watch leader | старший вахты | Maritime standard | Prefer operational role, not corporate "senior". | Regional term requires nautical check. |
| support watchkeeper / second watchkeeper | подвахтенный | Maritime standard / owner-voice | No direct universal term; explain as additional person on watch. | High risk: do not use literal calques. Mandarin needs functional phrase. |
| captain | капитан | Maritime standard | For document fields use Captain; for yacht context Skipper may appear elsewhere. | Keep consistent within watch document. |
| first mate / first officer | первый помощник | Maritime standard | Choose one English canonical label in UI; avoid mixing. | Regional and Mandarin terms vary by vessel size/status. |
| crew | экипаж / состав | UI / maritime standard | "Crew" for people; "watch composition" for duty roster. | Avoid passenger/crew confusion. |
| schedule / roster | расписание вахт | UI / maritime standard | Roster may be clearer in document export. | Mandarin needs short labels for table columns. |
| manual schedule | ручное расписание | UI | Straightforward. | No special risk. |
| recommended rotation | рекомендованный режим | UI / safety-critical | Must not imply compliance guarantee. | Keep "recommendation" weak, with fatigue warning preserved. |
| 3/3, 4/4, 4/8, 6/6, 2/2 | 3/3, 4/4, 4/8, 6/6, 2/2 | Maritime standard | Keep numeric patterns. Explain if needed. | Universal notation, but meaning must be described locally. |
| night watch interval | ночной интервал вахты | UI / safety-critical | Use neutral label. | Do not expose "dog watch" as UI term. |
| short watch / high-fatigue interval | короткая вахта / участок повышенной усталости | Safety-critical | Neutral warning language. | Avoid slang in all languages. |
| sign watch / sign off shift | подписать смену / подписать вахту | Safety-critical | Document action; wording must be precise. | Regional/zh must not mean "subscribe". |
| signed watch | подписанная вахта | Safety-critical | Signed record; must be immutable or marked if edited. | Needs legal/document review later. |
| rest control | контроль отдыха | Safety-critical | Preserve thresholds and warnings exactly. | High-risk for local labor/maritime rules; do not imply legal compliance. |
| rolling 24 hours | скользящие 24 часа | Safety-critical | Keep rolling-window meaning. | Mandarin and regional terms need specialist review. |
| continuous rest | непрерывный отдых | Safety-critical | Preserve "continuous". | High risk if translated as total rest. |
| reminder 15 minutes before watch | напомнить за 15 минут до вахты | UI / safety-critical | Browser notification wording must be direct. | Make clear this is device/browser dependent. |
| log entry | запись в журнале | UI / maritime standard | Straightforward. | No special risk. |
| course / speed / position | курс / скорость / позиция | Maritime standard | Keep standard navigation terms. | Coordinates and units must not be localized creatively. |
| dead reckoning | счисление пути | Maritime standard | Use formal nautical term; do not translate as "calculation". | Mandarin/regional require nautical verification. |
| wind / sea | ветер / море | Maritime standard | Sea state may need Beaufort/Douglas context later. | Avoid generic "weather" only. |
| local draft storage | локальное сохранение черновика | UI / safety-critical | Must state "on this device" when visible. | Privacy/loss warning may need localized exact wording. |

Watch-specific rule:

- Keep "watch" and "shift" separate: `watch` = duty/watchkeeping concept; `shift` = scheduled block/change.
- Do not call highlighted late/night periods "dog watch" in visible UI. If a nautical note is ever needed, put it into an education glossary, not the operational table.
- Signed watches, rest-control warnings and print documents are safety-critical. They need locked copy and regression tests in day/night, desktop/tablet/mobile and A4/PDF.

## 6. Tides, Safe Window, Depth, Draught, UKC

| English term / source | Russian working term | Class | Notes for `de/it/es` | Warnings for `srb/mne/hr` and Mandarin |
| --- | --- | --- | --- | --- |
| tide | прилив / отлив | Maritime standard | Translate as tidal phenomenon, not only "incoming tide". | Regional coast vocabulary varies; Mandarin must distinguish tide event vs sea level. |
| high water / HW | полная вода / HW | Maritime standard / safety-critical | Keep `HW`; translate explanation. | Keep Latin acronym; do not replace with local-only abbreviation. |
| low water / LW | малая вода / LW | Maritime standard / safety-critical | Keep `LW`; translate explanation. | Same as HW. |
| tide event | событие прилива | UI / maritime standard | Could be "tide events" in EN; table heading must be compact. | Avoid implying forecast certainty. |
| tide station | станция прилива | Maritime standard | Use station/gauge term consistently. | Regional/zh require official-data nuance. |
| safe passage window | окно безопасного прохода | Safety-critical | Preserve "safe" carefully; better "calculated safe window" if approved. | Must not imply certified guarantee. |
| charted depth | глубина на карте | Maritime standard / safety-critical | Use charted depth, not measured depth. | Mandarin must distinguish charted from live sounder depth. |
| available depth | доступная глубина | Safety-critical | Formula-bound term. | Do not paraphrase as "safe depth" unless calculated condition is true. |
| required depth | требуемая глубина | Safety-critical | Formula-bound term. | Preserve as required = draught + UKC. |
| draught / draft | осадка | Maritime standard / safety-critical | Prefer formal `draught` in British-maritime style; `draft` acceptable as helper. | Mandarin/regional need vessel-depth term, not document draft. |
| UKC / under-keel clearance | UKC / запас под килем | Maritime standard / safety-critical | Keep `UKC`; explanation localized. | Do not translate acronym; keep formula exact. |
| depth below keel | глубина под килем | Safety-critical | Distinguish from UKC and charted depth. | High risk for Mandarin/regional if terms collapse. |
| manual input | ручной ввод | UI | Straightforward. | No special risk. |
| auto mode | авто / автоматический режим | UI | Do not overclaim "official data". | If API fallback/demo exists, source must be explicit. |
| weekly tide and depth graph | недельный график прилива и глубины | UI / safety-critical | Print/PDF title must stay factual. | Mandarin line length and chart legend must be tested. |
| enough / below settings | достаточно / ниже настройки | Safety-critical | Use condition labels, not emotional colors only. | Keep thresholds visible; color cannot be sole cue. |
| source | источник | Safety-critical | Source label must always be visible in reports. | Avoid ambiguity between demo/local/API source. |
| meters / feet | m / ft | Maritime standard | Keep unit abbreviations. | Do not localize unit symbols. |

Tides rule:

- Formula copy is locked: available depth = charted depth + tide; required depth = draught + UKC.
- Every localized report must preserve source, date, place/station, units, draught, UKC, charted depth and safety disclaimer.
- Search suggestions must not dump a huge list on one letter. This is UX/frontend, but localization must keep "type at least 2 characters" or equivalent warning concise.

## 7. Route Planning, Orthodrome, Loxodrome, ETA, Fuel

| English term / source | Russian working term | Class | Notes for `de/it/es` | Warnings for `srb/mne/hr` and Mandarin |
| --- | --- | --- | --- | --- |
| route planning | планирование маршрута / перехода | UI / maritime standard | Keep route vs passage distinction. | Avoid tourist/travel route wording. |
| great-circle route / orthodrome | ортодромия | Maritime standard | `Great-circle route` is clearer in EN UI; orthodrome can appear as technical label. | Regional languages may use local academic term; Mandarin needs specialist check. |
| rhumb line / loxodrome | локсодромия | Maritime standard | `Rhumb line` is practical EN UI; loxodrome can appear as technical label. | Same risk as orthodrome. |
| true course | истинный курс | Maritime standard | Keep true vs magnetic distinction. | Mandarin/regional must not drop "true". |
| initial true course | начальный истинный курс | Maritime standard | Preserve initial/final. | Safety-critical in print. |
| final true course | конечный истинный курс | Maritime standard | Preserve final. | Safety-critical in print. |
| constant true course | постоянный истинный курс | Maritime standard | Used for rhumb line. | Must not become "average course". |
| waypoint | путевая точка | Maritime standard | Standard term; can keep WPT abbreviation in advanced glossary. | Regional/zh require nautical/plotter term. |
| intermediate coordinates | промежуточные координаты | Maritime standard | Straightforward. | Keep coordinate formats unchanged. |
| latitude / longitude | широта / долгота | Maritime standard | Standard. | Keep N/S/E/W and numeric formats. |
| marine coordinate format | морской формат координат | UI / maritime standard | `DD° MM.mmm'` must stay exact. | Do not localize symbols. |
| decimal degrees | десятичные градусы | UI / maritime standard | Standard GIS/nav term. | No special risk. |
| nautical mile / nm | морская миля / nm | Maritime standard | Keep `nm`; do not convert unless user selects units. | Unit symbol stays Latin. |
| distance from start | от старта / от точки выхода | UI / maritime standard | Prefer "from departure" in formal report. | Avoid vague "start" in print documents if possible. |
| departure / arrival | пункт выхода / пункт прихода | Maritime standard | Port/point depending context. | Regional/zh need route context. |
| ETA | ETA / ожидаемое время прибытия | Maritime standard | Keep acronym; explain once. | Keep Latin acronym. |
| fuel consumption | расход топлива | UI / safety-critical | State units clearly: l/h, total, reserve. | Regional/zh must not hide units. |
| fuel reserve | запас топлива | Safety-critical | Preserve reserve percentage/value. | Print/PDF must show assumptions. |
| preset route | пример маршрута | UI | Use as example, not recommendation. | Avoid implying approved passage plan. |

Route rule:

- English public labels should prefer practical navigation terms first: `great-circle route` and `rhumb line`; technical terms `orthodrome/loxodrome` can stay in headings or tooltips.
- Route print/PDF is a calculation report, not a voyage plan approval. Keep source assumptions and disclaimer close to outputs.
- Fuel values are estimates; localization must preserve units and reserve assumptions.

## 8. UKV / VHF / Radio Spelling / Mayday / Pan-Pan / Securite / Seaspeak

| English term / source | Russian working term | Class | Notes for `de/it/es` | Warnings for `srb/mne/hr` and Mandarin |
| --- | --- | --- | --- | --- |
| VHF radio | УКВ-радио / VHF | Maritime standard | In EN use `VHF`, in RU UI `УКВ`; keep both where helpful. | Regional may use `VHF` or local term; Mandarin should keep VHF acronym with explanation. |
| radio exchange | радиообмен | Maritime standard | Standard. | No casual translation in safety examples. |
| radio spelling | радио-спеллинг / буквенная передача | Maritime standard / UI | Should point to ICAO/NATO spelling alphabet; output remains English alphabet words. | Do not translate spelling words. |
| ICAO spelling alphabet | ICAO spelling alphabet | Maritime standard / safety-critical | Keep standard name. | Mandarin/regional explanations may translate, output locked. |
| call sign | call sign / позывной | Maritime standard | In RU UI current mix is acceptable; decide canonical later. | Do not translate user-entered callsigns. |
| MMSI | MMSI | Maritime standard | Keep acronym. | Keep Latin acronym. |
| vessel profile | профиль судна | UI | Normal UI. | No special risk. |
| VTS | VTS / служба движения судов | Maritime standard | Keep acronym, translate expansion. | Local port terminology may vary. |
| coast station | береговая станция | Maritime standard | Standard. | Regional/zh need local maritime term. |
| marina entry | вход / заход в марину | UI / maritime standard | Practical phrase. | Avoid border/customs "entry" confusion. |
| distress | бедствие | Safety-critical | Radio category; preserve severity. | High risk; specialist review. |
| urgency | срочность | Safety-critical | Radio category; not the same as distress. | Must not collapse with distress. |
| safety | безопасность / сообщение безопасности | Safety-critical | Radio category. | Must not become generic site safety. |
| Mayday | Mayday | Safety-critical / locked output | Do not translate; uppercase in output as appropriate. | Keep Latin word; explanations only localized. |
| Mayday Relay | Mayday Relay | Safety-critical / locked output | Do not translate. | Keep locked. |
| Pan-Pan | Pan-Pan | Safety-critical / locked output | Do not translate. | Keep locked. |
| Securite / Sécurité | Securite / Sécurité | Safety-critical / locked output | Do not translate; handle accent consistently in UI. | Keep locked; avoid local phonetic substitutes in output. |
| All stations | all stations | Safety-critical / locked output | In generated radio text, use English standard phrase. | Do not translate output. |
| over / standing by | over / standing by | Maritime standard / locked output | Keep in generated message. | Do not translate output. |
| people on board | people on board / людей на борту | Safety-critical | Explanatory UI can localize; radio text should be reviewed. | Avoid passenger-only wording. |
| radio quick sheet | radio sheet / памятка для радиостанции | UI / safety-critical | Print document should be bilingual-aware but output locked. | Mandarin/regional print needs line-length QA. |
| Seaspeak / Sea Speak | Seaspeak / Sea Speak | Maritime standard / learning | Treat as named system/concept; choose one spelling in content. | Do not translate as "sea speaking"; explain locally. |

UKV rule:

- The generated radio output should remain in operational maritime English unless a separate specialist-approved multilingual radio mode is created.
- UI and explanations can be localized; commands, call structures and emergency phrases are locked.
- Any AI translation task must use a "protected segments" list for `Mayday`, `Pan-Pan`, `Sécurité`, callsigns, MMSI, positions, coordinates, numbers and units.

## 9. Maritime English Learning Page

| English term / source | Russian working term | Class | Notes for `de/it/es` | Warnings for `srb/mne/hr` and Mandarin |
| --- | --- | --- | --- | --- |
| Maritime English | морской английский | UI / maritime standard | This page teaches English, so target-language UI must not hide English learning goal. | Mandarin/regional pages should still teach English phrases, not replace them with local language. |
| radio exchange | радиообмен | Maritime standard | Connect to VHF module. | Keep English examples locked. |
| practical phrases | практические фразы | UI / owner-voice | Good for owner tone. | Localize explanation, keep English phrases as lesson object. |
| COLREGs | COLREGs / правила предупреждения столкновений | Maritime standard | Keep acronym, explain. | Regional/zh require official phrasing check. |
| IALA | IALA | Maritime standard | Keep acronym. | Keep Latin acronym. |
| Sea Speak / Seaspeak | Sea Speak / Seaspeak | Maritime standard / learning | Pick one canonical spelling before content build. | Do not translate name literally. |
| flashcards | карточки | UI | Normal learning UI. | No special risk. |
| drills / exercises | тренировки / упражнения | UI | Normal learning UI. | No special risk. |
| scenarios | сценарии | UI / learning | Used for radio/approach/emergency practice. | Safety scenarios need disclaimers. |
| correction / review | разбор / работа над ошибками | Owner-voice / UI | Preserve practical learning tone. | Avoid punitive tone in Mandarin/regional. |

Maritime English rule:

- This page is not a normal translated article. Its learning object is English maritime communication.
- Target-language versions should localize the UI and explanations, while preserving English phrases, radio structures and training examples.
- Later content work should align with UKV locked phrase registry and SEO page intent.

## 10. Cross-Language Risk Notes

### `de`, `it`, `es`

- They can follow the English source structure, but safety/radio/route/tides terms need a locked glossary before generation.
- Do not let AI invent local equivalents for `UKC`, `HW`, `LW`, `ETA`, `VTS`, `MMSI`, `Mayday`, `Pan-Pan`, `Sécurité`.
- Test line lengths in buttons, cards, tables and print/PDF because German can expand heavily and Spanish/Italian may overflow compact controls.
- Marina/port language may need local phrasing in service areas, but NavDesk tool outputs should remain standardized.

### `srb/mne/hr`

- This is not solved by a generic `sr` switch.
- Decide later whether the public version is one regional Latin-script version or separate Serbian/Montenegrin/Croatian variants.
- Croatian nautical terms may differ from Serbian/Montenegrin usage; a single variant must be deliberately positioned as regional/practical, not official for every jurisdiction.
- Avoid Cyrillic for the shared regional public version unless owner/SEO explicitly decides otherwise.
- Radio outputs remain in English; local explanatory text needs regional review.

### Mandarin (`zh`)

- Decide simplified vs traditional Chinese before public URL/content work.
- Mandarin UI needs compact labels, especially NavDesk cards, tables and print legends.
- Do not transliterate safety commands in generated radio output.
- Acronyms and units should generally remain Latin (`VHF`, `MMSI`, `UTC`, `ETA`, `UKC`, `nm`, `kn`) with Chinese explanation.
- Official maritime terms should be checked separately; casual Chinese wording can become unsafe in tides, route and emergency contexts.

## 11. Protected Segments For Future AI / Frontend Work

Never translate or rewrite automatically:

- `VETUS NAUTA`, `Brkovic`, `NavDesk` unless owner approves a local display name.
- `Mayday`, `Mayday Relay`, `Pan-Pan`, `Securite`, `Sécurité`.
- `VHF`, `UKV` when used as local Russian UI term, `VTS`, `MMSI`, `IMO`, `AIS`, `GPS`, `GNSS`, `UTC`, `ETA`, `HW`, `LW`, `UKC`.
- `nm`, `kn`, `m`, `ft`, coordinate symbols and coordinate hemisphere letters `N/S/E/W`.
- Callsigns, vessel names, MMSI numbers, positions, route presets, examples such as `Panama -> Nuku Hiva` unless explicitly localized as examples.
- Formulas and thresholds: `available depth = charted depth + tide`, `required = draught + UKC`, rest thresholds, watch intervals.
- Disclaimer paragraphs unless handled as approved safety/legal text.

## 12. Recommended Next Tasks

### Frontend

1. Create a NavDesk i18n key map by module: `navdesk_common`, `navdesk_watch`, `navdesk_tides`, `navdesk_route`, `navdesk_ukv`, `navdesk_english`, `navdesk_print`.
2. Move only low-risk UI strings first: buttons, labels, empty states, helper text, aria/placeholder text.
3. Keep `en/ru` as the only selectable languages until full files/content/SEO/QA exist.
4. Add a protected-segment layer for UKV output and print/PDF templates before any AI-assisted localization.
5. Run QA in day/night and desktop/tablet/mobile after each module, including A4 print/PDF for watch, tides, route and UKV.

### Content / Owner

1. Approve canonical English/Russian terminology for `watch`, `shift`, `watchkeeper`, `support watchkeeper`, `signed watch`, `rest control`, `safe passage window`, `UKC`, `great-circle route`, `rhumb line`.
2. Approve whether English route UI should show `Great-circle / Rhumb line` first, with `Orthodrome / Loxodrome` as technical names.
3. Approve the final common NavDesk disclaimer in English and Russian before expanding target languages.
4. Decide canonical spelling: `Seaspeak` or `Sea Speak`.

### Localization / SEO

1. Do not add `hreflang` for target languages yet.
2. Prepare a locked glossary file or table before generating target-language drafts.
3. Create per-page/module metadata only after real crawlable language URLs and approved content exist.
4. For `srb/mne/hr`, make a separate locale/URL/editorial decision before translation.
5. For Mandarin, decide simplified/traditional and safety-review path before public content.

## 13. Final Localization Position

NavDesk can become multilingual, but only as a controlled professional tool:

- UI can move first.
- Maritime terms need glossary locking.
- Safety/radio/print outputs need protected segments and review.
- Owner-voice explanations require approval.
- Planned languages remain roadmap-only until the site has real content, URL strategy, SEO rules and QA coverage.
