# BRKOVIC.LTD MVP Workstreams

**Owner:** Director of BRKOVIC.LTD MVP
**Created:** 2026-05-27

| Stream | Owner Chat | Current Focus | Status |
| --- | --- | --- | --- |
| DIR | `CHAT-BRK-DIRECTOR-001` | Office control, gate decisions, final MVP direction | Active |
| REL | `CHAT-BRK-RELEASE-001` | Safe release package and deploy manifest | Report received |
| QAUX | `CHAT-BRK-QA-UX-001` | NavDesk functional and print/PDF audit | Assigned |
| SEO | `CHAT-BRK-SEO-I18N-001` | SEO, languages, metadata, indexing readiness | Report received |
| SEODIR | `CHAT-BRK-SEO-DIR-001` | Director-level SEO integration, page-agent command and public search readiness | Ready |
| LANGAI | `CHAT-BRK-SEO-I18N-001` + `CHAT-BRK-BACKEND-001` | AI-assisted multilingual journal duplicates, SEO, review workflow | Marker preserved |
| LOC | `CHAT-BRK-LOC-001` | Ship Journal translation work order: report received, awaiting Director/owner language-list decision | Report received |
| BE | `CHAT-BRK-BACKEND-001` | Backend/admin/API boundaries, live dependency risks, NavDesk tides audit | Report received |
| BEIMPL | `CHAT-BRK-BE-IMPL-001` | Approved backend implementation in journal backend and admin APIs | Skeleton report ready |
| FEIMPL | `CHAT-BRK-FE-IMPL-001` | NavDesk frontend polish: main cards and route print accepted for MVP | Approved |
| DEPLOY | `CHAT-BRK-DEPLOY-001` | Production upload | Closed until Director gate |
| PRODQA | `CHAT-BRK-PROD-QA-001` | Post-deploy smoke and indexing | Closed until deploy |

## Dependency Order

```text
REL + QAUX + SEO + SEODIR + BE
        + LANGAI marker + LOC inventory when assigned
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
