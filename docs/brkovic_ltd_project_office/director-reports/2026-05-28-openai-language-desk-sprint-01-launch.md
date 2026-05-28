# OpenAI Language Desk Sprint 01 Launch - 2026-05-28

**Owner:** `CHAT-BRK-DIRECTOR-001`  
**Status:** launched  
**Main rule:** OpenAI is server-side only; no browser key, no auto-publish, no production mutation.

## Purpose

The owner has added OpenAI credits and the local API key is now live.

This sprint moves the multilingual journal plan from architecture into the first backend/admin implementation layer. It does not translate real posts yet and does not change the public interface.

## Confirmed

Local key file:

```text
~/.config/brkovic-ltd/openai.env
```

Safe API health check result:

```text
openai_models_http=200
openai_health=ok
```

The key value was not printed, copied into Git, pasted into reports, or sent to browser code.

## Target Language Model

Canonical authoring flow:

- the owner writes journal posts in Russian;
- Russian text, media order, GPS/geotags, Russian alt/captions and Russian SEO remain the source;
- AI drafts other language versions only through an authenticated backend endpoint;
- every generated language stays in review until the owner approves it.

Target languages for the backend/admin plan:

```text
en
ru
de
it
es
sr
zh
```

Notes:

- English is the primary public language baseline.
- Russian is active and remains the canonical owner-writing language for journal posts.
- `sr` temporarily represents the shared Serbian/Montenegrin/Croatian regional layer until the Localization Architect fixes final locale codes.
- Mandarin is represented as `zh` until SEO/Localization define the exact public locale code.

## Sprint Package

| Workstream | Task | Status | Output |
| --- | --- | --- | --- |
| DIR | `BRK-MVP-DIR-006` OpenAI Language Desk Sprint 01 launch | For Review | this report |
| BE | `BRK-MVP-BE-004` OpenAI live-key health and boundary confirmation | For Review | `reports/openai-live-key-health-2026-05-28.md` |
| BEIMPL | `BRK-MVP-BEIMPL-004` Local backend skeleton implementation | For Review | `reports/backend-engineer-openai-language-desk-local-skeleton-2026-05-28.md` |

## Implementation Order

### 1. Backend Skeleton

Implement in:

```text
/home/alexey/.local/share/brkovic-ltd/work/journal-backend
```

Allowed:

- OpenAI config loader that reads `OPENAI_API_KEY` server-side;
- AI module/service with provider stub by default;
- authenticated admin translation endpoints;
- writes into existing `JournalTranslation` and `JournalMediaTranslation`;
- status `NEEDS_REVIEW`;
- build and Prisma validation.

Not allowed:

- production deploy;
- live database mutation;
- browser OpenAI code;
- printing secrets;
- auto-publishing generated text;
- overwriting `PUBLISHED` translations.

### 2. Health Gate

Use:

```bash
tools/openai-health-check.sh
```

This script may confirm API availability, but it must never print the API key or response body.

### 3. Admin UI Later

After backend skeleton builds, a later frontend task may add a compact admin-only language desk section.

First UI slice should be small:

- language checklist;
- generate drafts;
- per-language status;
- review/edit/publish later.

No redesign of the journal admin writing flow.

## Progress Update

First backend slice is implemented locally:

- server-only OpenAI config loader added;
- AI module/service added in stub mode;
- authenticated admin translation endpoints added for posts and journal collections;
- generated drafts write `NEEDS_REVIEW`;
- `PUBLISHED` translations are not overwritten;
- backend build passed;
- Prisma schema validation passed;
- no production, FTP, live DB mutation or real OpenAI generation occurred.

## Stop Rules

Stop before:

- translating real owner posts in bulk;
- adding public language URLs;
- adding `hreflang`;
- indexing generated languages;
- changing Russian source text;
- using OpenAI from browser JavaScript;
- publishing generated text automatically.
