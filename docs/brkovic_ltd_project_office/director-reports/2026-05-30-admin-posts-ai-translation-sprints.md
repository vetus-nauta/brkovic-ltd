# Admin Posts AI Translation Sprints

Date: 2026-05-30
Owner: Director
Status: Sprint 1-2 implemented locally, Sprint 3 audited and queued

## Sprint 1 - Admin Desk UX

Goal: remove the old manual RU/EN editing model from the normal owner workflow.

Steps:
1. Keep the canonical editor Russian-first: title, excerpt, body.
2. Hide legacy EN/manual translation fields from the main workflow without deleting stored data.
3. Replace the AI button cluster with one visible action: `Сгенерировать все переводы`.
4. Rename the save action to one visible `Сохранить`.
5. Add clear busy/status feedback for saving.

Result: implemented in `admin-posts.html` and `js/admin-posts.js`.

## Sprint 2 - Generation And Publication Flow

Goal: make OpenAI generation replace old draft rows and make Save publish generated translations.

Steps:
1. Generate all site languages by default: `en`, `de`, `it`, `es`, `sr`, `zh`.
2. Send `force:true` so old `DRAFT` / `NEEDS_REVIEW` rows are regenerated.
3. Preserve backend protection for already `PUBLISHED` translations.
4. Add frontend request timeout handling.
5. Publish generated translation rows on Save through existing translation patch routes.
6. Allow backend translation status transition to `PUBLISHED`.

Result: implemented in frontend admin JS and backend translation service.

## Sprint 3 - Public Language Surface

Goal: make the public journal read official translation rows, not only legacy EN fields.

Steps:
1. Expose published `JournalTranslation` rows in public journal post endpoints.
2. Expose published `JournalMediaTranslation` rows for media alt/caption.
3. Expose published collection/page translations.
4. Update public journal JS to resolve all site languages.
5. Stop relying on browser-side free translation fallback for journal text.
6. Track non-journal untranslated hardcoded chunks separately, starting with NavDesk.

Result: public journal bridge implemented locally; NavDesk audit completed and queued as the next localization sprint.

## Live Findings

- `/api/health/translation` reports OpenAI configured, live mode enabled, and live generation available.
- Authenticated translation routes are reachable for posts and collections.
- Existing translation rows include old stub drafts such as `[DE draft]`; without `force:true`, the old UI could skip regeneration and appear broken.
- Public API previously selected legacy `titleEn/contentEn/altEn` fields, so generated `JournalTranslation` rows were not the main public source.

## Next Localization Queue

1. NavDesk dashboard HTML keys.
2. NavDesk watch/log status strings.
3. NavDesk route/tide print templates.
4. Standalone NavDesk page hero/action strings.
5. Weather and tool-auth modal runtime strings.
