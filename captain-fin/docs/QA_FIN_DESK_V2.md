# QA gate: FinDesk v2

Date: 2026-06-01  
Scope: FinDesk v2 active sessions, live reports, money issues, balances, archive/finalize, mobile input.  
Decision rule: one failed item below blocks release. UI-only evidence is not enough; API must enforce the rule.

Note: current `captain-fin` build exposes action routes such as `api/?action=v2_state`, `api/?action=v2_issue_money`, and `api/?action=v2_confirm_issue`. `/api/v2/...` examples below are logical scenarios; route mapping is acceptable when the assertions are enforced by the API.

## Hard gate

| ID | Gate | Required result |
| --- | --- | --- |
| FD2-01 | Active sessions | `GET active` returns only non-finalized, non-archived sessions. Starting or joining a session must never revive old reports/issues. |
| FD2-02 | Owner / participant mode | Owner can see all participants, balances, pending issues, finalize/archive, and issue money. Participant can see and edit only own live report and own pending issue requests; participant can sign only own received money; participant cannot finalize, archive, issue money, or read another participant's data. |
| FD2-03 | One live report per participant per session | Duplicate create, refresh, retry, or concurrent submit must leave exactly one live report for `(session_id, participant_id)`. Second create returns same idempotent report or explicit duplicate error; it must not create a second report. |
| FD2-04 | Money issue lifecycle | Owner can create `pending`; pending is visible to owner and the target participant but not applied to confirmed balance/final report. Only the target participant can sign it to `confirmed`. Confirm is idempotent and applies the ledger effect exactly once. Confirmed issues are immutable except allowed audit metadata. |
| FD2-05 | Balances | Physical cash, card stream, pending exposure, and confirmed totals are separated. Card expense never changes physical cash. Pending money issue never changes confirmed balance. All balances are recomputed from server state, not trusted from client payload. |
| FD2-06 | Archive/finalize idempotency | Repeating `finalize` or `archive` returns the same terminal state: same session id, same `finalized_at`/`archived_at`, same final report/export id, no duplicate archive/export rows. Finalized/archived session is read-only and absent from active sessions. |
| FD2-07 | No old data in active session | A new active session for the same participant starts with empty live report/issues except explicit opening balances or server-approved carry-forward fields. Search/list endpoints must filter by `session_id`; old descriptions/receipts must not leak into active session UI or API. |
| FD2-08 | Mobile keyboard/input | Amount, description, issue reason, submit/confirm buttons remain reachable with keyboard open. Decimal input accepts dot/comma consistently. No autosave race creates duplicate report or loses the focused input. |

## Curl-like API scenarios

Use a test environment and unique names. Replace route names if the implementation uses different v2 paths; the assertions are mandatory.

```bash
BASE="https://brkovic.ltd/captain-fin"
OWNER_H="Authorization: Bearer <owner-token>"
A_H="Authorization: Bearer <participant-a-token>"
B_H="Authorization: Bearer <participant-b-token>"
A="participant-a-id"
B="participant-b-id"
```

### 1. Active session creation and isolation

```bash
curl -s "$BASE/api/v2/sessions/active" -H "$OWNER_H"

curl -s -X POST "$BASE/api/v2/sessions" \
  -H "$OWNER_H" -H "Content-Type: application/json" \
  -d '{"title":"QA FD2 2026-06-01","currency":"EUR","opening_balances":{"cash":0,"card":0}}'

curl -s "$BASE/api/v2/sessions/active" -H "$OWNER_H"
```

Expected: active list contains the new session once; no finalized/archived session appears.

### 2. Owner vs participant permissions

```bash
curl -i "$BASE/api/v2/sessions/$SID" -H "$OWNER_H"
curl -i "$BASE/api/v2/sessions/$SID" -H "$A_H"
curl -i -X POST "$BASE/api/v2/sessions/$SID/finalize" -H "$A_H" -H "Content-Type: application/json" -d '{}'
curl -i "$BASE/api/v2/sessions/$SID/participants/$B/live-report" -H "$A_H"
```

Expected: owner gets full session. Participant gets only self-scoped data or filtered view. Participant finalize is `403`. Participant A cannot read participant B report (`403` or `404`).

### 3. One live report per participant per session

```bash
curl -s -X POST "$BASE/api/v2/sessions/$SID/live-reports" \
  -H "$A_H" -H "Content-Type: application/json" \
  -d "{\"participant_id\":\"$A\"}"

curl -i -X POST "$BASE/api/v2/sessions/$SID/live-reports" \
  -H "$A_H" -H "Content-Type: application/json" \
  -d "{\"participant_id\":\"$A\"}"

curl -s "$BASE/api/v2/sessions/$SID/live-reports?participant_id=$A" -H "$OWNER_H"
```

Expected: second create returns same report or duplicate error; owner list has exactly one report for participant A in this session. Run the same create 3-5 times in parallel during automation; still exactly one report.

### 4. Entries and balance separation

```bash
curl -s -X PATCH "$BASE/api/v2/live-reports/$REPORT_A" \
  -H "$A_H" -H "Content-Type: application/json" \
  -d '{"entries":[
    {"type":"received_cash","amount":1000,"currency":"EUR","note":"QA cash in"},
    {"type":"cash_expense","amount":120,"currency":"EUR","note":"QA fuel cash"},
    {"type":"card_expense","amount":300,"currency":"EUR","note":"QA chandlery card"}
  ]}'

curl -s "$BASE/api/v2/sessions/$SID/balances" -H "$OWNER_H"
```

Expected: participant A physical cash is `880`; card spent is `300`; confirmed session cash is not reduced by card expense.

### 5. Money issue pending to confirmed

```bash
curl -s -X POST "$BASE/api/v2/sessions/$SID/money-issues" \
  -H "$OWNER_H" -H "Content-Type: application/json" \
  -d "{\"participant_id\":\"$A\",\"amount\":500,\"currency\":\"EUR\",\"reason\":\"QA cash advance\"}"

curl -s "$BASE/api/v2/sessions/$SID/balances" -H "$OWNER_H"

curl -i -X POST "$BASE/api/v2/money-issues/$ISSUE_ID/confirm" \
  -H "$OWNER_H" -H "Content-Type: application/json" -d '{}'

curl -s -X POST "$BASE/api/v2/money-issues/$ISSUE_ID/confirm" \
  -H "$A_H" -H "Content-Type: application/json" -d '{}'

curl -s -X POST "$BASE/api/v2/money-issues/$ISSUE_ID/confirm" \
  -H "$A_H" -H "Content-Type: application/json" -d '{}'

curl -s "$BASE/api/v2/sessions/$SID/balances" -H "$OWNER_H"
```

Expected: before confirm, `pending_money_issues` includes `500` and confirmed balance is unchanged. Owner confirm is `403`. Target participant confirm changes status to `confirmed` and applies `500` once. Repeated participant confirm returns same confirmed issue without a second ledger event. Another participant confirm is `403`.

### 6. Finalize and archive idempotency

```bash
curl -s -X POST "$BASE/api/v2/sessions/$SID/finalize" \
  -H "$OWNER_H" -H "Content-Type: application/json" -d '{}'

curl -s -X POST "$BASE/api/v2/sessions/$SID/finalize" \
  -H "$OWNER_H" -H "Content-Type: application/json" -d '{}'

curl -i -X PATCH "$BASE/api/v2/live-reports/$REPORT_A" \
  -H "$A_H" -H "Content-Type: application/json" \
  -d '{"entries":[{"type":"cash_expense","amount":1,"note":"must fail after finalize"}]}'

curl -s "$BASE/api/v2/sessions/active" -H "$OWNER_H"

curl -s -X POST "$BASE/api/v2/sessions/$SID/archive" \
  -H "$OWNER_H" -H "Content-Type: application/json" -d '{}'

curl -s -X POST "$BASE/api/v2/sessions/$SID/archive" \
  -H "$OWNER_H" -H "Content-Type: application/json" -d '{}'
```

Expected: both finalize calls return same final artifact and timestamp. Patch after finalize is `409`, `423`, or equivalent read-only error. Active list excludes `$SID`. Archive calls are idempotent and create no duplicate archive rows.

### 7. No old data in next active session

```bash
curl -s -X POST "$BASE/api/v2/sessions" \
  -H "$OWNER_H" -H "Content-Type: application/json" \
  -d '{"title":"QA FD2 next session","currency":"EUR","opening_balances":{"cash":0,"card":0}}'

curl -s "$BASE/api/v2/sessions/$SID2/participants/$A/live-report" -H "$A_H"
curl -s "$BASE/api/v2/sessions/$SID2/money-issues?participant_id=$A" -H "$A_H"
curl -s "$BASE/api/v2/sessions/$SID2/search?q=QA%20cash%20in" -H "$OWNER_H"
```

Expected: new live report is empty/new; no pending/confirmed issue from `$SID`; search in active session does not return old report rows or old issue notes.

## Manual mobile checks

Run on real iOS Safari and Android Chrome, plus one browser devtools run with throttled network.

1. Participant opens active session. Verify mode label/actions are participant-only; no owner finalize/archive/confirm controls are reachable.
2. Focus amount input, description, issue reason, and notes with keyboard open. Focused field stays visible; submit/add buttons are reachable by scroll; no fixed footer covers input.
3. Enter `10.50`, `10,50`, paste `1 234,56`, delete to empty, then type again. Server stores numeric value correctly; UI never shows `NaN` or silently converts to `0` on blur.
4. Add cash received, cash expense, and card expense from mobile. Reopen report. Rows, order, amounts, and balance categories are unchanged.
5. Owner creates pending money issue with keyboard open. It appears as pending, not confirmed. Refresh and reopen: still pending, no duplicate issue.
6. Target participant opens same session on mobile and signs the pending issue. Sign button cannot be double-tapped into duplicate ledger events; repeated tap keeps same confirmed issue.
7. Use browser Back from editor to list and back to editor while autosave is running. Latest input remains; no second live report appears.
8. Rotate portrait/landscape with keyboard open. Header, mode controls, amount input, and primary action remain usable; no dead touch zone remains after keyboard closes.
9. Finalize from owner mobile. Participant mobile refresh becomes read-only or exits active session; it cannot edit finalized data.
10. Start next session with same participant. Mobile active session must be visually empty except explicit opening balances; old rows/receipts/issues are not shown.

## Evidence required

- API request/response samples for each scenario above, including status codes.
- Balance snapshot before/after money issue confirm.
- Count proof for one live report per participant per session.
- Screenshot or screen recording for mobile keyboard checks on iOS and Android.
- Exact build/version and test session ids.
