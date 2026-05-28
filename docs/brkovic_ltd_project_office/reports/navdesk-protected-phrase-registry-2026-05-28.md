# NavDesk Protected Phrase Registry - 2026-05-28

**Task:** `BRK-MVP-LOC-010`  
**Role:** Localization Architect  
**Status:** For Director review  
**Scope:** report-only protected registry for future NavDesk localization  
**Product code:** untouched by this report  
**Production / FTP / backend / OpenAI:** untouched

## 1. Director Summary

NavDesk language work must be split into safe UI extraction and protected operational language.

Frontend may continue with exact-text UI extraction only when a string is not a formula, warning, radio phrase, signed record or printable document sentence.

Future languages remain disabled:

- `de`
- `it`
- `es`
- `sr` as temporary regional Serbian/Montenegrin/Croatian placeholder
- `zh` as Mandarin placeholder

Do not add `hreflang`, localized slugs or public target-language pages yet.

## 2. Freely Extractable UI

These can move to `lang/en.json` / `lang/ru.json` if the current wording is preserved:

| Area | Examples | Rule |
| --- | --- | --- |
| Common shell | open, close, pin, pinned, day mode, night mode, screen mode | Safe. Keep day/night behavior intact. |
| Generic card controls | card button labels, collapsed/expanded labels | Safe. No redesign. |
| Generic status | loading, copied, empty, select from list | Safe if not tied to a safety conclusion. |
| Basic calculator shell | calculate, reset, copy summary, time/distance/fuel labels | Safe. Existing `journal_calc_*` keys can be reused for the legacy small calculator. |
| Search UI | searching, change query, coordinates inserted | Safe. Do not change search algorithm in localization task. |
| UKV UI controls | copy button, apply/save/reset profile labels | Safe as UI only. Do not translate radio output. |
| Accessibility labels | screen mode, day/night, close, menu | Safe. Must stay concise. |

## 3. Standard Maritime Terms

These terms may appear in dictionaries, but their canonical form must be preserved:

| Term | Rule |
| --- | --- |
| `UTC` | Keep Latin acronym. Localize explanation only. |
| `GPS` / `GNSS` | Keep acronym. Do not imply guaranteed availability. |
| `VHF` / `УКВ` | EN uses `VHF`; RU can show `УКВ` with `VHF` where useful. |
| `MMSI`, `IMO`, `VTS`, `AIS`, `CPA`, `TCPA` | Keep acronyms. Translate explanation only. |
| `HW`, `LW`, `UKC`, `ETA`, `nm`, `kn`, `m`, `ft` | Keep symbols/acronyms. Do not invent local abbreviations. |
| `orthodrome` / `great-circle route` | EN UI may prefer `great-circle route`; RU can keep `ортодромия`. Print terms need review. |
| `loxodrome` / `rhumb line` | EN UI may prefer `rhumb line`; RU can keep `локсодромия`. Print terms need review. |
| coordinates | Do not localize symbols, hemispheres or numeric format creatively. |

## 4. Protected Segments

These must not be translated by general UI work:

```text
Mayday
Mayday Relay
Pan-Pan
Sécurité / Securite
all stations
over
standing by
this is
my position is
immediate assistance required
persons on board
call sign
MMSI
VTS
UTC
GPS
GNSS
HW
LW
UKC
ETA
nm
kn
N / S / E / W
```

Rules:

- Generated radio output remains operational maritime English.
- User-entered callsigns, vessel names, positions and MMSI values are never translated.
- Emergency/severity categories must not be softened or merged.

## 5. Safety-Critical Sentences

Locked until specialist review:

| Area | Protected meaning |
| --- | --- |
| NavDesk disclaimer | NavDesk is reference/preliminary only and not sole basis for navigation decisions. |
| Tides safe window | A calculated window is not an official guarantee. |
| Depth formula | available depth = charted depth + tide. |
| Required depth formula | required depth = draught/draft + UKC. |
| Route output | Great-circle/rhumb-line results are calculation aids, not an approved passage plan. |
| GPS status | Browser/device GPS may be unavailable or inaccurate. Manual entry remains possible. |
| Watch reminders | Browser notification depends on device/browser permissions. |
| Rest control | Rest calculations are operational aids, not proof of legal compliance. |
| Signed watch | A signed watch is a local snapshot; editability/legal meaning must be explicit later. |

Frontend may move exact existing text into keys only after the string is explicitly assigned. No paraphrase.

## 6. Print/PDF Document Phrases

Treat these as document templates, not simple UI:

| Document | Status |
| --- | --- |
| Watch schedule A4 | Locked until print/PDF terminology review. |
| Watch entries sheet | Locked until print/PDF terminology review. |
| Signed watches / rest control sheet | Locked until document rules are approved. |
| Route calculation report | Locked until route terminology and disclaimer are approved. |
| Weekly tide/depth graph | Locked until chart legend, source and formula wording are approved. |
| UKV quick sheet | Locked because radio output and safety phrase order matter. |

## 7. Watch Log Terms

Approved working distinctions:

| Concept | Working rule |
| --- | --- |
| watch | Duty/watchkeeping concept. |
| shift | Scheduled block/change. |
| watchkeeper | Person on watch. |
| senior watchkeeper / watch leader | Operational person responsible for the shift. |
| support watchkeeper / second watchkeeper | Do not literalize blindly; explain as additional person on watch when needed. |
| night interval | Neutral UI marker. |
| pre-dawn/high-fatigue interval | Neutral UI marker if needed. |

Do not use visible UI wording "dog watch". The internal discussion may guide highlighting, but public UI should mark such periods neutrally.

## 8. Maritime English Page

This page is special:

- target-language UI can be localized later;
- English phrases remain the learning object;
- radio structures and examples remain protected;
- future content must align with UKV protected phrases.

## 9. Future AI Translation Rules

Any future AI language desk must receive protected segments as non-translation tokens.

Minimum AI instructions:

- preserve protected acronyms and radio phrases exactly;
- do not translate vessel names, callsigns, MMSI, coordinates, units or route values;
- do not invent safety/legal guarantees;
- preserve formula meaning exactly;
- mark outputs as draft until reviewed;
- do not publish automatically.

## 10. Next Allowed Frontend Slice

Allowed immediately:

- `FE-019`: connect the old internal NavDesk small-calculator runtime labels to existing dictionary keys.

Why safe:

- keys already exist as `journal_calc_*`;
- text already appears on the NavDesk page;
- no formulas, route logic, tide logic, radio output, disclaimer or print/PDF document wording changes.

Forbidden in `FE-019`:

- watch-log document labels;
- GPS warning/status migration;
- route report labels;
- tide safe-window conclusions;
- UKV generated message templates.
