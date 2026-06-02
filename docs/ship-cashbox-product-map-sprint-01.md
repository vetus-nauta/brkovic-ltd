# Ship Cashbox Product Map Sprint 01

Date: 2026-06-03
Status: active product map lock
Scope: `ship-cashbox`
Source principle: Universal Web Product Bible V1

## Purpose

Sprint 01 locks Ship Cashbox as a product route, not a pile of features.

The application has four user-facing entry scenarios:

1. Personal journal.
2. Crew ship cashbox.
3. Quick equalizer.
4. Group invitation by code.

Every future change must preserve this map unless the owner explicitly approves a product-map change.

## Screen Map

### 1. Start Screen

Role: product hall.

Visible choices:

- `Веду свои расходы` / Personal journal.
- `Судовая касса команды` / Crew ship cashbox.
- `Посчитать вручную` / Quick equalizer.
- `Код приглашения в группу` / Enter group.

Rules:

- The start screen explains scenarios, not functions.
- It must not show archive, reports, team editor, OCR internals, or backend state.
- It can be opened safely from any mode through the `Старт` button.
- Opening start does not delete, close, or logout the current active session.

### 2. Personal Journal

Role: solo daily expense notebook.

Visible concepts:

- Personal mode.
- Opening balance.
- Income.
- Expenses.
- Saved records.
- Personal report.
- Personal settings.

Rules:

- No visible team, treasurer, invite, settlement, share, participant split, or who-owes-whom language.
- Income is written as `+500 advance` / `+500 аванс`.
- Expenses can be written as normal lines, for example `40 fuel` / `40 топливо`.
- Reports show income, expenses, balance, and records.
- Internally the owner may still be represented by the legacy treasurer field, but this must not leak to users.

### 3. Crew Ship Cashbox

Role: shared onboard money workspace.

Visible concepts:

- Crew/group.
- Participants.
- Contributions.
- Personal notebooks.
- Invite code.
- Settlement.
- Reports and archive.

Rules:

- Participant invite belongs in group settings/team flow, not in the main notebook.
- The main notebook remains the operational working area.
- Settlement is a result area, not the default daily workspace.
- Six-digit invite code is the friendly user-facing invite method.
- Legacy invite token can remain as compatibility plumbing, but should not be the primary UI language.

### 4. Quick Equalizer

Role: no-account manual calculator.

Visible concepts:

- People.
- Amounts.
- Final direct transfers.

Rules:

- No auth requirement.
- No journal write.
- No backend session creation.
- No saved group state.
- It must stay fast and local.

### 5. Invitation Flow

Role: participant entry into one group.

Visible concepts:

- Six-digit group invitation code.
- Enter group.
- Participant role.

Rules:

- The participant enters a group as `participant`, not admin/treasurer.
- A valid code opens only the participant's group role.
- Old token links may continue to work for compatibility.
- The invitation screen must not expose admin functions.

## Navigation Rules

### Start Button

`Старт` opens the start screen by setting `welcome=1` and the current shell reload key.

Allowed:

- From personal mode.
- From group mode.
- From participant mode.
- From desktop and mobile headers.

Forbidden:

- Closing or deleting current session.
- Logging out.
- Clearing notebook drafts.
- Creating a new session automatically.

### Start Screen Action Buttons

Personal journal button:

- Clears preview URL flags.
- Authenticates if needed.
- Opens an existing active session if one exists.
- Creates a personal session only when no active session exists.
- If an active group session already exists, opens it and warns that another active mode is already open.

Crew ship cashbox button:

- Clears preview URL flags.
- Authenticates if needed.
- Opens an existing active session if one exists.
- Creates a group session only when no active session exists.
- If an active personal session already exists, opens it and warns that another active mode is already open.

Invitation code button:

- Clears preview URL flags.
- If code is six digits, verifies `verify-invite-code`.
- If value is a legacy token, opens the legacy participant token path.

Quick equalizer button:

- Calculates locally only.
- Does not mutate session state.

## Menu Rules

Desktop/mobile menu must remain compact:

- Nav Desk.
- Workspace menu.
- Journal/Group contextual button.
- Install.
- Language.
- Theme.
- Account.

In personal mode:

- contextual button label is `Журнал` / `Journal`.
- contextual button opens personal report.

In group mode:

- contextual button label is `Группа` / `Group`.
- contextual button opens group/team area.

## Protected Do-Not-Break List

Do not break:

- fast notebook typing;
- autosave;
- physical save button;
- submit/commit of notebook records;
- invite code and legacy invite token;
- attachments and receipt links;
- settlement;
- quick equalizer;
- local WebStorm mirror workflow;
- PWA cache-bust discipline.

## Sprint 01 Acceptance Checklist

Local checks:

- `http://127.0.0.1:18090/ship-cashbox/index.html?welcome=1&reload=<version>` returns 200.
- `app.js?v=<version>` returns 200.
- Start screen has four clear scenarios.
- `Старт` is visible in work mode, hidden on welcome.
- `Старт` opens welcome without deleting the active session.
- Personal mode does not show team/invite/settlement language to the user.
- Group mode keeps participant/invite/settlement in group context.
- Quick equalizer calculates without auth or session creation.
- Invalid invite code returns a controlled error, not a PHP/runtime failure.

Source discipline:

- Edit source repo first: `/home/alexey/GitHub/Revoyacht/brkovic-ltd`.
- Mirror touched files to `/home/alexey/WebstormProjects/brkovic-ltd` before browser review.
- Bump JS/CSS/SW cache keys when runtime assets change.

## Current Sprint 01 Runtime Version

Current expected shell after this sprint: `20260603-cashbox-solo-mode-22` or later.

## Related Sprint Locks

- `docs/ship-cashbox-solo-mode-sprint-02.md` locks personal journal behavior and forbidden group-language leakage.
