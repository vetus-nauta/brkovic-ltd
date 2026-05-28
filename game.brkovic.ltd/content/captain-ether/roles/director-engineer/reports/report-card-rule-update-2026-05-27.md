# Technical Card: Role Report Card Rule Update

Status: PASS  
Date: 2026-05-27  
Role: Director-Engineer / Captain Ether  
Mode: rule/protocol update card for Director-Engineer chat

## 1. Decision

Captain Ether role reports must now be prepared as one copy-ready technical
card for the Director-Engineer chat.

Role report files must be stored in the reporting role's own folder:

```text
content/captain-ether/roles/<role-name>/reports/<report-name>.md
```

This makes each role output easy for the chief/Director-Engineer chat to read
without searching the root Captain Ether folder or stitching together multiple
partial notes.

## 2. Rule Changes Applied

Updated shared protocol:

- `content/captain-ether/roles/README.md`
- `content/captain-ether/role-command-protocol.md`

Updated role rules to point assigned reports into role-owned `reports/`
folders and require one copy-ready technical card:

- `content/captain-ether/roles/content-producer/rules.md`
- `content/captain-ether/roles/curriculum-architect/rules.md`
- `content/captain-ether/roles/qa/rules.md`
- `content/captain-ether/roles/sea-speak-linguist/rules.md`
- `content/captain-ether/roles/scenario-designer/rules.md`
- `content/captain-ether/roles/ux-hud-designer/rules.md`
- `content/captain-ether/roles/gamification-designer/rules.md`
- `content/captain-ether/roles/answer-log-analyst/rules.md`

Updated existing handoff report-shape lines to match the same convention:

- `content/captain-ether/roles/director-engineer/handoff.md`
- `content/captain-ether/roles/content-producer/handoff.md`
- `content/captain-ether/roles/sea-speak-linguist/handoff.md`
- `content/captain-ether/roles/qa/handoff.md`

## 3. Curriculum Report Prepared Under The New Rule

The full Curriculum Architect next-three-batches plan is fixed in the
Curriculum Architect role folder:

```text
content/captain-ether/roles/curriculum-architect/reports/next-three-batches-plan-2026-05-27.md
```

The Director-Engineer/chief-chat summary card points to that full report:

```text
content/captain-ether/roles/director-engineer/reports/curriculum-next-three-batches-card-2026-05-27.md
```

The earlier root-level copy created during the first pass was removed so the
role folder is the single report location.

## 4. Operational Rule For Future Assignments

Future role tasks should name report files like this:

```text
content/captain-ether/roles/<role-name>/reports/<specific-report-name>.md
```

Expected role output:

- one technical card;
- task result: `PASS`, `FAIL`, or `NEEDS DIRECTOR DECISION`;
- files changed or report-only confirmation;
- checks performed;
- risks/open questions;
- copy-ready next command or handoff for Director-Engineer.

If a future task still names an old root-level report path, the role should use
only the explicitly allowed path for that task and flag that the next assignment
should use the role-folder report path.

## 5. Verification

Checked:

- report-card rule exists in `roles/README.md`;
- `role-command-protocol.md` points role reports to `roles/<role>/reports/`;
- role `rules.md` files no longer use the old root-level report location as
  the standard;
- key handoff files say to return one copy-ready technical card;
- full curriculum report exists in the Curriculum Architect `reports/` folder;
- Director-Engineer summary card links to the full report.

## 6. Scope Confirmation

Changed protocol/rule/report files only.

No runtime, matcher, API, UI, production deploy state, batch JSON, starter
content, QA regression content, or answer policy files were changed for this
rule update.

Forbidden runtime/content files not changed:

- `content/captain-ether/starter.json`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/batches/`
- `content/captain-ether/answer-policy.md`
- `public/api/captain-ether/`
- `public/assets/`

No secrets, private config, SMTP data, `.netrc`, cookies, login codes, or player
identity data were read or written.
