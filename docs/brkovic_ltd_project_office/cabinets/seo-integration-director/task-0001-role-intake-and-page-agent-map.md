# Task 0001 - SEO Director Intake And Page Agent Map

**Chat ID:** `CHAT-BRK-SEO-DIR-001`
**Department:** SEO Integration Director
**Assigned by:** `CHAT-BRK-DIRECTOR-001`
**Date:** 2026-05-28
**Task ID:** `BRK-MVP-SEODIR-001`
**Status:** Ready

## Working Directory

```bash
cd /home/alexey/GitHub/Revoyacht/brkovic-ltd
git status --short --branch
```

## Task

Take over the professional SEO integration direction for the whole BRKOVIC.LTD site.

This is not a copywriting free-for-all. The owner controls the Russian voice. The SEO Director must convert existing strategy into page-level instructions, implementation gates and QA acceptance.

## Immediate Deliverables

Create, in a new SEO Director chat:

```text
docs/brkovic_ltd_project_office/reports/seo-integration-director-intake-2026-05-28.md
```

The report must include:

- current SEO vector from existing office reports;
- public page inventory;
- page-agent priority order;
- index/noindex/sitemap decision queue;
- required owner copy decisions;
- implementation slices that are safe before upload;
- implementation slices that must wait for language URL/backend strategy;
- acceptance checklist for production search readiness.

## Page Agent Map

Use the page-agent briefs in:

```text
docs/brkovic_ltd_project_office/cabinets/seo-integration-director/page-agents/
```

Start with:

1. Home page.
2. Service pages.
3. Journal.
4. NavDesk hub and tools.
5. Maritime English only after the learning section becomes real content.

## Boundaries

- Do not deploy.
- Do not touch production, FTP, backend, DB, secrets.
- Do not rewrite final Russian voice without owner approval.
- Do not add hreflang until crawlable language URLs exist.
- Do not add page-specific implementation patches until the owner/director approves the slice.
