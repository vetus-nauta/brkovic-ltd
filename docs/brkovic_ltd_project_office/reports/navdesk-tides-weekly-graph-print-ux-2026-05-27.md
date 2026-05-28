# NavDesk Tides Weekly Graph Print/PDF UX

**Task:** `BRK-MVP-QAUX-004`
**Chat:** `CHAT-BRK-QA-UX-001`
**Role:** QA/UX Inspector
**Date:** 2026-05-27
**Status:** MVP UX requirements
**Scope:** weekly tide graph, screen layout and browser print / Save as PDF for `navdesk-tides.html`. No product code changes, no deploy, no FTP, no secrets.

## Product Goal

Give the skipper a quick, human-readable weekly view of predicted tide level and passage depth margins for a selected place, without making the output feel like an official navigation document.

The graph should answer four practical questions:

- when the water is rising or falling during the selected week;
- when available depth is above or below the user's required depth;
- which user settings produced the result;
- where the data came from.

The MVP should extend the existing NavDesk tides flow, not redesign it. The shared NavDesk disclaimer remains the single safety entry warning. The tides graph must use compact provenance/attribution only, not a second warning modal or repeated legal disclaimer.

## Graph Content

The weekly graph should cover 7 calendar days starting from the selected date. The selected date remains the anchor already used by the current daily tide table.

The graph must show:

- Tide curve: a continuous line of predicted tide height over time, with day separators and readable date labels.
- Required depth: a horizontal threshold line equal to `draft + UKC`.
- Available depth: the operational value `charted depth + tide height`. For clarity, the graph should plot the available-depth curve as the primary operational curve, while the raw tide curve can be shown as a thinner secondary line or as a label/axis reference.
- Charted depth / channel depth: a fixed baseline value displayed in the settings summary and, if shown in the graph, as a muted baseline marker.
- Draft: shown as a numeric input value in the settings summary, not as a large shape on the chart.
- UKC: shown as a numeric input value in the settings summary and included in the required-depth threshold.
- Safe/unsafe intervals: time spans where `available depth >= required depth` versus `available depth < required depth`.
- Extremes and useful markers: HW/LW points for each day if available from the provider, plus min/max available depth for the week.

The weekly graph should not replace the daily event table in MVP. The table can remain below the graph or switch to "events for selected day" while the graph shows the week.

## Visual Encoding

Use simple, non-authoritative chart language:

- Available depth curve: strong solid line, neutral NavDesk brand color.
- Tide height curve, if separate: thinner muted line so the user does not confuse tide height with passable depth.
- Required depth threshold: dashed horizontal line labelled "Required depth = draft + UKC".
- Safe intervals: soft green translucent bands behind the curve.
- Unsafe intervals: soft red/amber translucent bands behind the curve.
- Current/selected day marker: subtle vertical line, not a dramatic alert.
- HW/LW markers: small dots with short labels such as `HW 1.2 m` or `LW 0.1 m`.

Avoid visual language that looks official or certifying:

- no stamp-like "SAFE" / "UNSAFE" seals;
- no certificate-style borders;
- no heavy red danger panels unless the calculation itself has failed;
- no language implying permission to pass.

Recommended wording:

- "Passage window by current settings"
- "Depth appears sufficient"
- "Depth appears below required setting"
- "Reference calculation"

Avoid wording:

- "Approved"
- "Certified safe"
- "Navigation clearance granted"

Day and night mode must keep the same semantic colors, but night mode should reduce saturation and keep contrast for grid, curve, labels and safe/unsafe bands.

## Screen Layout

Keep the screen flow compact and operational:

1. Existing input block: place, date, units, draft, UKC, charted depth, data mode.
2. Primary action: calculate/update.
3. Weekly graph block.
4. Result summary: passable intervals, min/max available depth, next HW/LW/current state.
5. Daily event table or selected-day events.
6. Compact source/provenance line.

The graph block should contain:

- title: "Weekly tide and depth window";
- date range, place/station and units;
- chart area;
- compact legend for available depth, tide height, required depth, safe interval and below-required interval;
- print / Save as PDF action near the graph, secondary to calculate.

The settings summary should be visible on screen directly above or beside the graph:

`Charted depth: 4.0 m | Draft: 2.0 m | UKC: 0.5 m | Required: 2.5 m | Available: charted depth + tide`

On desktop, this summary can be a single wrapping row. On tablet/mobile, use two compact rows or small key/value chips. It should not become a large card.

## Print/PDF Layout

Printing should use the browser print flow: the action opens `window.print()` or the existing NavDesk print helper, and the user chooses printer or "Save as PDF" in the browser dialog.

Print output must be a clean report sheet, not a screenshot of the whole web page. Hide header navigation, language controls, pin/collapse controls, input fields, autocomplete, day/night switch and non-print buttons.

Required print content:

- brand/title: VETUS NAUTA - Brkovic / NavDesk Tides;
- place/station and coordinates if available;
- selected week date range and generated timestamp;
- units;
- settings summary: charted depth, draft, UKC, required depth, available-depth formula;
- weekly graph with legend;
- passable intervals summary for the week;
- min/max available depth for the week;
- compact source/provenance line.

A4 portrait:

- must fit title/meta, settings summary, graph, legend, source line and a short passable-interval summary on the first page;
- graph height should be moderate, roughly 90-120 mm, so the page does not become only a chart;
- if the event table is included, it should start on page 2 or be limited to selected-day events.

A4 landscape:

- preferred for the full 7-day graph because labels and intervals are easier to read;
- should fit the full week graph, settings summary, legend and source line on one page;
- passable intervals can appear in a compact row or short list below the graph.

The MVP print action can default to one print layout, but the content must remain usable whether the browser is set to portrait or landscape. Do not require a custom PDF generator for MVP.

## Mobile/Tablet Behavior

Desktop:

- the graph should be full-width within the current tides tool area;
- labels should not require horizontal scrolling at normal desktop widths;
- hover/focus tooltip may show exact time, tide height, available depth and margin.

Tablet:

- graph remains full-width;
- settings summary wraps into compact rows;
- touch target for selecting a day/point should be comfortable;
- no page-level horizontal overflow.

Mobile:

- show the graph as a horizontally scrollable 7-day timeline inside the graph block, or provide a segmented day selector with one-day viewport plus weekly summary;
- page itself must not horizontally overflow;
- graph height should stay useful, not collapse into a thin strip;
- legend should wrap below the graph;
- print button can remain visible after calculation, but browser print from mobile is secondary and may depend on the device/browser.

For MVP, the safest mobile pattern is: weekly summary above, scrollable chart below, selected-day details under the chart. This keeps the week available without squeezing seven days into an unreadable mini-chart.

## Source/Attribution

Source/provenance should be compact and factual:

`Source: WorldTides | Station: Kotor / nearest station | Coordinates: 42.4247, 18.7712 | Generated: 2026-05-27 14:30 local`

If mock/local fallback data is used, say so plainly:

`Source: local demo data` or `Source: WorldTides unavailable, local fallback shown`

Do not add a second safety disclaimer in the graph or print sheet. The shared NavDesk disclaimer remains the entry warning. The printed sheet may include one compact provenance phrase such as "Reference tide data and user-entered vessel/depth settings" only if needed to describe the source of the numbers; it should not read like a new modal/legal block.

WorldTides attribution should appear:

- on screen near the graph/result meta;
- in print/PDF footer or directly under the graph;
- in small but readable text, not hidden in a tooltip only.

## MVP Acceptance Checklist

- [ ] Weekly graph covers 7 days from the selected date.
- [ ] Graph shows available depth over time.
- [ ] Graph shows required depth as `draft + UKC`.
- [ ] Graph or adjacent summary shows charted depth, draft, UKC, required depth and available-depth formula.
- [ ] Safe intervals are visually distinct but subdued.
- [ ] Below-required intervals are visually distinct but do not look like official danger certification.
- [ ] HW/LW markers or daily extrema are visible where data supports them.
- [ ] Desktop layout has no page-level horizontal overflow.
- [ ] Tablet layout has no page-level horizontal overflow and remains touch-readable.
- [ ] Mobile layout does not squeeze the full week into unreadable labels.
- [ ] Day/night mode preserves graph meaning, contrast and hierarchy.
- [ ] Print action uses browser print / Save as PDF.
- [ ] Print hides navigation, inputs, toggles and non-print controls.
- [ ] A4 portrait first page includes title/meta, settings, graph, legend, summary and source.
- [ ] A4 landscape fits the full week graph comfortably on one page.
- [ ] Source/provenance includes WorldTides or fallback status.
- [ ] Source/provenance is compact and is not a second disclaimer.
- [ ] Existing shared NavDesk disclaimer remains the only warning modal.
- [ ] No production, FTP, secrets or deploy actions are touched.

## Not For MVP

- Official navigation document or certified clearance output.
- New tide-specific legal modal or repeated disclaimer below the graph.
- Custom server-side PDF generation.
- Multi-station comparison.
- Harmonic prediction editor.
- Full route planner integration.
- Currents, wind, waves or weather overlays.
- Offline tide cache.
- Advanced annotations, skipper notes or signed print sheets.
- Broad NavDesk visual redesign.
