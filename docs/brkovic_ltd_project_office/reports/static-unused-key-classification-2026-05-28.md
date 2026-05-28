# Static-Unused Key Classification - 2026-05-28

**Task:** `BRK-MVP-LOC-008`  
**Status:** For Director / owner review  
**Mode:** report-only classification  
**Product code:** not changed by this report

## Summary

The improved diagnostics gate now scans:

- static public HTML;
- service pages;
- NavDesk pages;
- JavaScript translation calls;
- JS string literals matching known dictionary keys for dynamic patterns such as `t(type.label)`.

Current diagnostics result:

- HTML keys: `613`
- JS keys: `134`
- total referenced keys: `726`
- missing active dictionary keys: `0`
- broken page shell checks: `0`
- total-unused keys: `102` key names, mirrored in `en` and `ru` (`204` dictionary entries total)

These keys are not deletion candidates yet. They are a map for next cleanup/migration decisions.

## Classification By Group

| Group | Count | Classification | Decision |
| --- | ---: | --- | --- |
| `hero_*` | 8 | old/home shell or hidden hero support | Review with homepage SEO/content pass; do not delete during language sprint. |
| `journal_*` | 23 | legacy public journal composer/tool shell | Journal is backend/content-bound; do not delete until journal sprint confirms old local composer is gone. |
| `journal_calc_*` | 15 | old route calculator strings from journal-era tool | Candidate for cleanup or redirect to NavDesk route module, but not before NavDesk route QA. |
| `navdesk_route_*` | 9 | route module legacy/generated UI candidates | Good candidate for `FE-016`/route i18n review, except calculation terms. |
| `navdesk_tides_*` | 2 | tide helper labels | Safe review candidate; keep safety/formula text protected. |
| `navdesk_ukv_*` | 1 | UKV helper hint | UI-only candidate; do not touch radio output. |
| `service_page_*` | 8 | legacy service page support keys | Review after service page final content pass; do not delete blindly. |
| `weather_*` | 10 | old home weather block | Likely cleanup candidate because owner said weather is not needed now. Confirm no hidden page uses it before deletion. |
| `ym_*` | 18 | Yacht Management optional/sailing/commercial strings | Commercial/document-adjacent; do not delete without Yacht Management calculator review. |
| other | 8 | brand/meta/NavDesk window/CV notes | Mixed: `meta_*` may be SEO legacy, CV notes may be owner/business copy, NavDesk window statuses are safety-adjacent. |

## Recommended Next Safe Frontend Set

For `BRK-MVP-FE-016`, use this order:

1. `navdesk_ukv_phrase_pick_hint` as UI helper only.
2. `navdesk_tides_suggestion_hint`, `navdesk_tides_trend_label` as UI labels only.
3. route search/status keys that are not formula/output text:
   - `navdesk_route_search_result_empty`
   - `navdesk_route_search_result_prefix`
   - `navdesk_route_search_status_idle_inline`
   - `navdesk_route_search_status_inserted_short`
4. defer `navdesk_route_calc_gc`, `navdesk_route_calc_rl`, route mode labels and route table labels until route print/PDF terminology is reviewed.

## Cleanup Candidates, Not For Immediate Deletion

Likely cleanup candidates after confirmation:

- `weather_*` because the current homepage direction removes weather from MVP value.
- `journal_calc_*` if the old journal calculator is fully superseded by NavDesk route.
- old local composer keys under `journal_compose_*` if public journal creation is permanently backend/admin-only.

Do not delete yet because deletion should be a separate cleanup task with a grep report and browser smoke.

## Protected Groups

Do not treat these as simple UI cleanup:

- `ym_*`: commercial estimate, documents, price logic, owner/service promise.
- `navdesk_window_status_*`: tide/depth safety output.
- `cv_note_*`: owner/business message.
- `meta_*`: SEO strategy.
- any journal entry/content key: journal content belongs to the owner and backend language desk.

## Next Step

Proceed with `BRK-MVP-FE-016` as a narrow safe JS UI migration. Keep `node tools/i18n-diagnostics.mjs` green after every patch.
