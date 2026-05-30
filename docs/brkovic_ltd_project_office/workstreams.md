# BRKOVIC.LTD MVP Workstreams

**Owner:** Director of BRKOVIC.LTD MVP
**Created:** 2026-05-27

| Stream | Owner Chat | Current Focus | Status |
| --- | --- | --- | --- |
| DIR | `CHAT-BRK-DIRECTOR-001` | Tool authentication sprint launched: public tool gating + Google/OTP (no redesign, keep read-only content open) | Active |
| REL | `CHAT-BRK-RELEASE-001` | Safe release package and deploy manifest | Report received |
| QAUX | `CHAT-BRK-QA-UX-001` | Tool auth gate smoke launch (desktop/tablet/mobile) after FE/BE reports | In Progress |
| SEO | `CHAT-BRK-SEO-I18N-001` | SEO, languages, metadata, indexing readiness | Report received |
| SEODIR | `CHAT-BRK-SEO-DIR-001` | Director-level SEO integration, page-agent command and public search readiness | Ready |
| LANGAI | `CHAT-BRK-SEO-I18N-001` + `CHAT-BRK-BACKEND-001` | AI-assisted multilingual journal duplicates, SEO, review workflow | Backend/admin sprint launched |
| LOC | `CHAT-BRK-LOC-001` | Language Sprint 03 delivered first-pass dictionaries and waiting for localization/SEO review for DE/IT/ES/SR/ZH | For Review |
| BE | `CHAT-BRK-BACKEND-001` | Journal translation control sprint: activation + stability of `/translations*` routes for posts/collections | For Review |
| BEIMPL | `CHAT-BRK-BE-IMPL-001` | Live translation provider unblock + public user tool auth backend skeleton/API | In Progress |
| BEIMPL | `CHAT-BRK-BE-IMPL-001` | BE-007 canonical auth-route deployment (`/api/auth/user/*` + `/api/auth/*` aliases) | Ready |
| BEIMPL | `CHAT-BRK-BE-IMPL-001` | Tool auth delivery blocker (`BRK-MVP-BE-010`): email route TTL/cooldown + delivery proof | In Progress |
| FEIMPL | `CHAT-BRK-FE-IMPL-001` | Tool access gating flow for public tools (Google + 6-digit email code) and safe read-only fallback | In Progress |
| DEPLOY | `CHAT-BRK-DEPLOY-001` | Production upload | Closed until Director gate |
| PRODQA | `CHAT-BRK-PROD-QA-001` | Post-deploy smoke and indexing | Closed until deploy |

## Dependency Order

```text
REL + QAUX + SEO + SEODIR + BE
        + LANGAI backend/admin sprint + LOC inventory when assigned
        ↓
Director gate
        ↓
FEIMPL / BEIMPL implementation tasks when assigned
        ↓
DEPLOY
        ↓
PRODQA
        ↓
Director final MVP report
```

## Current Protected Areas

- FTP and production files are closed until a deploy task is assigned.
- Secrets and private configs are closed to every worker.
- `game.brkovic.ltd/` is not part of the main brkovic.ltd release unless a separate Director decision says so.
- Journal backend source/work copy is outside this frontend release flow unless Backend/Admin explicitly reports a blocker.
