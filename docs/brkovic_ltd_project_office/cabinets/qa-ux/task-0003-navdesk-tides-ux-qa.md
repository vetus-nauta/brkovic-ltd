# Task 0003 - NavDesk Tides UX/QA

**Task ID:** `BRK-MVP-QAUX-003`
**Owner chat:** `CHAT-BRK-QA-UX-001`
**Assigned:** 2026-05-27
**Status:** In Progress
**Required output:** `docs/brkovic_ltd_project_office/reports/navdesk-tides-ux-qa-2026-05-27.md`

## Context

`navdesk-tides.html` is now a separate NavDesk tool page. The goal is MVP stabilization, not a redesign sprint.

## Scope

Audit the tides page across:

- desktop;
- tablet;
- mobile.

This is a no-code task. UX/QA may define requirements and acceptance checks, but implementation remains with the code owner after Director approval.

## Rules

- Do not edit files.
- Do not deploy.
- Do not touch FTP or secrets.
- Preserve the shared NavDesk disclaimer as the single entry warning.
- Preserve day/night mode.
- Do not propose radical redesign for MVP.

## Checkpoints

- Input flow: place, date, units, depth, draft, UKC, data mode.
- Search UX: minimum query length, loading, no results, ambiguous results, selection clarity.
- Result flow: window summary, next tide events, table.
- Source clarity: coordinates/station/source/WorldTides attribution without adding a separate warning modal/card.
- Layout compactness and readability on desktop/tablet/mobile.
- No horizontal overflow.
- Text fits controls.
- Day/night modes feel like one tool, not separate pages.

## Required Report Sections

- Findings
- MVP Requirements
- Desktop
- Tablet
- Mobile
- Search UX Contract
- Not For MVP
- Acceptance Checklist
