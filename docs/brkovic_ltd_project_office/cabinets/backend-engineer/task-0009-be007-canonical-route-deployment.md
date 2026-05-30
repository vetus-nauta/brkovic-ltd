# Task 0009 — BRK-MVP-BE-007 Canonical Route Deployment Order

**Task ID:** `BRK-MVP-BE-007-A`
**Owner:** `CHAT-BRK-BE-IMPL-001`
**Status:** `Ready for backend implementation`
**Date:** `2026-05-29`
**Depends on:** task-0008-public-user-tool-auth-gateway

## Objective
Close the auth gating blocker by making `/api/auth/user/*` production-ready and add migration-safe aliases on `/api/auth/*` **without** front-end fallback hacks.

## Hard requirements

1. Implement canonical public tool auth endpoints:
   - `POST /api/auth/user/request-code`
   - `POST /api/auth/user/verify-code`
   - `GET /api/auth/user/me`
   - `POST /api/auth/user/logout`
2. Ensure these endpoints are identical by behavior to existing public tool auth intent (status codes, payload shape, session cookie semantics).
3. Add compatibility aliases:
   - `GET /api/auth/me` -> same handler as `/api/auth/user/me`
   - `POST /api/auth/logout` -> same handler as `/api/auth/user/logout`
4. Confirm no duplicate session/middleware logic; one shared auth/session module for all aliases.
5. Confirm request/verify flow supports 6-digit codes and code debug output only in safe/test mode if enabled.
6. Add minimal anti-abuse: per-email rate limits, cooldowns, TTL.

## Acceptance (hard)

- `[ ]` `GET https://brkovic.ltd/api/auth/user/me` returns `200` with payload including `authenticated` field.
- `[ ]` `POST https://brkovic.ltd/api/auth/user/request-code` returns non-5xx and stable auth-flow response.
- `[ ]` `POST https://brkovic.ltd/api/auth/user/verify-code` validates code and returns profile payload.
- `[ ]` `POST https://brkovic.ltd/api/auth/user/logout` returns success.
- `[ ]` `GET https://brkovic.ltd/api/auth/me` returns identical payload/semantics as `/api/auth/user/me`.
- `[ ]` `POST https://brkovic.ltd/api/auth/logout` returns identical payload/semantics as `/api/auth/user/logout`.
- `[ ]` `/api/auth/user/*` endpoints should be directly accessible through production without frontend proxy indirection.

## Smoke command (after implementation)

```bash
# direct checks
curl -i https://brkovic.ltd/api/auth/user/me
curl -i -X POST https://brkovic.ltd/api/auth/user/request-code -H 'Content-Type: application/json' -d '{"email":"test@brkovic.ltd"}'
curl -i -X POST https://brkovic.ltd/api/auth/user/verify-code -H 'Content-Type: application/json' -d '{"email":"test@brkovic.ltd","code":"000000"}'
curl -i -X POST https://brkovic.ltd/api/auth/user/logout -H 'Content-Type: application/json'
curl -i https://brkovic.ltd/api/auth/me
curl -i -X POST https://brkovic.ltd/api/auth/logout -H 'Content-Type: application/json'
```

## Notes

- Do not touch frontend contract while implementing this task.
- After deployment, FE should be retested with:
  - `tools/wait-for-tool-auth-backend.sh`
  - `tools/tool-auth-gate-smoke.sh`
