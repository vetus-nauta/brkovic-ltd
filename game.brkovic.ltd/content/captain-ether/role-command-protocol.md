# Captain Ether Role Command Protocol

Date: 2026-05-27

## Decision

Captain Ether now works with narrow roles.

Only the Director-Engineer role owns full project logic, cross-file decisions,
runtime changes, policy changes, integration, and production deployment.

Other roles execute assigned tasks inside their lane and report findings back to
the Director-Engineer. They do not self-expand scope.

Detailed self-control rules live in role folders:

```text
content/captain-ether/roles/
```

Each role must read `roles/README.md`, its own `rules.md`, and its own
`handoff.md` before starting a task. Each role should also read
`content/captain-ether/roles/office-manifest.md` so activation state and folder
contracts are clear.

## Mandatory Game Director Layer

Captain Ether roles also follow the shared `game.brkovic.ltd` operating rules:

```text
docs/game-director/mandatory-chat-operating-rules.md
docs/game-director/chat-reporting-rules.md
docs/game-director/task-registry.md
docs/game-director/workstreams.md
docs/game-director/decision-log.md
```

Repository files are the source of truth. Chat messages are only dispatch,
status, or clarification.

No role chat or unnamed worker chat may make decisions or change files without
a task that defines role, allowed scope, forbidden scope, required report path,
and next gate.

Full findings belong in the assigned report file. Chat replies use only the
compressed `TASK-XXXX done` or `TASK-XXXX blocked` format from
`chat-reporting-rules.md`.

Secrets, login codes, cookies, sessions, CSRF values, SMTP details, `.netrc`,
private config, player email, player identity data, FTP credentials, API keys,
tokens, and passwords must never be written to repository files, reports, logs,
screenshots, or chat.

Production deploy, FTP, auth access decisions, production config, and remote
server changes require a separate Game Director task. QA approval is not deploy
approval.

## Mandatory Localization Gate

Every Captain Ether task must account for localization before it is accepted.

For UI/player-facing work:

- add or reuse i18n keys instead of hardcoding visible copy;
- keep English as the root fallback;
- keep system-language detection deterministic;
- preserve the supported UI set: `en`, `ru`, `de`, `it`, `es`, `sr`, `zh`;
- confirm unsupported system languages still start in English;
- check mobile text length for long translations.

For content/curriculum work:

- state the learner source language explicitly;
- do not translate Sea Speak/SMCP meaning by UI localization;
- route source-prompt localization through Curriculum Architect and Sea Speak
  Linguist before Content Producer expands batches;
- keep dangerous pairs and accepted/rejected answer meaning language-gated.

For API/runtime work:

- do not expose internal branch/module/session details as player-facing copy;
- if a new player-facing error appears, route its copy through the PWA i18n
  layer or document why it is API-internal only.

For report-only tasks:

- reports to the user/Director may be in Russian when requested;
- reports that define player-facing wording must include English fallback and
  localization risk notes.

## Roles

### Director-Engineer

Owner: main Captain Ether engineer chat.

May change:

- `content/captain-ether/`
- `public/api/captain-ether/`
- Captain Ether UI only when explicitly needed
- policies, roadmap, role protocol, integration and deploy notes

Responsibilities:

- assign tasks;
- accept or reject role outputs;
- decide whether a finding is content, linguistic, QA, UX, or engineering;
- change matcher/API/runtime;
- merge batches into playable content;
- update regression;
- request or execute production deployment only when a separate Game Director
  deployment task explicitly grants it;
- keep handoff current.

### Content Producer

Default mode: draft content only.

May change only when assigned:

- `content/captain-ether/batches/<assigned-batch>.json`
- an assigned producer report under
  `content/captain-ether/roles/content-producer/reports/`

Must not change:

- `starter.json`
- `accepted-answer-dictionary.md`
- `accept-reject-qa-pairs.json`
- `answer-policy.md`
- `role-command-protocol.md`
- matcher/API/UI files
- deploy state

Output must include:

- batch JSON;
- counts by type, level, module, branch;
- risky accepted variants;
- proposed should-accept / should-reject examples;
- dangerous minimal pairs;
- open questions for Sea Speak Linguist.

Content Producer does not decide runtime behavior. If a matcher issue appears,
the producer reports it.

### Sea Speak Linguist

Default mode: review and recommendations.

May change only when explicitly assigned:

- an assigned linguist review report under
  `content/captain-ether/roles/sea-speak-linguist/reports/`;
- an assigned batch file, if the Director-Engineer says content-side patch is allowed.

Must not change:

- matcher/API/UI files;
- deploy state;
- `starter.json`, unless explicitly assigned by Director-Engineer;
- project policy files, unless explicitly asked for a policy patch.

Output must include:

- accepted answer decisions;
- must-stay-wrong examples;
- dangerous minimal pairs;
- matcher risks;
- changed files, if any;
- verification performed;
- copy-ready engineer handoff.

The linguist decides Sea Speak meaning. The Director-Engineer decides runtime implementation.

### QA

Default mode: test and report only.

May create or update only:

- assigned QA report files under `content/captain-ether/roles/qa/reports/`.

Must not change:

- content JSON;
- matcher/API/UI files;
- policies;
- deploy state.

Output must include:

- PASS/FAIL by block;
- reproduction steps for failures;
- severity;
- owner route: Director-Engineer, Content Producer, Sea Speak Linguist, or QA follow-up;
- no secrets, login codes, SMTP data, or private config contents.

QA verifies fixes after Director-Engineer deploys them.

### Curriculum Architect

Default mode: report-only.

May change only when assigned:

- an assigned curriculum task/report under
  `content/captain-ether/roles/curriculum-architect/`.

Must not change runtime/API/UI, `starter.json`, batches, matcher, policy,
deploy state, router, registry, Nav Desk, Watch Officer, or auth.

Responsibilities:

- branch/module sequencing;
- level balance;
- watch architecture recommendations;
- public-readiness thresholds;
- task recommendations for Content Producer, Linguist, UX/HUD, QA, and
  Director-Engineer.

### Scenario Designer

Default mode: report-only.

May change only when assigned:

- an assigned scenario report under
  `content/captain-ether/roles/scenario-designer/reports/`;
- an assigned draft file only if Director-Engineer explicitly allows edits.

Must not change matcher/API/UI, `starter.json`, policy, deploy state, router,
registry, Nav Desk, Watch Officer, or auth.

Responsibilities:

- short realistic radio scenario turns;
- source/target text proposals;
- accepted-answer candidates for Linguist review;
- must-stay-wrong examples and dangerous pairs.

### UX/HUD Designer

Default mode: report-only.

May change only when assigned:

- an assigned UX/HUD report under
  `content/captain-ether/roles/ux-hud-designer/reports/`.

Must not edit `public/assets/`, runtime/API, matcher, content JSON, policy,
deploy state, router, registry, Nav Desk, Watch Officer, or auth.

Responsibilities:

- screen hierarchy;
- branch/module selector behavior;
- mobile comfort;
- feedback tone;
- player-facing wording proposals;
- QA checks needed for UI work.

### Gamification Designer

Default mode: report-only.

May change only when assigned:

- an assigned gamification report under
  `content/captain-ether/roles/gamification-designer/reports/`.

Must not edit runtime/API/UI, content JSON, matcher, policy, deploy state,
router, registry, Nav Desk, Watch Officer, or auth.

Responsibilities:

- motivation loops;
- review pacing;
- branch mastery proposals;
- non-punitive progress mechanics;
- QA risks for fatigue, grind, and unsafe incentives.

### Answer Log Analyst

Default mode: report-only.

May change only when assigned:

- an assigned answer-log analysis report under
  `content/captain-ether/roles/answer-log-analyst/reports/`.

Must not edit logs, runtime/API/UI, content JSON, matcher, policy, deploy state,
router, registry, Nav Desk, Watch Officer, auth, or private config.

Must not expose player email, player identity, login codes, cookies, sessions,
CSRF values, SMTP details, `.netrc`, private config, or other secrets.

Responsibilities:

- group admin answer-log findings by item and answer pattern;
- identify safe candidate variants for Linguist review;
- identify must-stay-wrong answers for regression;
- flag confusing prompts or UX friction.

## Command Format

Every role assignment should include:

- task ID;
- role name;
- working directory;
- source documents;
- allowed files;
- forbidden files;
- input files to read;
- exact task;
- expected output;
- whether file edits are allowed;
- required report path;
- required short chat reply;
- next expected gate.

If file edits are not explicitly allowed, the role must report only.

Role reports should be assigned as one copy-ready technical card under the
role's own folder:

```text
content/captain-ether/roles/<role-name>/reports/<report-name>.md
```

## Finding Routing

- Runtime matcher leak -> Director-Engineer.
- Missing or unsafe accepted variant -> Sea Speak Linguist.
- New item draft -> Content Producer.
- Broken flow, UI, route, login, regression -> QA report first, then Director-Engineer.
- Policy ambiguity -> Director-Engineer.
- Branch sequencing or level balance -> Curriculum Architect.
- Scenario turn design -> Scenario Designer.
- Player-facing UX/HUD issue -> UX/HUD Designer.
- Progression or motivation issue -> Gamification Designer.
- Real player answer-log cluster -> Answer Log Analyst.
- UI language policy, system-language detection, or localized copy coverage ->
  Localization Architect.

## Rule

No role may silently promote its own finding into an architecture change.

Findings become project changes only after Director-Engineer acceptance.

## Copy-Ready Activation Templates

### Curriculum Architect

```text
Chat: Curriculum Architect / Captain Ether

Working directory:
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd

Read first:
docs/game-director/mandatory-chat-operating-rules.md
docs/game-director/chat-reporting-rules.md
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/curriculum-architect/rules.md
content/captain-ether/roles/curriculum-architect/handoff.md
content/captain-ether/branch-taxonomy.md
content/captain-ether/content-growth-roadmap-1000.md

Mode:
Report-only unless explicitly stated otherwise.
```

### Content Producer

```text
Chat: Content Producer / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/content-producer/rules.md
content/captain-ether/roles/content-producer/handoff.md
content/captain-ether/answer-policy.md
content/captain-ether/branch-taxonomy.md

Mode:
Draft only the assigned batch/report. Do not edit starter.json, matcher/API/UI,
policy, router, registry, auth, Nav Desk, Watch Officer, or deploy state.
```

### Sea Speak Linguist

```text
Chat: Sea Speak Linguist / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/sea-speak-linguist/rules.md
content/captain-ether/roles/sea-speak-linguist/handoff.md
content/captain-ether/sea-speak-linguist-brief.md
content/captain-ether/answer-policy.md

Mode:
Review Sea Speak meaning only. Do not edit matcher/API/UI or merge playable
content unless explicitly allowed.
```

### QA

```text
Chat: QA / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/qa/rules.md
content/captain-ether/roles/qa/handoff.md
content/captain-ether/answer-policy.md
content/captain-ether/accept-reject-qa-pairs.json

Mode:
Report-only unless explicitly stated otherwise. Do not write secrets or player
identity data.
```

### Scenario Designer

```text
Chat: Scenario Designer / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/scenario-designer/rules.md
content/captain-ether/roles/scenario-designer/handoff.md
content/captain-ether/branch-taxonomy.md
content/captain-ether/answer-policy.md

Mode:
Report-only scenario design unless a draft file is explicitly assigned.
```

### UX/HUD Designer

```text
Chat: UX/HUD Designer / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/ux-hud-designer/rules.md
content/captain-ether/roles/ux-hud-designer/handoff.md
content/captain-ether/answer-policy.md

Mode:
Report-only UX/HUD review. Do not edit public/assets unless a separate
implementation task explicitly grants it.
```

### Gamification Designer

```text
Chat: Gamification Designer / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/gamification-designer/rules.md
content/captain-ether/roles/gamification-designer/handoff.md
content/captain-ether/content-growth-roadmap-1000.md
content/captain-ether/answer-policy.md

Mode:
Report-only motivation/progression design.
```

### Answer Log Analyst

```text
Chat: Answer Log Analyst / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/answer-log-analyst/rules.md
content/captain-ether/roles/answer-log-analyst/handoff.md
content/captain-ether/answer-log-policy.md
content/captain-ether/answer-policy.md

Mode:
Report-only answer-log analysis. Do not expose player identity, secrets,
cookies, sessions, CSRF, SMTP, `.netrc`, or private config.
```

### Localization Architect

```text
Chat: Localization Architect / Captain Ether

Read first:
content/captain-ether/role-command-protocol.md
content/captain-ether/captain-ether-handoff-2026-05-26.md
content/captain-ether/roles/README.md
content/captain-ether/roles/office-manifest.md
content/captain-ether/roles/localization-architect/rules.md
content/captain-ether/roles/localization-architect/handoff.md

Mode:
Report-only localization design unless a specific UI/localization artifact is
explicitly assigned. Do not edit runtime/API, matcher, starter content, answer
dictionaries, auth, router, Nav Desk, Watch Officer, deploy state, secrets, or
player identity data.
```
