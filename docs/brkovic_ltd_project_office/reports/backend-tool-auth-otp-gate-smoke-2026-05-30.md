# Backend auth OTP: код-доставка и TTL (2026-05-30)

## Task

- Task ID: `BRK-MVP-BE-010`
- Backend worktree: `/home/alexey/.local/share/brkovic-ltd/work/journal-backend`
- Scope: NavDesk email-code auth gateway

## Diagnosis

- `request-code` creates a `ToolUserCode` row with `requestedAt`, `expiresAt`, `attempts = 0`, and no `consumedAt`.
- The immediate `CODE_EXPIRED` risk was in verification logic:
  - active-code selection did not filter by `expiresAt`;
  - expiry was derived from `requestedAt` after driver-side timestamp parsing;
  - expiry was checked before code matching, so a wrong code could surface as `CODE_EXPIRED` when the selected row was stale.
- Request cooldown also depended on parsed `requestedAt`, so it had the same timestamp-sensitivity.
- Public `request-code` response only includes `debugCode` when `NODE_ENV !== 'production'`.
- Debug latest-code endpoint now requires:
  - non-production environment, or `TOOL_AUTH_DEBUG_ENABLED=true`;
  - `TOOL_AUTH_DEBUG_TOKEN`;
  - token length of at least 24 characters;
  - matching `x-tool-auth-debug-token` header.
- Debug latest-code endpoint does not return the raw code or code hash.
- Production email delivery path requires SMTP env configuration and returns safe generic diagnostics on send failure; no provider error text or credentials are exposed in the public response.

## Files changed

- `/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/auth/auth.service.ts`
- `/home/alexey/.local/share/brkovic-ltd/work/journal-backend/src/modules/auth/auth.controller.ts`
- `/home/alexey/GitHub/Revoyacht/brkovic-ltd/docs/brkovic_ltd_project_office/reports/backend-tool-auth-otp-gate-smoke-2026-05-30.md`

## Implementation notes

- Verification now selects the current active code in SQL:
  - `consumedAt IS NULL`
  - `expiresAt > now`
  - newest `requestedAt`
- Expired unconsumed rows are marked consumed only after no active code exists.
- Wrong code against a fresh active row increments attempts and returns invalid-code behavior, not `CODE_EXPIRED`.
- Request cooldown now selects recent requests in SQL instead of comparing a parsed `requestedAt` in JavaScript.
- Email delivery now attempts SMTP whenever configured and not explicitly skipped via `TOOL_AUTH_SKIP_EMAIL_DELIVERY=true`; production fails closed when SMTP is missing.

## Checks run

```bash
npm run build
```

Result: pass.

```bash
npm run lint
```

Result: blocked before linting source. ESLint 9 requires `eslint.config.(js|mjs|cjs)`, and this worktree does not have one.

## DB-backed smoke

Not run locally in this pass because a real/local `DATABASE_URL` was not provided, and the task explicitly forbids live DB mutation.

Command to run once a disposable/staging database is available:

```bash
npm run start:dev
```

Then smoke the local API with a disposable email address:

```bash
curl -i -X POST http://localhost:3000/auth/user/request-code -H 'Content-Type: application/json' -d '{"email":"qa-disposable@example.com"}'
curl -i -X POST http://localhost:3000/auth/user/verify-code -H 'Content-Type: application/json' -d '{"email":"qa-disposable@example.com","code":"<wrong-six-digit-code>"}'
```

Expected local/staging behavior:

- fresh wrong code: `401 Invalid verification code`;
- expired code only after TTL has actually elapsed: `401 CODE_EXPIRED`;
- repeated rapid request: `429 REQUEST_THROTTLED`;
- production/public `request-code`: no `debugCode`.

## Remaining release requirements

- Deploy backend changes to the target environment.
- Confirm SMTP env is configured or receive safe `EMAIL_NOT_CONFIGURED`/`EMAIL_SEND_FAILED` diagnostics.
- Run live/staging smoke against `/api/auth/user/request-code` and `/api/auth/user/verify-code` with a disposable address.
- Confirm a delivered email through provider logs or mailbox receipt, without exposing OTP values in reports.
