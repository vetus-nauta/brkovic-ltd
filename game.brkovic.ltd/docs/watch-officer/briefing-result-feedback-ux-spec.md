# TASK-0067 - Briefing + Result Feedback UX Spec

**Status:** approved-for-engine-implementation-plan  
**Owner Chat:** CHAT-UX-001 / UI/HUD / Player Experience  
**Date:** 2026-05-26  
**Scenario:** `safe-water-crossing-target`  
**Output:** `game.brkovic.ltd/docs/watch-officer/briefing-result-feedback-ux-spec.md`

## Scope

Define the next Watch Officer prototype UX increment:

- pre-start briefing for scenario 1;
- end/result feedback after attempt completion;
- mobile readability requirements;
- QA screenshot and smoke acceptance checklist.

Documentation only. No Godot files, public files, routes, registry, auth, Captain Ether, Nav Desk, production config, deploy state, new scenarios, VTS, or new maritime rules are in scope.

## Sources Reviewed

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-next-prototype-increment-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/product-bible.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-brief.md`
- `game.brkovic.ltd/docs/watch-officer/first-5-minutes.md`
- `game.brkovic.ltd/docs/watch-officer/local-play-loop-polish-pack-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-watch-officer-production-smoke-review.md`
- `game.brkovic.ltd/docs/watch-officer/engine-runtime-state-contract.md`

## UX Decision

The increment is approved for Engine implementation planning.

The briefing and result screens must render exported Engine/scenario state only. UI must not compute encounter class, safe-water state, CPA/TCPA, warning escalation, scenario result, or maritime rule correctness.

## Pre-Start Briefing Hierarchy

Show the briefing before the player starts the attempt, while the runtime is in `ready`.

Screen hierarchy:

1. Scenario title.
2. Draft/non-final training label.
3. One-sentence watch objective.
4. Situation facts.
5. What to watch.
6. Controls.
7. Start action.

Recommended layout:

- Desktop: centered compact panel over dimmed but visible playfield.
- Mobile portrait: full-width bottom sheet or centered panel with no text smaller than readable HUD labels.
- Mobile landscape: compact left or center panel; avoid covering lower-third ownship if the scene is visible behind it.

The briefing should not explain COLREGS rule numbers or legal doctrine. It should tell the player what to observe and what outcome is expected in this draft scenario.

## Player Must Understand Before Start

Before pressing Start, the player must understand:

- this is scenario 1: `Safe Water, Crossing Target`;
- content is draft/non-final training, not certified instruction;
- the region is IALA Region A only;
- the visible lateral pair defines the simple channel corridor;
- shallow water outside the intended corridor can ground the vessel;
- one target vessel crosses ahead from starboard;
- AIS/vector and CPA state are Engine-provided cues;
- VTS is disabled in this scenario;
- success means pass the finish gate while keeping safe water and avoiding unsafe CPA, grounding, and collision;
- controls are heading and speed only.

## Exact Briefing Copy

Use English as the first prototype copy. Russian may be added as localization, not as a separate UX flow.

### English

```text
Safe Water, Crossing Target

Draft training scenario - not final maritime instruction.

Objective
Proceed through the marked safe-water corridor. Avoid shallow water, grounding, collision, and unsafe CPA with the crossing target.

Situation
IALA Region A. One red/green lateral pair marks a simple channel. A power-driven target crosses ahead from starboard. VTS is disabled for this scenario.

Watch
Read the marks first. Keep the vessel in safe water. Use early, clear heading or speed changes if CPA becomes caution, danger, or immediate.

Controls
Turn port/starboard. Step speed down/up. Start when ready.

Start Attempt
```

### Russian

```text
Безопасная вода, пересекающая цель

Учебный черновик - не финальная морская инструкция.

Задача
Пройдите по отмеченному коридору безопасной воды. Избегайте мелководья, посадки на мель, столкновения и опасного CPA с пересекающей целью.

Обстановка
Регион IALA A. Одна красно-зеленая пара латеральных знаков обозначает простой канал. Моторное судно пересекает курс впереди с правого борта. VTS в этом сценарии отключен.

Наблюдение
Сначала прочитайте знаки. Держите судно в безопасной воде. Если CPA становится caution, danger или immediate, меняйте курс или скорость заранее и понятно.

Управление
Поворот влево/вправо. Скорость ниже/выше ступенями. Начните, когда готовы.

Начать попытку
```

## Result Screen Hierarchy

Show the result screen when local attempt state is `completed` or Engine `scenario_result` reaches a terminal result.

Screen hierarchy:

1. Result category headline.
2. Draft/non-final training label.
3. Scenario result line from Engine state.
4. Captain note summary.
5. Three assessment rows:
   - Safe water.
   - CPA/TCPA.
   - Warnings.
6. Restart action.

Recommended layout:

- Keep it calm and report-like.
- Do not use arcade failure language.
- Do not show final/certified training claims.
- Do not display raw debug numbers in player mode.
- QA mode may show debug values below the player-facing report.

## Result Categories

UI maps Engine `scenario_result` to display category only. UI must not decide the underlying result.

| Display category | Engine result inputs | Player-facing headline |
| --- | --- | --- |
| Acceptable watch | `success` | `Acceptable watch` |
| Needs correction | `warning_outcome`, `unsafe_manoeuvre`, `near_miss` | `Watch needs correction` |
| Failed/unsafe | `grounding`, `collision`, `load_blocked` | `Unsafe watch` |
| In progress fallback | `ready`, `running`, `restart_requested`, `restart_ready`, `not_started` | Do not show final result screen. |

Russian headline candidates:

```text
Acceptable watch -> Вахта принята
Watch needs correction -> Вахта требует исправления
Unsafe watch -> Небезопасная вахта
```

These are prototype labels and must stay under draft/non-final wording until maritime review.

## Exact Result Copy

### Acceptable Watch

```text
Acceptable watch
Draft training scenario - captain note, not final maritime instruction.

Result: {scenario_result}

You kept the vessel in the safe-water corridor and completed the crossing situation without grounding or collision.

Safe water: {safe_water.state}
CPA/TCPA: {cpa_tcpa.state}
Warnings: {warning_summary}

Restart Attempt
```

### Needs Correction

```text
Watch needs correction
Draft training scenario - captain note, not final maritime instruction.

Result: {scenario_result}

The attempt remained recoverable, but the watch developed avoidable risk. Review the warning summary before restarting.

Safe water: {safe_water.state}
CPA/TCPA: {cpa_tcpa.state}
Warnings: {warning_summary}

Restart Attempt
```

### Failed/Unsafe

```text
Unsafe watch
Draft training scenario - captain note, not final maritime instruction.

Result: {scenario_result}

The attempt ended in an unsafe outcome. Restart and keep the vessel clear of shallow water and the crossing target.

Safe water: {safe_water.state}
CPA/TCPA: {cpa_tcpa.state}
Warnings: {warning_summary}

Restart Attempt
```

## Warning Summary

Use Engine warning state only.

Player mode summary rules:

- If no active or final warning ids exist: show `none`.
- If warnings exist: show up to three highest-priority warning text keys as localized short labels.
- Preserve severity order from Engine priority.
- Do not add new warning meanings in UI.
- Do not infer hidden cause from geometry, CPA/TCPA, or encounter data.

Recommended player labels:

| Warning key | English label | Russian label |
| --- | --- | --- |
| `warning.cpa_risk` | CPA risk | Риск CPA |
| `warning.shallow_water` | Shallow water | Мелководье |
| `warning.leaving_safe_water` | Leaving safe water | Выход из безопасной воды |
| `warning.late_alteration` | Late alteration | Поздний маневр |
| `warning.collision` | Collision | Столкновение |
| `warning.grounding` | Grounding | Посадка на мель |

QA/debug mode may show warning ids, source, priority, started tick, cleared tick, and `debug_payload`.

## Safe-Water And CPA/TCPA Display

Display Engine values directly:

- `safe_water.state`
- `cpa_tcpa.state`
- `scenario_result`
- `warnings.primary_warning`
- `warnings.secondary_warnings`

Player labels:

| Engine state | Player label |
| --- | --- |
| `in_corridor` | Safe corridor |
| `corridor_buffer` | Corridor caution |
| `shallow_buffer` | Shallow-water caution |
| `shallow` | Shallow water |
| `grounded` | Grounded |
| `safe` | CPA safe |
| `caution` | CPA caution |
| `danger` | CPA danger |
| `immediate` | CPA immediate |

Numeric CPA/TCPA values are QA/debug only.

## Draft/Non-Final Wording

Draft status must remain visible but not noisy.

Required display:

- Briefing: one line under title.
- Result screen: one line under category headline.
- QA/debug overlay: show `rule_review_status`, `training_claim_status`, and `draft_training`.

Required wording:

```text
Draft training scenario - not final maritime instruction.
```

Do not use:

- official;
- certified;
- COLREGS compliant;
- correct rule;
- final maritime training;
- final training product.

## Mobile Readability Requirements

Mobile briefing/result panels must:

- fit without horizontal scrolling;
- keep title, draft label, objective/result, and primary action visible without hunting;
- use short lines and avoid dense paragraphs;
- keep Start/Restart as a large thumb target;
- avoid covering required HUD controls during play;
- avoid tiny debug text in player mode;
- support portrait and landscape screenshots;
- keep English and Russian candidate copy from overflowing buttons or panel bounds.

If the full briefing copy is too tall on small portrait screens, collapse `Controls` to one compact row but do not hide the objective or draft/non-final line.

## QA Acceptance Checklist

Screenshots:

- Ready state with briefing visible, desktop 16:9.
- Ready state with briefing visible, mobile portrait.
- Ready state with briefing visible, mobile landscape.
- Running state after Start, confirming briefing is hidden.
- Completed success/result screen if reachable by fixture.
- Completed warning/needs-correction result if reachable by fixture.
- Completed failed/unsafe result if reachable by fixture.
- QA/debug mode result screen showing draft status and numeric/debug fields if that mode exists.

Smoke checks:

- Start action moves from ready/briefing to running play.
- Result screen appears only after completed/terminal result.
- Restart returns to ready and briefing can be shown again.
- Scenario 1 VTS remains disabled/inactive and no VTS popup is introduced.
- Player result screen uses Engine `scenario_result`, `safe_water.state`, `cpa_tcpa.state`, and warning queue.
- Player result screen does not show numeric CPA/TCPA.
- QA/debug mode can show numeric CPA/TCPA and warning debug details.
- Draft/non-final wording appears on briefing and result surfaces.
- Forbidden final-training claims are absent.
- Captain Ether, hub routing, Nav Desk, auth, production config, deploy state, and public files are unchanged by this task.

## Blocking Changes

None.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0067 result: **approved-for-engine-implementation-plan**.

The next Engine task can implement a pre-start briefing and result feedback screen using existing exported scenario/runtime state. UI must remain display-only for maritime logic, keep VTS disabled for scenario 1, and preserve draft/non-final training wording.
