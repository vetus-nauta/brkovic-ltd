# Task 0013 — Tool Auth Gate Smoke

**Task ID:** `BRK-MVP-QAUX-013`
**Owner:** `CHAT-BRK-QA-UX-001`
**Status:** `In Progress`
**Date:** `2026-05-29`

## Goal

Validate that tool-gating for public users works correctly and does not degrade read paths.

## Scope

- Desktop / tablet / mobile quick UX smoke.
- Main content accessibility before auth prompt.
- Gate behavior on tool start for:
  - NavDesk hub and at least 2 concrete tool pages,
  - journal tool-like actions if/where implemented.
- Fallback path: auth prompt close and continue as guest (read-only).

## Test Plan (minimum)

1. Open public homepage + services + journal:
   - no forced login,
   - no broken layouts.
2. Open NavDesk hub and click tool card:
   - auth modal appears;
   - Esc/backdrop close works.
3. Try email option:
   - request code -> verify code -> tool action continues.
4. Verify already-authenticated session:
   - prompt not shown repeatedly in same browser session.
5. Verify no regression in disclaimer/terms modal sequence.

## Deliverable

Report: `docs/brkovic_ltd_project_office/reports/qa-tool-auth-gate-smoke-2026-05-29.md`
