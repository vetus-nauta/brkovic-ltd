# Target Language Matrix - 2026-05-28

**Task:** `BRK-MVP-LOC-004`
**Role:** Localization Architect
**Status:** For Review

## Director Summary

The project language strategy is not `RU/EN`.

Owner clarification on 2026-05-28 sets the target model:

- English is the primary public site language.
- Additional language versions: Russian, German, Italian, Spanish, regional Serbian/Montenegrin/Croatian, Mandarin.
- The owner writes Ship Journal source material in Russian first; AI translation/SEO drafts must preserve that source, media, order and metadata.

## Evidence And Correction

Older handoff evidence:

- current active technical languages were `ru` and `en`;
- future planned list included `de`, `it`, `fr`, `sr`, `zh`.

Current correction:

- `fr` is not active project direction unless the owner reinstates it;
- Spanish (`es`) is part of the current target direction;
- `srb/mne/hr` must be treated as a real regional language direction, not collapsed into "maybe Serbian" without SEO/Localization decision.

## Target Matrix

| Code | Human label | Public role | Current frontend state | Decision status |
| --- | --- | --- | --- | --- |
| `en` | English | Primary public site language | `lang/en.json` exists and is selectable | Active, but page-by-page SEO/copy review still required |
| `ru` | Русский | Additional public language; canonical journal authoring source | `lang/ru.json` exists and is selectable | Active |
| `de` | Deutsch | Future public language | Shown as planned, not selectable | Needs translation storage/content/SEO |
| `it` | Italiano | Future public language | Shown as planned, not selectable | Needs translation storage/content/SEO |
| `es` | Español | Future public language | Shown as planned, not selectable | Owner-approved target replacing old unapproved `fr` direction |
| `sr` | Srpski / crnogorski / hrvatski | Future regional language direction | Shown as planned, not selectable | Placeholder code until locale/URL decision |
| `zh` | 中文 / Mandarin | Future Mandarin direction | Shown as planned, not selectable | Placeholder code until script/locale decision |

## Frontend Rule

The site menu may show the full roadmap, but only languages with real language files and content may be clickable.

Current selectable languages:

```text
en
ru
```

Current planned/non-clickable languages:

```text
de
it
es
sr
zh
```

Do not return a compact `RU/EN` switch. It misrepresents the project.

## Journal AI Workflow Rule

Russian remains the author's working source in the journal admin:

1. Owner writes title, excerpt, text, image alt/caption and media/GPS data in Russian.
2. AI language desk creates drafts for target languages.
3. Drafts receive SEO fields per language.
4. Nothing publishes automatically.
5. Translation rows must preserve post/collection structure, media order, page order, status and engagement ownership.

## SEO Gate

Do not add `hreflang`, sitemap language URLs or public indexing for planned languages until:

- language-specific content exists;
- URL strategy exists;
- canonical/hreflang policy exists;
- metadata and social preview fields are approved per language;
- backend/admin review and publish statuses exist.

## Open Questions

- Should `srb/mne/hr` become one regional Latin-script language version or separate localized versions?
- Should Mandarin use simplified Chinese, traditional Chinese, or both later?
- Should existing English journal fields be treated as approved content or regenerated/reviewed through the new AI desk?

## Immediate Implementation Consequence

Frontend language registry and the menu should present English as primary and expose the full roadmap, while `normalizeLang()` and `setLanguage()` load only `en` and `ru` until more language files exist.
