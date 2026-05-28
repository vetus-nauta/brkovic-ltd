# Captain Ether Production QA Login Decision

**Task:** TASK-0065  
**Chat ID:** CHAT-PLATFORM-AUTH-001  
**Date:** 2026-05-26  
**Owner:** Platform Auth  
**Status:** approved-production-qa-login-method

## Decision

Approve the preferred production QA login path:

- use a dedicated production QA mailbox/test account for Captain Ether smoke testing;
- QA requests a normal production one-time login code for that account through the existing production login flow;
- the account identifier and each one-time code are delivered only through an approved private channel;
- no login code, session, cookie, CSRF value, SMTP detail, private config value, player email, player identity value, or other secret may be written into reports, repository files, screenshots, logs, or chat output.

## Authorized Use

This method may be used only by:

- the assigned Captain Ether QA role running production smoke/regression tasks;
- Game Director / Platform Auth for provisioning, handoff, rotation, and revocation of the QA account access path.

It is not a public login shortcut and is not approved for general gameplay, content production, developer convenience, or bypassing production auth.

## Reuse

This is a reusable QA access method until replaced by a later Platform Auth decision.

Each production login code remains one-time and short-lived. QA must request a fresh code when the current code expires or after it has been used.

## Private Access Channel

Game Director / Platform Auth must provide the dedicated QA account identifier and the current one-time code to the assigned QA operator through a private channel outside repository files, reports, screenshots, logs, and chat output.

The private channel may be reused for future production smoke tests, but only for authorized QA work and only without storing secret values in the repository.

## Explicitly Not Approved

The following remain not approved:

- exposing `dev_code` in production;
- writing login codes into repository files or reports;
- printing cookies, sessions, CSRF values, SMTP details, `.netrc`, private config, player email, player identity data, or other secrets;
- changing Captain Ether content, matcher, API, UI, or batches to bypass login;
- changing Watch Officer, Nav Desk, router, registry, or production config for this blocker;
- implementing a new auth facility without a separate reviewed Platform Auth implementation task.

## Scope Preserved

No Captain Ether content/API files, Watch Officer files, Nav Desk files, router files, registry files, or production config files are approved for modification by this decision.

## Next Step

After QA receives the dedicated production QA account access through the approved private channel, Captain Ether QA should rerun:

```text
game.brkovic.ltd/content/captain-ether/roles/qa/tasks/batch-003-production-smoke-2026-05-27.md
```

