# NavDesk Tides UX/QA Report

**Task:** `BRK-MVP-QAUX-003`
**Chat:** `CHAT-BRK-QA-UX-001`
**Role:** QA/UX Inspector
**Date:** 2026-05-27
**Status:** UX/QA постановка для MVP
**Scope:** `navdesk-tides.html` as a separate NavDesk tool on desktop, tablet and mobile. No product code changes, no deploy, no FTP, no secrets.

## Findings

- `navdesk-tides.html` is already separated from the main NavDesk dashboard and has a coherent tool flow: place/date/units/depth inputs, action button, result meta, safe-window card and event table.
- Shared NavDesk behavior is present: the global NavDesk disclaimer modal exists on the page, and the day/night switch remains in the header. This must be preserved as one shared NavDesk contract, not duplicated inside tide blocks.
- Current search UX is not ready as a reliable MVP contract. The input requests suggestions for any non-empty string and can therefore open broad lists from the first typed character. There is no explicit minimum length, debounce, inline loading, no-results state or recoverable error state in the autocomplete itself.
- Calculation currently searches again and takes the first returned place if the user presses "calculate". For ambiguous names this can calculate against the wrong station/place without explicit user confirmation.
- The source is partially visible through the station line: `station_label/name • source`. This is useful, but it should be treated as compact provenance: coordinates/station/provider attribution. It must not become another safety disclaimer.
- The page has an additional `.navdesk-tides-disclaimer` under the table. For MVP UX this should be replaced or reframed as compact data-source/provenance text, because the shared NavDesk modal already covers navigation safety terms.
- Existing local reports say desktop `1440x1000`, tablet `768x1024` and mobile `390x844` browser smoke found no horizontal overflow for `navdesk-tides.html`; this report does not change that result.
- `navdesk.css` has several stacked visual rules for the tide result card. It appears serviceable for MVP, but future code changes should avoid adding another styling layer without consolidation.

## MVP Requirements

- Keep the tool compact and operational: input -> calculate -> result -> table. Do not turn the page into a landing page or a large explanatory article.
- Keep one primary action: "Рассчитать окно". Secondary controls must not compete visually with the calculation button.
- Keep inputs grouped by task logic: place/date/units first, vessel/depth inputs next, data mode next, result below.
- Do not add per-block safety warnings. The global NavDesk disclaimer remains the safety contract.
- Show source/provenance near the result: selected place, station label if available, coordinates if useful, provider/source such as WorldTides or local/mock status.
- The result card must handle idle, loading, passable, not-passable and error states without changing layout height so aggressively that the table jumps out of view.
- The event table must remain readable without horizontal page overflow. Internal table scrolling is acceptable only if table content genuinely exceeds viewport width.
- Day and night modes must preserve the same information hierarchy, spacing and controls. Night mode should feel like the same tool, not a separate dark redesign.
- Manual mode can stay for MVP, but it must not hide all useful context. If auto source/table are not used, show that as a small state note, not as a warning wall.

## Desktop

- Target viewport for acceptance: around `1440x1000`.
- The form should remain a compact two-column tool surface. Full-width rows are appropriate for place, charted depth and mode; short fields such as date, units, draft and UKC should not become oversized cards.
- The hero/header area should not push the actual calculator too far down. The first screen must clearly expose the tide tool, not only title text.
- Result meta, safe-window card and table should follow the action button in one clear vertical sequence. Avoid side-by-side layouts that make users scan left/right for the answer.
- Autocomplete dropdown should align to the place input width, cap its visible height, and stay above following controls without covering the calculate button in a confusing way.
- Long station/source strings must wrap inside the meta row and never force body horizontal overflow.

## Tablet

- Target viewport for acceptance: around `768x1024`.
- Two-column input layout can remain only while labels and values fit comfortably. If labels wrap heavily or controls feel cramped, collapse to one column earlier.
- The mode switch must be visually stable: Auto and Manual should look like one segmented choice, not two unrelated buttons.
- Autocomplete must be touch-friendly: each suggestion row should have at least normal button height and enough spacing for finger selection.
- The safe-window card should remain compact; status, message and required/min/max depths should not create a large decorative block.
- Day/night colors must keep contrast for labels, placeholder/status text, table headings and error/loading states.

## Mobile

- Target viewport for acceptance: around `390x844`.
- The mobile layout should be single-column from top to bottom: place -> date -> units -> draft -> UKC -> charted depth -> mode -> calculate -> result -> table.
- No horizontal page overflow is acceptable. The table wrapper may scroll internally if needed, but page-level `scrollWidth > clientWidth` should fail QA.
- The calculate button should be full-width or otherwise clearly primary, with no cramped neighboring controls.
- Autocomplete must not dump a long list over the whole form after one letter. It should show controlled states and a capped list that can be dismissed by outside tap or selection.
- Text must not overlap controls: long labels such as "Глубина на карте / в проходе", station/source names and no-results messages must wrap cleanly.
- The global NavDesk disclaimer modal must remain readable and dismissible on mobile. Do not add a second tide-specific modal or repeated warning below every block.

## Search UX Contract

- Minimum query length: do not request or show place suggestions before 2 characters. Prefer 3 characters if the provider/search list is large. For 1 character, show no dropdown or a quiet hint such as "Введите еще 1-2 символа".
- Debounce: wait about 250-350 ms after typing before requesting suggestions. Cancel or ignore stale responses so old results cannot overwrite newer input.
- Empty state: when the field is empty, suggestions are hidden and previously selected coordinates/station are cleared or marked stale.
- Loading state: while searching, show a small inline dropdown row or field status: "Ищем место...". The calculate button should not imply that a station has already been selected.
- Error state: if search fails, show a compact recoverable message in the dropdown/status area: "Не удалось загрузить варианты. Попробуйте еще раз или используйте ручной ввод." Do not mark the tide window as unsafe just because search failed.
- No-results state: after a valid-length query with no matches, show "Место не найдено" inside the search area. Do not open an empty dropdown and do not leave stale suggestions visible.
- Result limit: show a short list, about 5-7 suggestions max for MVP. If there are more, let the user refine the query rather than scrolling through a large list.
- Ambiguous place selection: each suggestion should display enough disambiguation, for example name, country/region, station/provider label and coordinates when available.
- Explicit selection: calculations should use the selected suggestion's coordinates/station. If the user typed text but did not select a suggestion and multiple matches exist, require selection instead of silently using the first result.
- Stale selection: if the user changes the input after selecting a place, selected coordinates/station must be cleared until a new suggestion is selected.
- Keyboard/touch basics: support click/tap, Enter on highlighted item, Escape/outside click to close. Highlighted/focused suggestion must be visible.
- Source attribution: after selection/calculation, display selected station/place plus provider/source near results, for example "Station: Kotor local mock | 42.4247, 18.7712 | Source: WorldTides". Keep it factual and compact, not a safety disclaimer.

## Not For MVP

- Full worldwide geocoder/station search redesign.
- Tide graphs, curve visualization and multi-day comparison.
- Comparing multiple nearby tide stations.
- GPS/autolocation handoff into the tide page.
- Offline cached tide tables.
- Export/print/share of tide calculations.
- Full CSS consolidation of all historical `.navdesk-window-card` layers.
- Radical visual redesign of NavDesk or replacement of the shared disclaimer model.
- New per-tool legal/safety modal or repeated warnings inside every tide block.

## Acceptance Checklist

- [ ] Page opens as `navdesk-tides.html` and works as a standalone NavDesk tool.
- [ ] Global NavDesk disclaimer appears/accepts according to the shared NavDesk behavior.
- [ ] Day/night switch works and preserves the same tool structure in both modes.
- [ ] Desktop `1440x1000`: no page horizontal overflow, compact two-column form where appropriate, result and table readable.
- [ ] Tablet `768x1024`: no page horizontal overflow, controls remain ordered and touch-friendly.
- [ ] Mobile `390x844`: single-column flow, no overlap, no page horizontal overflow.
- [ ] Search does not show/request a broad list on the first character.
- [ ] Search has defined min length, debounce, loading, error and no-results states.
- [ ] User must explicitly select an ambiguous place before calculation.
- [ ] Changing typed place after selection clears stale coordinates/station.
- [ ] Calculate flow is clear: input -> loading -> result/status -> table.
- [ ] Source/provenance is visible near results: station/place, coordinates if available, provider/source.
- [ ] Source/provenance is not styled or worded as a second disclaimer.
- [ ] Manual mode remains available and does not break global disclaimer/day-night behavior.
- [ ] Event table remains readable; any internal table scroll does not create body overflow.
- [ ] Long station/source/result text wraps inside its container.
- [ ] Empty/idle state tells the user what to enter next without looking like an error.
- [ ] Provider/API failure is recoverable and does not visually imply a navigation danger state.
- [ ] No production, FTP, private config or secrets are touched by this UX task.
