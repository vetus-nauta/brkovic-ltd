# Beta 1.1 Learning Gameplay Concept

Date: 2026-05-27
Role: Director Ether / Captain Ether
Mode: concept decision, documentation-only

## Decision

Accepted concept for Captain Ether Beta 1.1:

Captain Ether must remain a game-trainer, not a dry learning structure or LMS.
Branch-aware watches, repetition, Lost Oars, and future competitions must keep
player momentum, score pressure, and crew rivalry while still protecting Sea
Speak correctness.

## Core Product Rule

Learning progression must not remove game drive.

The player should be able to:

- repeat weak material;
- move forward after repetition;
- still earn points from review;
- earn fewer points for repeated or assisted material than for clean new
  production;
- compare records with registered users;
- compete inside rooms, crews, or teams.

## Scoring Direction

Future scoring should distinguish:

- clean answer: full value;
- accepted variant: full or near-full value, depending on Director/QA decision;
- spelling reminder: accepted, but may carry a small review flag;
- answer with hint: reduced value;
- repeated weak-card cleanup: reduced value, but still positive;
- wrong or skipped: no direct score, creates/reinforces review;
- unresolved Lost Oars: score penalty or multiplier reduction.

The goal is to let a player progress through review without making repetition
as valuable as clean first-pass recall.

## Competition Direction

Future competitions may include:

- registered user records;
- user vs user;
- room/team standings;
- crew vs crew;
- weekly or watch-period challenges;
- branch-specific records after branch-aware watches mature.

Competition scoring must reward:

- clean answers;
- consistency;
- cleanup of weak points;
- low hint dependency;
- completed watches.

Competition scoring must not reward:

- blind speed;
- repeated easy farming;
- ignoring Lost Oars;
- unsafe permissive answers.

## Design Guardrails

- Keep sessions short.
- Keep feedback warm and maritime.
- Keep Lost Oars as repair, not punishment.
- Keep branch selection optional and later, not a course catalog.
- Keep Mixed Watch as default until branch UI is separately approved.
- Do not add public competition UI or scoring changes without a separate task.

## Scope Preserved

- runtime/API not changed.
- UI not changed.
- `starter.json` not changed.
- batch JSON not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- production config and deploy/FTP state not touched.
- secrets and private config not touched.

## Checks

Tests: not run; documentation-only concept decision.
