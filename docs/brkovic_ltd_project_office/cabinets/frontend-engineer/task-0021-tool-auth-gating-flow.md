# Task 0021 — Tool Access Gating (Google or Email OTP)

**Task ID:** `BRK-MVP-FE-021`
**Owner:** `CHAT-BRK-FE-IMPL-001`
**Status:** `In Progress`
**Date:** `2026-05-29`

## Goal

Implement an unobtrusive tool-gating UX for `brkovic-ltd` public pages:

- main content stays visible (homepage/services/journal entries),
- starting a tool flow asks for auth if session is missing,
- auth choices: **Google sign-in** or **email 6-digit code**,
- no redesign, only functional UX wrappers.

## Inputs

- Backend contract from `BRK-MVP-BE-007`:
  - `/auth/user/request-code`
  - `/auth/user/verify-code`
  - `/auth/user/me`
  - `/auth/user/logout`

## Required Frontend Work

1. Add shared `js/tool-auth.js` (or inline shared block in `js/main.js`) that:
   - checks auth status once on page interaction,
   - stores auth hints in sessionStorage/localStorage in minimal shape,
   - exposes `ensureToolAccess()` and `openToolAuthPrompt()`.
2. Add one modal (single source) for all tool pages:
   - title + short rationale,
   - button group: Continue with Google / Send 6-digit email code,
   - code input + resend timer + retry states,
   - dismiss button.
3. Connect to tool entry points:
   - cards/links on NavDesk hub,
   - first action on `navdesk*` pages,
   - any future tool-level buttons that mutate state.
4. Ensure existing NavDesk disclaimer behavior remains unchanged.
5. Add graceful close behavior:
   - Esc closes prompt,
   - click on backdrop closes prompt,
   - keyboard focus return.

## Constraints

- Keep landing/read content fully accessible.
- Keep old visible behavior for comments/likes/journal read if backend still allows anonymous actions.
- Do not replace language/translation behavior; no visible RU/EN refactor.

## Acceptance Checks

- Tool interaction from anonymous user shows auth prompt and blocks tool action.
- Authenticated user continues to workflow without extra prompts.
- Main site read flow unchanged.

## Deliverable

Report: `docs/brkovic_ltd_project_office/reports/frontend-tool-auth-gating-flow-2026-05-29.md`
