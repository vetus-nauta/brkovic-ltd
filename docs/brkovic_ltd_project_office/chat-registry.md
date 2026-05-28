# BRKOVIC.LTD Chat Registry

**Owner:** Director of BRKOVIC.LTD MVP
**Created:** 2026-05-27

| Chat ID | Name | Function | Status | Cabinet | Primary Output |
| --- | --- | --- | --- | --- | --- |
| `CHAT-BRK-DIRECTOR-001` | Director of BRKOVIC.LTD MVP | Product decisions, office discipline, gates, task assignment | Active | `cabinets/director/` | Director reports and decisions |
| `CHAT-BRK-RELEASE-001` | Release Steward | Build the safe file manifest for upload, identify exclusions and secrets | Ready | `cabinets/release-steward/` | Release manifest |
| `CHAT-BRK-QA-UX-001` | QA/UX Inspector | Local desktop/tablet/mobile smoke, UX consistency, visual blockers | Ready | `cabinets/qa-ux/` | Local QA/UX report |
| `CHAT-BRK-SEO-I18N-001` | SEO & Languages Lead | SEO metadata, schema, sitemap/robots, language completeness, translation gaps, AI multilingual journal workflow | Ready | `cabinets/seo-i18n/` | SEO/I18N audit |
| `CHAT-BRK-SEO-DIR-001` | SEO Integration Director | Director-level search strategy, page-agent command, index policy, schema/social/search-readiness integration | Ready | `cabinets/seo-integration-director/` | SEO integration director intake |
| `CHAT-BRK-LOC-001` | Localization Architect | Interface localization architecture, terminology, hidden/generated language surfaces, multilingual UX rules | Ready | `cabinets/localization-architect/` | Localization surface inventory |
| `CHAT-BRK-BACKEND-001` | Backend/Admin Integrity | Forms, admin pages, journal API boundary, AI/admin server boundary, management admin, tides/delivery APIs | Ready | `cabinets/backend-admin/` | Backend/admin/API audit |
| `CHAT-BRK-BE-IMPL-001` | Backend Engineer | Implements approved backend changes in journal backend and server-side admin APIs | Ready | `cabinets/backend-engineer/` | Backend implementation notes and patches |
| `CHAT-BRK-FE-IMPL-001` | Frontend/NavDesk Engineer | Implements approved frontend, responsive and NavDesk client-side changes | Ready | `cabinets/frontend-engineer/` | Frontend implementation reports and patches |
| `CHAT-BRK-DEPLOY-001` | Deployment Officer | Controlled FTP upload after gate approval only | Gate closed | `cabinets/deploy/` | Deploy report |
| `CHAT-BRK-PROD-QA-001` | Production Smoke & Indexing QA | Public URL smoke, API smoke, post-deploy SEO/indexing checks | Gate closed | `cabinets/production-qa/` | Production QA report |

## Staffing Principle

Do not add a new chat when an existing role can own the work cleanly.

Temporary helper chats are allowed only by Director assignment and must have:

- task ID;
- exact scope;
- report path;
- forbidden areas;
- next gate.
