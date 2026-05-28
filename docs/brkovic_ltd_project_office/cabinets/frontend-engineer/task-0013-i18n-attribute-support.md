# Task 0013 - I18N Attribute Support

**Task ID:** `BRK-MVP-FE-013`  
**Owner Chat:** `CHAT-BRK-FE-IMPL-001`  
**Status:** Assigned  
**Created:** 2026-05-28

## Assignment

Add a narrow technical foundation to the frontend i18n engine so future tasks can localize accessibility and metadata attributes safely.

This is not redesign and not translation generation.

## Scope

Allowed write scope:

```text
js/language.js
docs/brkovic_ltd_project_office/reports/frontend-i18n-attribute-support-2026-05-28.md
```

No HTML/CSS/layout changes. No `lang/*.json` expansion unless a syntax fix is required by the task, which is not expected.

## Required Behavior

`applyTranslations()` must support:

- `data-i18n-aria-label` -> `aria-label`;
- `data-i18n-title` on normal elements -> `title`;
- `data-i18n-alt` -> `alt`.

Important: existing root-level `<html data-i18n-title data-i18n-description>` behavior must stay intact. Do not accidentally set a `title` attribute on `<html>` as a side effect.

## Guardrails

- Do not change visible text.
- Do not change language options or roadmap.
- Do not make planned languages clickable.
- Do not touch production, FTP, backend, data, secrets or OpenAI config.
- Do not rewrite Russian owner copy.
- Preserve NavDesk disclaimer and day/night behavior.

## Required Checks

Run:

```bash
node --check js/language.js
node -e "const fs=require('fs'); for (const f of ['lang/ru.json','lang/en.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
git diff --check -- js/language.js docs/brkovic_ltd_project_office/reports/frontend-i18n-attribute-support-2026-05-28.md
```

Recommended DOM smoke:

- create temporary DOM elements in a local/headless check or document manual verification that the new attributes are supported;
- verify existing document title/meta description behavior remains unchanged.

## Required Output

```text
docs/brkovic_ltd_project_office/reports/frontend-i18n-attribute-support-2026-05-28.md
```

Report changed files, checks and any residual risk.
