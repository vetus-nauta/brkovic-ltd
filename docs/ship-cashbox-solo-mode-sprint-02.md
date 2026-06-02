# Ship Cashbox Solo Mode Sprint 02

Date: 2026-06-03
Status: active solo-mode lock
Scope: `ship-cashbox` personal journal mode
Depends on: `docs/ship-cashbox-product-map-sprint-01.md`

## Purpose

Sprint 02 completes the personal journal as a first-class mode.

Personal mode must feel like a daily-use private expense notebook, not like a crew cashbox with hidden participants.

## User Promise

A user can open personal mode and understand:

- how much money was available at the start;
- what income was added;
- what expenses were recorded;
- what remains;
- which records were saved;
- where the personal report and settings live.

## Allowed Personal Mode Surface

Visible words and concepts:

- personal journal;
- personal mode;
- opening balance;
- income;
- expenses;
- balance;
- records;
- report;
- settings;
- start;
- notebook;
- attachment/proof.

## Forbidden Personal Mode Surface

Do not show these user-facing concepts in personal mode:

- team;
- crew;
- group;
- treasurer;
- participant;
- invite;
- settlement;
- share/split;
- who owes whom;
- contribution to common cashbox;
- cashbox admin/team editor.

Internal legacy names may remain in code only if not visible to users.

## Start Behavior

The personal card on the start screen includes opening balance:

```text
Сколько денег было
```

If the user leaves it empty, the personal journal starts from `0`.

The personal journal button:

- clears welcome-preview flags;
- authenticates if needed;
- creates a personal session only when no active session exists;
- does not overwrite an existing active group session.

## Operational Behavior

The main personal screen is the notebook.

Line rules:

```text
+500 аванс
40 топливо
15 кофе
```

Rules:

- plus-sign lines are income;
- normal numeric lines are expenses;
- records can be saved and submitted using the same stable notebook mechanics;
- autosave and physical save must remain available;
- attachments must remain available as proof links.

## Personal Report

The personal report shows:

- income;
- expenses;
- balance;
- saved record list.

It must not show team settlement, participant balances, or debt matrix.

## Personal Settings

The settings window shows only:

- journal title;
- currency;
- opening balance.

It must not show team roster, invite, participant email, split controls, or contribution roster.

## Navigation

In personal mode:

- top menu contextual button is `Журнал` / `Journal`;
- workspace menu is `Меню журнала` / `Journal menu`;
- contextual button opens the personal report;
- direct calls to settlement/log diagram/log tree are redirected to the personal report.

## Sprint 02 Acceptance Checklist

- Start screen personal card has opening balance input.
- Personal creation sends `opening_balance` to backend.
- Personal top menu does not say `Группа`.
- Personal workspace button does not say `Меню кассы`.
- Personal footer says expenses, not treasurer/cashbox language.
- Personal report has income/expenses/balance/records.
- Personal settings has only title/currency/opening balance.
- Personal archive opens as a personal journal report, not as settlement/team archive.
- Invalid invite code still shows controlled error.
- Group mode remains unchanged.
- Quick equalizer remains local and no-auth.
