# Task 0008 — Public Tool Auth Gateway for Protected Utilities

**Task ID:** `BRK-MVP-BE-007`
**Owner:** `CHAT-BRK-BE-IMPL-001`
**Status:** `In Progress`
**Date:** `2026-05-29`

## Goal

Prepare a production-safe user authentication layer for public tool usage (NavDesk, Watches, route calculators, etc.) so that:

- regular content pages (home/service/journal feed/read pages) remain fully open;
- utility actions are gated by either Google sign-in **or** friendly email 6-digit code flow;
- the owner can run/monitor from public context without opening any admin flows.

## Current State Evidence

- In `brkovic-ltd` public pages there is
  - full admin auth only in `admin-posts.html`/`admin-comments.html` (via `/api/admin/*`),
  - no public visitor auth for NavDesk/tool actions,
  - no shared public user session helper in `js`.
- 2026-05-29: на live зафиксировано частичное совпадение контрактов: существует `/api/auth/me` и `/api/auth/logout` (POST), но отсутствует ожидаемый путь-семантик `/api/auth/user/*`.
- `navdesk*` and tool pages open directly and rely only on disclaimer modal for legal constraints.

## Operating Boundaries

- Backend base is `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`.
- Do not touch frontend business logic beyond required API contracts until FE task is accepted.
- Do not expose or print secrets, session tokens, SMTP creds, OTP secrets.
- Keep Russian editorial text ownership untouched.

## Architecture Rule (no-kitchen-sink, no frontend hack)

- **Canonical contract:** backend MUST implement and fully document `/api/auth/user/*` endpoints as the only source of truth for public tool auth.
- **Do not implement frontend fallback logic to guess routes.** FE must stay on one contract.
- **Backend compatibility policy:** `GET /api/auth/me` and `POST /api/auth/logout` may exist as compatibility aliases during migration, but they must delegate to `/api/auth/user/me` and `/api/auth/user/logout` respectively (same payload + status codes).
- **Contract parity:** behavior (errors, response shapes, status codes, cookies/session semantics, rate limits) for alias routes must stay identical to `/api/auth/user/*`.
- **Security:** no duplication by middleware bypass; sessions and anti-abuse counters are single-source and shared.

## Required Backend Work

1. Add user-auth module (independent from existing admin auth):
   - `POST /auth/user/request-code` (email)
   - `POST /auth/user/verify-code` (email + 6-digit code)
   - `GET /auth/user/me`
   - `POST /auth/user/logout`
   - `GET /api/auth/me` + `POST /api/auth/logout` as migration aliases only (same handlers).
   - optionally `POST /auth/user/google/start` + callback if OAuth is available in current deployment.
2. Add anti-abuse controls:
   - per-email rate limiting,
   - cooldown + retry lockouts,
   - short code TTL (5–10 min).
3. Add session persistence and `user-session` check middleware helper for protected tool routes.
4. Add minimal user table or migration for temporary visitor identity (email + verifiedAt + lastSeenAt + active session id).
5. Return minimal safe profile payload (`{ authenticated, email, displayName, authProvider, sessionExpiresAt }`).
6. No tool business data should leak if unauthenticated.

## Route Boundary

Protected routes should include:

- tool action endpoints under `brkovic.ltd` static tools that write local data,
- any future “paid/registered only” features,
- without affecting `GET /api/public/journal`, comments, likes, or public contact forms.

## Acceptance Checks

- Unauthenticated visitor can browse all public copy and entries.
- Tool action attempt returns auth-needed signal before writing state.
- `request-code` + `verify-code` flow works with 6-digit code.
- `GET /auth/user/me` returns stable shape.
- No secrets in logs/responses.
- Temporary alias compatibility check: `GET /api/auth/me` and `POST /api/auth/logout` return the same shape/semantics as `/api/auth/user/me` and `/api/auth/user/logout`.

## Deliverable

Report: `docs/brkovic_ltd_project_office/reports/backend-engineer-tool-auth-gateway-2026-05-29.md`
