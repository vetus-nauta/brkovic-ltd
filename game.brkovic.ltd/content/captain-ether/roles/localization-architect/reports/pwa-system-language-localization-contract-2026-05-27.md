# PWA System Language Localization Contract

Date: 2026-05-27
Role: Localization Architect
Mode: report-only

## Result

NEEDS DIRECTOR DECISION

Current implementation status: FAIL for the new PWA language policy.

Reason: the public PWA shell is currently mostly hardcoded in Russian. `public/index.html` declares `lang="ru"`, login copy is Russian, `public/assets/app.js` renders Russian UI strings directly, `content/game-registry.json` has mostly `*_ru` fields with limited English title fields, and `public/manifest.webmanifest` has a Russian description. There is no detected system-language contract in runtime yet, no English fallback path, and no visible reminder that interface language follows system settings.

Product requirement is clear enough to implement, but Director Ether must decide implementation ownership and whether the localization foundation belongs in the shared PWA shell, Captain Ether UI only, or the wider game platform registry contract.

## Required Language Map

Canonical UI language keys for product/UI:

| Product label | Canonical runtime key | BCP/browser aliases to accept | Notes |
| --- | --- | --- | --- |
| `eng` | `en` | `en`, `en-*` | English. Mandatory fallback for unsupported languages and first start when no supported system language is found. |
| `ru` | `ru` | `ru`, `ru-*` | Russian. Current UI source language for most shell copy, but should not remain implicit default. |
| `de` | `de` | `de`, `de-*` | German. |
| `it` | `it` | `it`, `it-*` | Italian. |
| `esp` | `es` | `es`, `es-*` | Spanish. Product label is `esp`; browser/runtime language key should be `es`. |
| `srb/mne/hr` | `sr-latn` or `sh-latn` by Director decision | `sr`, `sr-*`, `sr-Latn`, `sr-Latn-*`, `me`, `me-*`, `hr`, `hr-*`, optionally `bs`, `bs-*` if Director approves | Shared Serbian/Montenegrin/Croatian Latin UI. Needs Director decision on canonical key: recommended `sr-latn` for implementation, product label `srb/mne/hr` for content planning. Do not use Cyrillic as default for this shared UI. |
| `mandarin zh` | `zh` | `zh`, `zh-*`, `zh-Hans`, `zh-Hans-*`, `zh-CN`, `zh-SG`, optionally `zh-Hant`, `zh-TW`, `zh-HK`, `zh-MO` by Director decision | Mandarin Chinese. Needs Director decision on script. Recommended MVP: Simplified Chinese copy under `zh`, with Traditional Chinese aliases falling back to English unless a separate `zh-Hant` copy is approved. |

Detection contract:

1. Read browser/system preferences from `navigator.languages` in order, then `navigator.language` as fallback.
2. Normalize by lowercasing and replacing `_` with `-`.
3. Match exact aliases first, then primary language subtag.
4. If no supported alias matches, use `en`.
5. First start for unsupported system languages must always be English.
6. Do not infer player identity, region, account language, or training content language from locale detection.

## Fallback To English

Required behavior:

- Unsupported system language: UI starts in English.
- Missing translation key inside a supported locale: fall back to English for that string, not Russian.
- Missing registry localized field: fall back to English field, then a stable product name if English is unavailable.
- Manifest and install labels should have an English baseline. Browser-specific localized manifests can be a later enhancement; MVP must not expose Russian-only install copy when system language is unsupported.
- Error and loading states must also fall back to English, including API failure text rendered by frontend.

Player-facing reminder requirement:

- Add a small visible UI reminder in the shell/home/login flow: interface language follows system settings, unsupported system languages start in English.
- The reminder must be localized in every supported UI language.
- It should not look like a language selector unless Director approves manual override. Current product request says system language determines UI language.

## UI Zones That Must Be Covered

Minimum PWA localization coverage:

- HTML shell metadata: `html lang`, `<title>`, description meta, apple web app title if localized strategy is chosen.
- PWA manifest: `name`, `short_name`, `description`, and any future screenshots/shortcuts labels.
- Global header: brand supporting copy, login/logout/profile actions.
- Login flow: heading, helper copy, email form labels/placeholders, code form labels/placeholders, submit buttons, status messages, auth errors shown to player.
- Home/hub: hero labels, CTA buttons, platform stats, game-card labels/actions, management note, route-not-found state.
- Registry display fields: game title, description, hub note, status/stage labels, product brief metadata.
- Captain Ether level select: headings, level names, watch descriptions, start buttons.
- Watch screen: HUD labels, progress text, question instruction, answer field, hint/skip/back buttons, result labels, accepted/soft-correct/wrong feedback labels.
- Summary screen: completion headings, stat labels, action buttons, status text.
- Lost Oars flow: headings, empty/non-empty messages, item labels, hint/check buttons, answer input ARIA label.
- Admin answer-log UI if it remains inside the same PWA shell: headings, stats, filters/labels, table headers, review flags, empty states. This is admin-only but still UI.
- Disclaimer/training safety copy: must be localized as UI/safety text, while preserving legal/educational meaning.
- Loading and failure states: service worker registration errors are silent now, but visible API/loading text must be localized.
- Accessibility strings: `aria-label`, progress labels, input labels, and empty-state text.

Current high-risk hardcoded examples observed:

- `public/index.html`: Russian login template and Russian meta description.
- `public/assets/app.js`: direct Russian strings across profile, hub, Captain Ether watch, Lost Oars, answer-log admin, route-not-found, and disclaimer.
- `content/game-registry.json`: registry fields are `title_ru`, `description_ru`, `hub_note_ru`, `stage_ru` with only `title_en` for some entries.
- `public/manifest.webmanifest`: Russian description.

## Captain Ether Training Content Risk

Captain Ether content currently trains from Russian prompts into English Sea Speak answers. UI localization must not silently translate or rewrite training prompts without a separate curriculum and linguistic gate.

Risks:

- If UI language becomes German/Italian/Spanish/Serbian/Montenegrin/Croatian/Chinese while prompt text remains Russian, players may see a mixed-language learning flow. That can be acceptable only if clearly labeled as current training-source limitation.
- If prompts are machine-translated from Russian into other languages, accepted-answer meaning and maritime safety distinctions may drift. This belongs to Sea Speak Linguist and Curriculum Architect review, not UI localization.
- If source prompts change language but accepted answers remain English, hints and explanations must be revalidated against the accepted-answer dictionary and dangerous minimal pairs.
- Safety/disclaimer copy is UI/legal text and can be localized, but SMCP/Sea Speak target answers must remain controlled English training content.

Recommended MVP distinction:

- Localize interface chrome and controls into supported UI languages.
- Keep Captain Ether training prompts in the existing source language until a separate content-localization task approves translated prompt sets.
- Add localized note near watch start: current training prompts may be in Russian while answers are practiced in English Sea Speak. Director decision needed on exact copy and whether this note is shown only for non-RU UI.

## QA Smoke Matrix By Locale

Each smoke pass should run with forced browser/system locale or a deterministic dev override approved by Director-Engineer. No production config or auth changes are implied by this report.

| Locale case | Expected detection | Required smoke checks |
| --- | --- | --- |
| `en-US` | `en` / product `eng` | First load in English; home, login, Captain Ether level select, watch, summary, Lost Oars, route-not-found, manifest baseline not Russian-only. |
| `en-GB` | `en` / product `eng` | Same as `en-US`; date/time formatting must not break answer-log compact dates if admin UI is tested. |
| `ru-RU` | `ru` | Russian UI; no accidental English fallback except product names or untranslated missing keys flagged in console/test report. |
| `de-DE` | `de` | German UI; long labels fit mobile buttons/cards; Captain Ether training prompts are clearly handled per Director decision. |
| `it-IT` | `it` | Italian UI; watch HUD/progress and summary text fit mobile. |
| `es-ES` | `es` / product `esp` | Spanish UI; `esp` is not used as browser key; registry fallback works. |
| `es-MX` | `es` / product `esp` | Spanish alias by primary subtag; first load is Spanish, not English. |
| `sr-Latn-RS` | shared `srb/mne/hr` | Latin shared UI; no Cyrillic default unless explicitly approved. |
| `sr-RS` | shared `srb/mne/hr` | Director decision needed: treat as Latin shared UI or require script-specific alias. Recommended MVP: Latin shared UI. |
| `hr-HR` | shared `srb/mne/hr` | Shared Latin UI; registry/game status labels fit. |
| `me-ME` | shared `srb/mne/hr` | Shared Latin UI if browser exposes `me`; if browsers do not emit `me`, test via override/dev harness. |
| `zh-CN` | `zh` | Mandarin/Simplified UI if approved; no Russian fallback. |
| `zh-SG` | `zh` | Mandarin/Simplified UI if approved. |
| `zh-TW` | Director decision | Either Traditional-specific fallback to English or shared `zh`; must be deterministic and documented. |
| `fr-FR` | `en` | Unsupported language starts in English and shows localized English reminder about system-language behavior. |
| Empty/blocked language API | `en` | English fallback; no blank UI, no Russian default. |

Minimum flow per locale:

1. Load `/` in fresh browser profile.
2. Verify `document.documentElement.lang` equals canonical UI key or approved BCP value.
3. Verify language reminder is visible on first shell/home/login surface.
4. Verify no Russian hardcoded UI remains outside training prompts when locale is not `ru`.
5. Open `/games/captain-ether`.
6. Verify login-required state, level select, watch question screen, answer result, summary, Lost Oars, and back navigation.
7. Verify mobile width has no clipped long translations.
8. Verify unsupported locale first start is English.

## Director Decisions Needed

1. Canonical runtime key for shared Serbian/Montenegrin/Croatian: recommended `sr-latn`, product label `srb/mne/hr`.
2. Mandarin script policy: recommended MVP `zh` as Simplified Chinese; `zh-Hant` aliases either fall back to English or wait for separate Traditional Chinese copy.
3. Scope of localization implementation: Captain Ether-only UI versus shared game PWA shell and registry.
4. Registry schema: add localized fields per supported language, or introduce a translation dictionary keyed by registry field IDs.
5. Whether to support manual language override later. Current product requirement says system language determines UI language, so MVP should avoid selector behavior.
6. Exact reminder placement and copy owner: UX/HUD Designer should approve placement; Localization Architect can provide key coverage.
7. Training content policy: keep RU source prompts for now or open a separate Curriculum Architect / Sea Speak Linguist localization workstream for non-RU source prompts.

## Handoff For Director Ether

Implementing the new PWA language policy is not a copy-only change. The platform needs a deterministic locale layer before translating strings.

Recommended next task route:

Director-Engineer should define the runtime localization foundation in the shared PWA shell, with English as the root fallback and a strict alias map:

`en`, `ru`, `de`, `it`, `es`, `sr-latn`, `zh`.

After the foundation exists, assign UX/HUD Designer to place the system-language reminder, then Localization Architect can review key coverage, and QA can run the smoke matrix above. Sea Speak Linguist / Curriculum Architect should be involved only if training prompts, hints, or accepted-answer meaning are translated beyond interface chrome.

Changed files in this role task:

- `content/captain-ether/roles/localization-architect/reports/pwa-system-language-localization-contract-2026-05-27.md`
