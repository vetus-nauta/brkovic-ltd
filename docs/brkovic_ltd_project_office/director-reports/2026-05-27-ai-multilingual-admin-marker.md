# Director Marker: AI Multilingual Journal Admin

**Date:** 2026-05-27
**Owner:** Director of BRKOVIC.LTD MVP
**Task:** `BRK-MVP-LANGAI-001`

## Decision

Multilingual journal publishing is a first-class project requirement, not a decorative translation button.

The owner writes and publishes from the admin in Russian first. Russian title, excerpt, full text, media, GPS/geotag metadata, captions, and Russian alt text are the canonical source. The admin must later include a dedicated AI language desk that uses the owner's OpenAI account to create/update duplicates for many target languages while preserving journal structure and SEO.

## Non-Negotiables

- Do not scale the admin by adding separate fixed fields for every language.
- Do not expose OpenAI keys in browser JavaScript.
- Do not commit secrets or account tokens.
- Do not auto-publish generated language versions without owner approval.
- Do not rewrite the owner's final Russian voice without explicit approval.
- Do not treat legacy free/browser translation helpers as the final architecture.

## Required Future Shape

- Translation rows per entity/language, for example `JournalTranslation`.
- Media translation rows per media/language, for example `JournalMediaTranslation`.
- Per-language status: missing, generated, needs review, approved, published, failed.
- Per-language SEO title, SEO description, share excerpt, alt/caption.
- Prompt/rules version and glossary version stored with generated drafts.
- Source revision/hash stored so stale translations can be detected.
- Crawlable public language URL and hreflang/canonical plan before indexing.

## Office Routing

Primary cabinet:

```text
docs/brkovic_ltd_project_office/cabinets/seo-i18n/
```

Required backend consult:

```text
docs/brkovic_ltd_project_office/cabinets/backend-admin/
```

Assigned task:

```text
docs/brkovic_ltd_project_office/cabinets/seo-i18n/task-0002-ai-multilingual-admin-architecture.md
```

Expected report:

```text
docs/brkovic_ltd_project_office/reports/ai-multilingual-admin-architecture-2026-05-27.md
```
