# BRKOVIC.LTD Project Office

**Owner:** Director of BRKOVIC.LTD MVP
**Created:** 2026-05-27
**Project root verified:** `/home/alexey/GitHub/Revoyacht/brkovic-ltd`
**Purpose:** organize the final local MVP audit, release preparation, deploy gates, SEO/language work, UX review, and post-deploy control without mixing responsibilities between chats.

## Required First Read

Every office chat must read these files before acting:

```text
docs/brkovic_ltd_project_office/cabinets/director/new-chat-prompt.md
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
docs/brkovic_ltd_project_office/office-discipline.md
docs/brkovic_ltd_project_office/chat-registry.md
docs/brkovic_ltd_project_office/task-registry.md
```

Repository files are the source of truth. Chat history is dispatch, not memory.

## Office Structure

| Cabinet | Chat ID | Role | Status |
| --- | --- | --- | --- |
| `cabinets/director/` | `CHAT-BRK-DIRECTOR-001` | Director / gatekeeper | Active |
| `cabinets/release-steward/` | `CHAT-BRK-RELEASE-001` | Release package and file manifest | Ready |
| `cabinets/qa-ux/` | `CHAT-BRK-QA-UX-001` | Local MVP QA and UX review | Ready |
| `cabinets/seo-i18n/` | `CHAT-BRK-SEO-I18N-001` | SEO, metadata, language completeness, AI multilingual journal workflow | Ready |
| `cabinets/seo-integration-director/` | `CHAT-BRK-SEO-DIR-001` | Director-level SEO integration and page-agent command | Ready |
| `cabinets/localization-architect/` | `CHAT-BRK-LOC-001` | Interface localization architecture, terminology, language surfaces | Ready |
| `cabinets/backend-admin/` | `CHAT-BRK-BACKEND-001` | Backend/admin/API integrity, server-side AI/admin boundaries | Ready |
| `cabinets/backend-engineer/` | `CHAT-BRK-BE-IMPL-001` | Backend implementation after approved tasks | Ready |
| `cabinets/frontend-engineer/` | `CHAT-BRK-FE-IMPL-001` | Frontend/NavDesk implementation after approved tasks | Ready |
| `cabinets/deploy/` | `CHAT-BRK-DEPLOY-001` | Controlled FTP deploy | Closed until gate |
| `cabinets/production-qa/` | `CHAT-BRK-PROD-QA-001` | Production smoke and indexing QA | Closed until deploy |

## Current Gate Logic

1. Release Steward, QA/UX, SEO/I18N, and Backend/Admin work in parallel on local MVP only.
2. Director reads their short reports and decides whether to fix, approve, or block.
3. Deploy Officer opens only after Director approves an exact release manifest.
4. Production QA opens only after deploy is complete.
5. No chat deploys or changes production by implication.

## Current Director Order

This phase is MVP stabilization, not redesign. Interface changes require Director/owner approval. UX may report and propose corrections, but must not independently rework the interface. Functional completion work before release starts only inside NavDesk tools/functions unless a new Director task says otherwise.

Background agents must run under Director watcher control: every active agent is recorded, checked on a timer during the chat turn, and closed only after its report is inspected.

```text
docs/brkovic_ltd_project_office/director-reports/2026-05-27-mvp-stabilization-order.md
```

## Reports

Full reports go to:

```text
docs/brkovic_ltd_project_office/reports/
```

Director decisions and summaries go to:

```text
docs/brkovic_ltd_project_office/director-reports/
```

Ready-to-paste prompts for the first worker chats:

```text
docs/brkovic_ltd_project_office/director-reports/2026-05-27-worker-launch-prompts.md
```
