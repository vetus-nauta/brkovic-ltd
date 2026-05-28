# Director Order: MVP Stabilization, No Interface Redesign

**Date:** 2026-05-27
**Owner:** `CHAT-BRK-DIRECTOR-001`
**Applies to:** all BRKOVIC.LTD MVP office chats

## Order

We are moving BRKOVIC.LTD toward MVP release. This is not a redesign sprint.

The current site direction, page composition, and interface decisions are preserved unless the owner/director explicitly approves a correction. Worker chats must not independently restyle, recompose, or rebuild screens.

## What Roles Must Do

- Release Steward: build a safe upload manifest and exclusions. Do not edit product code.
- QA/UX Inspector: find blockers, breakage, responsiveness issues, console errors, usability risks, and report them. Suggest interface corrections only as proposals requiring approval.
- SEO & Languages Lead: audit metadata, language readiness, indexing, and AI multilingual journal architecture. Do not rewrite final Russian voice.
- Backend/Admin Integrity: audit admin/API/server boundaries and report risks. Do not change live backend, FTP, database, or secrets.
- Deploy Officer: remains closed until Director gate approval.
- Production QA: remains closed until deploy is complete.

## NavDesk Exception

Functional completion work before release starts only inside NavDesk tools/functions, because that is the known unfinished functional area. Even there, UI changes should be limited to what is necessary to make a function understandable and working.

## UX Rule

UX can say:

- "this blocks MVP";
- "this is a risk";
- "this should be corrected after approval";
- "this can wait after release".

UX cannot silently turn the project into a redesign task.
