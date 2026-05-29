# Backend Report: Live Translation Provider Activation (Task BRK-MVP-BEIMPL-005)

**Task ID:** `BRK-MVP-BEIMPL-005`  
**Date:** 2026-05-29  
**Owner chat:** `CHAT-BRK-BE-IMPL-001`  
**Status:** `Approved`  
**Branch:** `handoff-2026-05-20-full`  

## Start Signal

Subtask launched from frontend-side language sprint context.

- Admin translation routes are reachable in production and authenticated.
- `providerMode` is now `live` and `provider.configured=true` on live generation routes.
- Live key visibility is confirmed on `/api/health/translation`.

## Current Evidence

- `POST /api/admin/posts/:id/translations/generate` reachable (`201`).
- `POST /api/admin/journal-collections/:id/translations/generate` reachable (`201`).
- Response includes:
- `provider.configured = true`
- `providerMode = "live"`
- `liveGenerationAvailable = true`

## Completion Check (2026-05-29 23:29 CEST)

- `GET /api/health/translation` returns `configured=true`, `providerMode="live"`, `liveGenerationAvailable=true`.
- `POST /api/admin/posts/:id/translations/generate` and `POST /api/admin/journal-collections/:id/translations/generate` return `201` with generated drafts for valid admin context.
- Task moved to `Approved` in registry after successful one-shot smoke with live credentials.

## Assignment Handed Off

- `docs/brkovic_ltd_project_office/cabinets/backend-engineer/task-0005-enable-live-journal-translation-provider.md`

## Next Checks (Backend Engineer)

1. Confirm `provider.configured` and `providerMode` become live when `OPENAI_API_KEY` is available.
2. Validate generation for at least one post and one collection in `de/en/it/es/sr/zh`.
3. Produce updated smoke/health response and run `npm run build` in backend repo.
