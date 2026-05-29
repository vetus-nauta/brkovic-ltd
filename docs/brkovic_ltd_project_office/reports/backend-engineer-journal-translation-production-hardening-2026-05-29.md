# Backend Report: Journal Translation Production Hardening (Task BRK-MVP-BEIMPL-006)

**Task ID:** `BRK-MVP-BEIMPL-006`  
**Date:** 2026-05-29  
**Owner chat:** `CHAT-BRK-BE-IMPL-001`  
**Status:** `Approved`  
**Branch:** `handoff-2026-05-20-full`

## Mission

Implement production-grade stability for journal translation operations after stub/live transition:
- provider health/observability,
- idempotent generation,
- strict validation,
- safe error taxonomy,
- rate/duplication controls,
- repeatable smoke validation.

## Baseline (2026-05-29 19:00 CEST)

- Authenticated route availability is confirmed for post/collection translation endpoints using IDs:
  - Post: `11718191-e852-4db4-84fe-02b09e6ab717`
  - Collection: `ddfd23e6-1cad-4341-a5fe-cd2467213229`
- Current provider status from generate endpoints:
  - `provider.configured=true`
  - `providerMode="live"`
  - `liveGenerationAvailable=true`
- Translations currently return as draft items (`NEEDS_REVIEW`) with generated content.

## Live Probe (2026-05-29 19:11-19:12 CEST)

- `tools/journal-admin-translation-smoke.sh` on production with valid admin creds passed all auth and route checks for:
  - `POST /api/admin/posts/:id/translations/generate`
  - `POST /api/admin/journal-collections/:id/translations/generate`
  - plus anonymous 401 guards and GET translation list routes.
- Same check confirms provider is now `configured=true` and `providerMode="live"` on both post and collection generate paths.
- Additional probe: `/api/health/translation` now returns full provider health payload with live configuration.
- Conclusion: production backend is functionally compatible with new route shape and supports localized generation (including 5-language matrix), with live OpenAI provider and health endpoint in place.

## Handoff Note

Task created as a strong backend continuation after `BRK-MVP-BEIMPL-005` (enable live provider).
No frontend/UI changes are requested as part of this task.

## Inputs to Use

- Backend workspace: `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`
- Frontend admin endpoints and behavior docs: existing journal admin translation tasks
- Previous reports:
  - `reports/backend-engineer-live-journal-translation-provider-2026-05-29.md`
  - `reports/openai-language-desk-implementation-notes-2026-05-27.md`
  - `reports/openai-live-key-health-2026-05-28.md`

## Acceptance Criteria

- Clear live/stub status exposed safely.
- Controlled generation behavior with explicit `force` semantics.
- Language validation hard-fails malformed/unsupported language requests.
- Provider errors mapped to stable codes without leaking internals.
- `npm run build` passes in backend repo.

## Next Step

Backend engineer starts implementation and updates this report with:
- files changed,
- schema/config decisions,
- smoke results,
- risks and rollout notes.

## Progress update (2026-05-29, backend implementation pass)

- Implemented in local backend workspace (`/home/alexey/.local/share/brkovic-ltd/work/journal-backend`):
  - `src/common/filters/all-exceptions.filter.ts` now propagates stable machine-readable `{ code, message }` from `HttpException` payloads.
  - `src/modules/admin/admin.module.ts` now wires `AiModule` and `AdminTranslationsService` for translation endpoints on existing admin controllers.
  - `src/modules/admin/posts/admin-posts.controller.ts`
    - added `GET /admin/posts/:id/translations`
    - added `POST /admin/posts/:id/translations/generate` with `force` support
    - added `PATCH /admin/posts/:id/translations/:language`
  - `src/modules/admin/collections/admin-journal-collections.controller.ts`
    - added `GET /admin/journal-collections/:id/translations`
    - added `POST /admin/journal-collections/:id/translations/generate` with `force` support
    - added `PATCH /admin/journal-collections/:id/translations/:language`
  - `src/modules/health/health.controller.ts` added `GET /health/translation`
  - `src/modules/health/health.service.ts` now includes translation provider health payload in both `/health` and `/health/translation`.
  - `src/modules/ai/openai-language.service.ts` production-hardening pass:
    - provider state (`lastError`, `lastSuccessfulCheck`, `configured`, `model`, flags)
    - structured provider errors with codes: `MISSING_KEY`, `PROVIDER_UNAVAILABLE`, `PROMPT_REJECTED`
    - timeout handling and OpenAI response envelope validation
  - `src/common/filters/all-exceptions.filter.ts` now preserves error code/message for frontend to read status.
  - `src/config/openai.config.ts` present and loaded from `app.module.ts`.
- Duplicate translation controller path (`admin/translations`) was intentionally left out of module registration to avoid route conflicts; translation routes are now handled only via existing `admin/posts` and `admin/journal-collections` controllers.
- `npm run build` currently passes.

### Known caveats / follow-up

- Frontend language-generation task UX still expects endpoint availability checks and green-status handling to be adjusted in a follow-up pass.
- We intentionally did not change frontend JS or live deployment scripts in this backend-only sprint.

### Smoke/check commands used

- `cd /home/alexey/.local/share/brkovic-ltd/work/journal-backend && npm run build`

## Completion Recheck (2026-05-29 23:29 CEST)

- `curl https://brkovic.ltd/api/health/translation` returns:
  - `configured:true`
  - `providerMode:"live"`
  - `model:"gpt-4o-mini"`
  - `liveGenerationAvailable:true`
- `tools/journal-admin-translation-smoke.sh` with valid admin creds:
  - anonymous guard `401` checks passed,
  - auth `GET/POST` endpoints for post and collection passed,
  - multilingual generate (en,de,it,es,sr,zh) passed (`201` where applicable),
  - no route-level runtime failures.
- Task accepted as live and routed to green in task-registry.
