# OpenAI API Key Server Boundary - 2026-05-27

**Owner:** `CHAT-BRK-DIRECTOR-001`
**Related tasks:** `BRK-MVP-LANGAI-001`, `BRK-MVP-BE-002`, `BRK-MVP-LOC-001`
**Status:** boundary approved as project rule, implementation pending

## Decision

The owner has an active OpenAI API key.

The key is never stored in Git, frontend JavaScript, HTML, `lang/*.json`, Google Drive reports, project-office reports, screenshots, or chat transcripts.

All OpenAI calls for journal translations and SEO drafts must go through a server-side authenticated backend endpoint.

## Official API Guidance Checked

OpenAI API docs checked on 2026-05-27:

- API credentials use bearer authentication.
- API keys are secrets.
- Keys should be loaded from a server environment variable or key-management service.
- Keys must not be exposed in client-side browser/app code.
- GPT-5.5 guidance recommends the Responses API for current reasoning-model workflows.
- Structured Outputs should be used where the application expects a predictable JSON schema.

Reference pages:

```text
https://developers.openai.com/api/reference/overview#authentication
https://developers.openai.com/api/docs/guides/latest-model#using-reasoning-models
https://developers.openai.com/api/docs/guides/structured-outputs
```

## Local Secret Placement

Preferred local file:

```text
~/.config/brkovic-ltd/openai.env
```

Safe local creation command:

```bash
install -d -m 700 ~/.config/brkovic-ltd
umask 077
read -rsp "OpenAI API key: " OPENAI_API_KEY; echo
printf 'OPENAI_API_KEY=%s\n' "$OPENAI_API_KEY" > ~/.config/brkovic-ltd/openai.env
unset OPENAI_API_KEY
chmod 600 ~/.config/brkovic-ltd/openai.env
```

Presence check without printing the key:

```bash
test -s ~/.config/brkovic-ltd/openai.env && echo "OpenAI key stored locally"
```

Local status on `Vetus-Home`:

```text
~/.config/brkovic-ltd/openai.env exists
directory permissions: 700
file permissions: 600
secret value was not printed or copied into project files
```

## Production Secret Placement

Preferred production choices:

```text
OPENAI_API_KEY as a hosting environment variable
/home/brkovic/private/openai.env
```

Forbidden production choices:

```text
public_html/*.js
public_html/*.html
public_html/lang/*.json
docs/
Google Drive
GitHub
admin-posts.html inline scripts
```

## Repository Guardrails Added

`.gitignore` now excludes likely local secret files:

```text
/.env
/.env.*
/openai.env
/api/openai.config.php
```

`api/openai.config.example.php` was added as a placeholder-only example. It is not a real key file.

## AI Language Desk Shape

The admin remains Russian-first.

Owner creates canonical Russian content:

- title;
- excerpt;
- body;
- photos;
- GPS/geotags;
- Russian media alt/captions;
- Russian SEO.

The AI language desk later generates draft translations and SEO fields per target language.

Required statuses:

```text
missing
generated
needs_review
approved
published
failed
stale
```

AI output is never public until owner review and publish action.

## Recommended API Shape

Authenticated backend endpoints:

```text
POST /api/admin/posts/:id/translations/generate
POST /api/admin/journal-collections/:id/translations/generate
```

Backend responsibilities:

- load OpenAI key server-side;
- calculate source revision hash;
- call OpenAI Responses API;
- require structured JSON output;
- validate JSON schema;
- save translation/media/SEO drafts;
- store model, prompt rules version, glossary version, generation time and errors;
- return per-language status.

## Model And Output Notes

Initial recommended model policy:

```text
model: gpt-5.5
reasoning.effort: low
text.verbosity: medium
```

Reasoning can be raised for difficult literary or nautical posts after quality testing.

The backend should use structured outputs for fields:

```text
title
excerpt
content
seoTitle
seoDescription
shareExcerpt
media[].alt
media[].caption
warnings[]
```

## Next Implementation Task

Backend/Admin gets `BRK-MVP-BE-002`:

```text
docs/brkovic_ltd_project_office/cabinets/backend-admin/task-0002-openai-language-desk-server-boundary.md
```

This is implementation design only until Director approves exact code/backend scope.
