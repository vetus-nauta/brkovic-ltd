# Watch Officer GitHub Parallel Sync Rule

**Date:** 2026-05-27  
**Owner:** ШЕФ ПРОЕКТА Watch Officer  
**Status:** Active rule  
**Repository:** `git@github.com:vetus-nauta/watch-officer.git`

## Rule

All approved Watch Officer project material and the Watch Officer site/build must be committed and pushed to the dedicated `watch-officer` GitHub repository in parallel with ongoing project work.

This repository is the external project record for Watch Officer.

## Include

Sync these Watch Officer materials:

- product documents and reports;
- Game Director task assignments, decisions, registries, and operating rules;
- role cabinets;
- visual, audio, maritime-rule, UI/HUD, Engine, QA, Platform, and deployment reports;
- Godot prototype source, scenes, scripts, tests, and scenario data;
- current Watch Officer Web site/build artifacts under `game.brkovic.ltd/public/play/watch-officer/`;
- relevant office/product/design/prototype/reference docs.

## Exclude

Do not sync:

- secrets;
- FTP credentials;
- login codes;
- cookies, sessions, CSRF values, SMTP details, `.netrc`, private config, player identity data, or server passwords;
- unrelated `brkovic-ltd` files;
- Captain Ether implementation;
- Nav Desk implementation;
- generated `.godot/`;
- local prototype export cache under `prototypes/watch-officer-godot/exports/`;
- `node_modules`;
- temporary test output;
- local backups;
- IDE files;
- placeholder WebStorm scaffold unless Game Director explicitly approves it as Watch Officer site work.

## Operational Meaning

When a task creates or updates Watch Officer files, the result should be mirrored to GitHub after:

1. the task output is reviewed or accepted for the current gate;
2. secret scan/scope check passes;
3. the commit includes only Watch Officer-relevant files;
4. the push does not imply production deployment.

GitHub sync is project continuity. It is not production deploy approval and does not replace QA, staged public, or production gates.
