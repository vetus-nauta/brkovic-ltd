# Language Sprint 03 — DE/IT/ES/SR/ZH Roadmap Execution (2026-05-29)

**Task (owner):** `BRK-MVP-LOC-011`  
**Scope:** bring planned target languages from passive roadmap to execution readiness without changing page UX structure.

## State Check (Start of Sprint)

- Frontend language registry (`js/language.js`) already contained: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`.
- UI availability remained `en`/`ru` only; other languages were shown as roadmap/`Coming` in language panel.
- Backend translation route family already supported the target list:
  - `en`, `de`, `it`, `es`, `sr`, `zh`.
- Public dictionaries on disk were scaffolded for all planned target languages:
  - `lang/de.json`
  - `lang/it.json`
  - `lang/es.json`
  - `lang/sr.json`
  - `lang/zh.json`

## Sprint Outcome (2026-05-29)

### 1) Roadmap language dictionaries upgraded to first-pass translations

- Added full-key AI-supported translations for all keys in `lang/en.json` (863 keys each).
- Translated files now include:
  - all navigation labels,
  - site menu copy,
  - service/action labels,
  - journal and navdesk hints,
  - general SEO/title/description strings where present in the dictionary.

### 2) Process and checks used

- Data source: `lang/en.json`
- Language targets: `de`, `it`, `es`, `sr`, `zh`
- Model: OpenAI `gpt-4o-mini`, temperature `0`
- Transport: chunked requests (120 keys each) with JSON response format
- Validation:
  - each file parses as valid JSON,
  - each file has exactly `863` keys,
  - no missing/extra keys vs `lang/en.json`,
  - placeholder/token integrity check passed (`{}`, `[]`, `%s`, URLs, HTML tags).

### 3) Diff footprint vs English source

- `de`: 789 translated values vs `en` out of 863
- `it`: 806 translated values vs `en` out of 863
- `es`: 822 translated values vs `en` out of 863
- `sr`: 826 translated values vs `en` out of 863
- `zh`: 847 translated values vs `en` out of 863

### 4) Behavioral safety

- No layout/component changes were introduced in this sprint.
- No route/model behavior changed.
- Existing RU/EN behavior remains intact for public language switching.
- Roadmap entries remain controlled by `isAvailable: false` in `js/language.js` until launch gate is ready.

## Status

- **Localization sprint state:** `BRK-MVP-LOC-011` moved to **For Review** after first-pass translations.
- **Risk note:** these are draft localizations and still require tone/terminology review before enabling `isAvailable: true`.

## Next Execution Phase (continuation)

1. Publish a first review snapshot for owner sign-off on DE/IT/ES/SR/ZH dictionaries.
2. Align SEO/metadata strategy for these locales.
3. Open admin translation generation smoke for each locale in:
   - posts and collections,
   - status transitions (`DRAFT`/`NEEDS_REVIEW`),
   - export/import behavior.
4. Final gate:
   - set `isAvailable` to `true` progressively after copy + SEO approval per language page scope.

### Sprint 03 — Current Progress

- Step 1 (localization snapshots) — completed (first-pass dictionaries landed, diff/validation completed).
- Step 3a (route smoke baseline, anonymous/401 check) — completed in `tools/journal-admin-translation-smoke.sh`.
- Step 3b (authorized generation smoke for selected post/collection and target languages) — completed on live endpoints:
  - post: `11718191-e852-4db4-84fe-02b09e6ab717`
  - collection: `ddfd23e6-1cad-4341-a5fe-cd2467213229`
  - status: `200/201` for all stage-3/4 checks.

### Backend translation behavior note

- Endpoints return `provider.configured: false`, `providerMode: "stub"`, `liveGenerationAvailable: false` on generation responses.
- Следующий шаг для бизнес-результата: включение production OpenAI/translation provider в backend.

## Deliverable reference

- Updated by: `BRK-MVP-LOC-011`  
- File changes: `lang/de.json`, `lang/it.json`, `lang/es.json`, `lang/sr.json`, `lang/zh.json`
