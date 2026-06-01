# FinDesk V2 Sprint Plan

Date: 2026-06-01
Owner: Project Director

## Goal

Replace the current loose report list with a session-based FinDesk model.

The active screen must show only the selected active group/session. Old reports,
deleted records, previous balances, and unrelated sessions must not appear in the
working view.

## Product Rules

1. A user can work in owner mode or participant mode.
2. The selected mode must be remembered for convenience.
3. Server permissions remain authoritative; UI mode is not a security boundary.
4. A user can belong to one or more active groups and switch between them.
5. One active session contains one admin live report and one live report per participant.
6. A participant can submit only one live report per session.
7. The admin can submit only one own live report per session.
8. The admin finalizes one common report per session.
9. Finalized common reports are immutable.
10. Archived sessions disappear from the active working view.

## Money Rules

1. Money is stored in minor units as integers, not floats.
2. Giving cash to a participant is an internal transfer, not a business expense.
3. A transfer decreases admin cash and increases participant accountable cash.
4. A business expense is created only by a report entry.
5. Pending transfers are visible but not treated as confirmed cash until signed.
6. Confirmed transfers are not physically deleted; corrections use reversing events.
7. The common report must not double-count internal transfers.

## Sprint 1: Backend V2

Write scope: `api/index.php`, `storage/v2/*`.

Deliver:
- `v2_bootstrap`
- `v2_state`
- `v2_switch_mode`
- `v2_save_report`
- `v2_issue_money`
- `v2_confirm_issue`
- `v2_finalize_session`
- audit events
- atomic JSON writes

Do not break existing v1 endpoints.

## Sprint 2: FinDesk UI

Write scope: `index.html`, `assets/app.css`, `assets/app.js`.

Deliver:
- compact mode switch: owner / participant
- active group/session switch
- flat admin card first
- horizontal participant cards
- red pending issue status
- green signed issue status
- orange submitted-report marker
- latest issue visible
- expand last five issues
- old v1 tools inside Details or fallback only

## Sprint 3: Owner / Participant Behavior

Owner mode:
- create/manage sessions
- issue cash
- accept reports
- finalize common report
- view archives

Participant mode:
- see only assigned active groups
- see assigned/pending cash
- confirm received cash
- edit and submit own live report

## Sprint 4: Archive And QA

Deliver:
- one immutable common report per session
- archive of completed sessions
- no old data in active view
- mobile keyboard checks
- duplicate-click and two-tab checks
- direct API negative checks

## Non-Negotiable QA Gates

1. Reload does not restore old reports into an active session.
2. Two tabs cannot create two active reports for the same participant/session.
3. Double tap cannot create two common reports.
4. A participant cannot confirm someone else's issue.
5. A direct API call cannot mark final states without valid transition.
6. Archived session totals stay unchanged after later edits elsewhere.
