# Ship Cashbox Etalon: Main, Records, Ledger

Date: 2026-06-06
Local runtime: WebStorm/test copy, `http://127.0.0.1:18090/ship-cashbox/index.html`
Accepted shell: `20260606-cashbox-layout-stabilize-78`
Accepted SW cache: `ship-cashbox-shell-v20260606-204`
Accepted API: `2026.06.06-ship-cashbox-report-foundation-06`
Storage health at acceptance: MongoDB Atlas, database `brkovic_ship_cashbox`, collections `shipCashboxSessions`, `shipCashboxIndex`.
Important runtime note: `jsonStorageDir` still points to the WebStorm/test copy storage path. Do not confuse source/runtime/storage copies.

## Accepted Scope

The following Ship Cashbox areas are accepted as the current UI/UX and behavior etalon:

- Main / hall screen.
- Records screen.
- Ledger / ЖЗ expense feed screen.
- Ledger attachment sheet.

This acceptance applies to both modes:

- Personal mode / личка.
- Group mode / группа.

The accepted behavior must remain mode-isolated. Personal mode must not leak group/crew/treasurer wording. Group mode must not be reduced to personal-only logic.

## Main / Hall

Accepted state:

- Main/hall behavior is stable enough to serve as the current baseline.
- Navigation must keep personal and group starts separated.
- Existing active session must not silently hijack the other mode.
- Do not reintroduce shared-site/Nav Desk changes to solve Ship Cashbox layout issues.

## Records Screen

Accepted state:

- Records screen is the current visual and behavioral etalon for card spacing, card tone, button weight, and compact mobile layout.
- Active draft must appear as `Активная запись` after returning from ЖЗ when draft text exists.
- Active draft must display the linked cashbox/journal title, not only a generic label.
- Ready records remain visually distinct and slightly calmer/darker than the create/active surfaces.
- `Создать запись` keeps centered plus/title behavior.

Do not regress:

- Do not bring back the old right scrollbar artifact on the main records screen.
- Do not reintroduce oversized or misaligned plus/circle controls.
- Do not split the personal and group records style into two unrelated systems unless there is a product reason.

## Ledger / ЖЗ

Accepted input contract:

```text
-100 продукты
+50 перевод
-20 стоянка, -80 марина, -15 вода
```

Rules:

- `+` means income / приход.
- `-` means expense / расход.
- Operations may be written in separate lines or comma-separated inside one line.
- Every numeric operation must carry `+` or `-`.
- A numeric operation without sign is `disputed` and must not participate in arithmetic.
- Disputed operations must be shown one-by-one, not collapsed into a single generic warning.
- The user must see each problematic amount so the journal cannot degrade into unstructured text.

Accepted warning behavior:

- Each unsigned amount receives a separate visible `?` warning.
- Example: `-20 стоянка, 80 марина, 15 вода` must warn separately for `80 марина` and `15 вода`.
- Because a native `textarea` cannot style individual inline fragments reliably, the accepted implementation uses a visible overlay/list marker for disputed items.

Accepted save/route behavior:

- Empty ЖЗ button state: `К записям`.
- Non-empty ЖЗ button state: `Фиксация / К записям`.
- Returning from ЖЗ must sync the mounted textarea into local state before rendering records, so `Активная запись` does not disappear while autosave is pending.

## Attachment Sheet

Accepted state:

- The attachment sheet is a compact action sheet, not a full page.
- It has no explanatory wall of text.
- It has no inner card layout per action.
- The visual button itself is an SVG image asset.

Accepted actions:

- `Галерея` -> `assets/attach-gallery.svg`
- `Камера` -> `assets/attach-camera.svg`
- `Документы` -> `assets/attach-documents.svg`

Rules:

- Keep the three SVG assets lightweight and cached by `sw.js`.
- Do not replace them with heavy raster images unless there is a concrete visual requirement.
- The button element should stay a transparent hit target around the SVG image, not a second card inside the sheet.
- The sheet must stay compact on mobile and iPad portrait/landscape test frames.

## Document Storage Direction

Current state:

- Receipt photos are already lightened client-side before upload.
- SVG action assets are small and suitable for shell caching.

Direction, not fully implemented yet:

- Atlas should store session metadata and attachment references, not become a long-term heavy photo archive.
- Submitted reports should eventually have an explicit retention policy or external object storage.
- Recommended future design: object storage for files, Atlas for metadata, report retention such as 30/60 days unless legal/product requirements demand longer storage.

## Current Verification

Latest accepted local checks:

```bash
node --check ship-cashbox/assets/app.js
sh ship-cashbox/scripts/smoke-local.sh
```

Smoke accepted on:

```text
SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-78
```

Test Chromium was hard-restarted on:

```text
/ship-cashbox/index.html?reload=20260606-cashbox-layout-stabilize-78&cache-reset=hard
```

## Boundaries

Do not touch without explicit permission:

- Main public website behavior outside Ship Cashbox.
- Nav Desk.
- `css/navdesk.css`.
- `js/main.js`.
- `js/seo.js`.
- `index/navdesk/html`.
- `build-language-pages`.

Do not open or print `.ship-cashbox.env`.

Do not solve future Ship Cashbox layout bugs by piling a new CSS override layer over old broken contracts. If a screen regresses, first identify the active DOM contract and owning CSS scope.

## Menu: Trash Replaces Archive

Accepted update: 2026-06-06, shell `20260606-cashbox-layout-stabilize-79`.

The former user-facing `Архив` is now `Корзина` in both personal and group modes.

Rules:

- The internal route/API names may still use `archive` as a technical legacy term.
- The user-facing menu, window title, empty state, status, delete text, and restore confirmation must say `Корзина` / `из корзины`.
- In the cashbox menu, `Корзина` belongs at the bottom after service/install actions.
- The trash meaning is closed/restorable/deletable session cards, not document links.
- Document links are stored with the session: `attachment_post_id` and `attachments[]` with `file_path` metadata. In local runtime, physical files are under `/ship-cashbox/attachments/...`; Atlas stores session metadata, not a long-term heavy photo archive.

## Current Handoff Update: 2026-06-07

Current handoff file:

```text
docs/ship-cashbox-handoff-current.md
```

Current accepted runtime versions:

```text
Front shell: 20260606-cashbox-layout-stabilize-104
SW cache: ship-cashbox-shell-v20260606-230
API: 2026.06.07-ship-cashbox-personal-reports-scope-01
Smoke: SMOKE_OK http://127.0.0.1:18090 20260606-cashbox-layout-stabilize-104
```

Personal reports are now part of the active etalon direction:

- `Начать отчет` opens a clean ЖЗ for the newly active report.
- Existing active draft is preserved as `Без отчета` before new report start.
- New ЖЗ submissions inside an active personal report carry `report_id` and `record_scope: report`.
- `Без отчета` is a visual focus for standalone records, not a separate arithmetic report.
- Empty reports cannot be fixed; API returns `409`.
- `Закрепить отчет` belongs on the concrete non-empty report card, not in the generic report window footer.

The next director must read `docs/ship-cashbox-handoff-current.md` before making changes.
