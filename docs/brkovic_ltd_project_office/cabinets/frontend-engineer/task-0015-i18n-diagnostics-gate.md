# Task 0015 - I18N Diagnostics Gate

**Task ID:** `BRK-MVP-FE-015`  
**Owner Chat:** `CHAT-BRK-FE-IMPL-001`  
**Status:** For Review  
**Created:** 2026-05-28

## Assignment

Maintain a diagnostics gate for the multilingual frontend rollout.

This is not redesign, not translation generation and not SEO URL work.

## Implemented Scope

Updated:

```text
tools/i18n-diagnostics.mjs
```

Generated:

```text
docs/brkovic_ltd_project_office/reports/i18n-diagnostics-2026-05-28.md
```

## What The Tool Checks

- public static pages;
- service pages;
- all NavDesk pages;
- JavaScript files with generated UI keys;
- active dictionaries in `lang/*.json`;
- `data-i18n`;
- `data-i18n-placeholder`;
- `data-i18n-title`;
- `data-i18n-description`;
- `data-i18n-aria-label`;
- `data-i18n-alt` if added later;
- direct global translation calls such as `window.t("...")`;
- known wrapper calls in files that use `window.__BRKOVIC_TRANSLATIONS`, `window.BRKOVIC_LANGUAGE` or `currentTranslations`;
- JS string literals that match known dictionary keys, for dynamic cases such as `t(type.label)`;
- dictionary drift between active language files;
- missing active-language keys;
- basic page shell guards.

## Gate Command

```bash
node tools/i18n-diagnostics.mjs
```

Optional markdown report:

```bash
node tools/i18n-diagnostics.mjs --markdown --out docs/brkovic_ltd_project_office/reports/i18n-diagnostics-YYYY-MM-DD.md
```

## Director Rule

Every future frontend i18n task must keep this tool green before it can be accepted.
