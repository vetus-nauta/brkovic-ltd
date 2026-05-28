# Chat Assignment

**Chat ID:** `CHAT-BRK-DEPLOY-001`
**Department:** Deployment Officer
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-27
**Task ID:** `BRK-MVP-DEPLOY-001`
**Status:** Gate Closed

## Gate Status

Do not execute this task until Director explicitly changes it to Assigned.

## Working Directory

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

## Required Source Documents When Gate Opens

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/README.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/reports/release-manifest-2026-05-27.md
docs/brkovic_ltd_project_office/reports/local-qa-ux-smoke-2026-05-27.md
docs/brkovic_ltd_project_office/reports/seo-i18n-audit-2026-05-27.md
docs/brkovic_ltd_project_office/reports/backend-admin-api-audit-2026-05-27.md
```

## Future Task

When assigned, perform controlled production upload using the Director-approved release manifest only.

## Required Output

```text
docs/brkovic_ltd_project_office/reports/deploy-report-2026-05-27.md
```

## Hard Boundaries

- Never write credentials, FTP paths with secrets, cookies, sessions, tokens, or private config values into reports.
- Backup overwritten remote files before replacing them.
- Do not upload files outside the approved manifest.
- Do not overwrite server-only private configs.
