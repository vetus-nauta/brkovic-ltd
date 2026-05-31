# Task 0014 - Tool Auth OTP Re-Check After BE-010

**Task ID:** `BRK-MVP-QAUX-014`
**Owner:** `CHAT-BRK-QA-UX-001`
**Status:** `Ready After BE-010`
**Date:** `2026-05-30`
**Depends on:** `BRK-MVP-BE-010`

## Goal

Run the single OTP smoke that decides whether the public tool-auth email-code path is usable after the backend TTL/delivery fix.

## Scope

QA only. Do not edit frontend, backend, database, FTP, or production files.

Test after Backend Engineer reports `BRK-MVP-BE-010` green or explicitly ready for live/staged smoke.

## Required Checks

1. Fresh guest opens a protected tool action and sees the auth modal.
2. `request-code` for a real test email returns success and does not immediately poison the code.
3. Correct code verifies successfully.
4. Wrong code returns invalid-code behavior, not immediate `CODE_EXPIRED`.
5. Cooldown/rate-limit state is understandable and recoverable.
6. Authenticated session suppresses repeat prompts in the same browser session.
7. Guest read-only pages remain readable.

## Viewports

```text
desktop
tablet
mobile
```

## Required Output

```text
docs/brkovic_ltd_project_office/reports/backend-tool-auth-otp-gate-smoke-2026-05-30.md
```

## Acceptance Criteria

PASS only if OTP delivery/verification is proven end-to-end or the backend provides an approved safe QA-code retrieval path for the staged environment.

Required short reply:

```text
BRK-MVP-QAUX-014 done.
Report: docs/brkovic_ltd_project_office/reports/backend-tool-auth-otp-gate-smoke-2026-05-30.md
Tests:
- desktop/tablet/mobile OTP smoke
Scope preserved:
- frontend/backend/database/FTP not touched.
Next expected: QAUX-013 final tool-auth gate smoke or Director blocker decision.
```
