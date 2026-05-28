# SEO Integration Director Setup - 2026-05-28

**Owner:** `CHAT-BRK-DIRECTOR-001`
**New role:** `CHAT-BRK-SEO-DIR-001` / SEO Integration Director
**Status:** Ready for new dedicated chat

## Decision

The existing `SEO & Languages Lead` cabinet remains the audit and language-readiness role. A new director-level SEO cabinet is created for professional integration into public search.

Reason: BRKOVIC.LTD pages are not interchangeable. Home, service pages, journal, NavDesk tools and the future Maritime English section have different search intent, usefulness and indexing risk. They need page-specific SEO agents under one SEO director.

## New Cabinet

```text
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/
```

Important entry files:

```text
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/README.md
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/task-0001-role-intake-and-page-agent-map.md
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/new-chat-prompt.md
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/page-agents/
```

## Page Agents Created

- Home.
- Yacht management.
- IYT training.
- Skipper service.
- Sailing tours.
- Yacht acceptance and delivery.
- Yacht registration.
- Ship journal.
- NavDesk hub.
- NavDesk watch log.
- NavDesk tides.
- NavDesk route.
- NavDesk UKV/VHF.
- Maritime English.

## Mandatory SEO Vector

- Keep the owner's Russian voice under owner control.
- Do not turn every page into the same "personal expertise" slogan.
- Use personal expertise and practical sea experience as an entity/authority signal, then make each page satisfy its own search intent.
- Do not add hreflang until crawlable language URLs exist.
- Treat client-side language switching as UX, not final multilingual SEO.
- Journal multilingual SEO must use approved translation rows and per-language SEO gates.
- NavDesk requires index/noindex decisions before sitemap inclusion.

## Next Expected

Owner opens a new chat using:

```text
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/new-chat-prompt.md
```

The first output from that chat should be:

```text
docs/brkovic_ltd_project_office/reports/seo-integration-director-intake-2026-05-28.md
```
