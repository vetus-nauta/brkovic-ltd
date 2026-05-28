# Director Report: BRKOVIC.LTD MVP Office Setup

**Task:** `BRK-MVP-DIR-001`
**Date:** 2026-05-27
**Status:** Approved
**Director:** `CHAT-BRK-DIRECTOR-001`

## Decision

Created a compact project office for the main `brkovic-ltd` site MVP.

The office uses the discipline pattern already proven in `game.brkovic.ltd/docs/game-director/`, but lives separately under:

```text
docs/brkovic_ltd_project_office/
```

## Verified Paths

Project root:

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

Mandatory operating rules:

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
```

## Staffing

The office starts with seven release roles and adds one dedicated localization role:

1. Director
2. Release Steward
3. QA/UX Inspector
4. SEO & Languages Lead
5. Backend/Admin Integrity
6. Deployment Officer
7. Production Smoke & Indexing QA
8. Localization Architect

Deploy and Production QA remain closed until Director gate approval.
Localization Architect is ready but report-only until assigned. Its purpose is to inventory interface language surfaces, hidden/generated strings, print/share/notification language, terminology, and multilingual UX rules before any localization fixes.

## Current Director Position

The local site candidate is a living MVP, but it must not be uploaded as a whole directory.

Release must be manifest-driven because the working tree contains:

- uncommitted site work;
- untracked new NavDesk pages;
- ignored private configs;
- separate `game.brkovic.ltd/` content;
- local test artifacts.

## Next Expected

Open worker chats for:

- `BRK-MVP-REL-001`
- `BRK-MVP-QAUX-001`
- `BRK-MVP-SEO-001`
- `BRK-MVP-BE-001`
- `BRK-MVP-LOC-001` when Director starts localization inventory

After reports return, Director decides whether to approve deploy, assign fixes, or block.
