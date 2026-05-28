# TASK-0057 - Export Readiness Review

**Chat ID:** CHAT-ENGINE-001  
**Department:** Engine / Godot Prototype  
**Assigned by:** ШЕФ ПРОЕКТА Watch Officer  
**Date:** 2026-05-26  
**Status:** Assigned  

## Working Directory

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd
```

## Main Project

```text
/home/alexey/GitHub/Revoyacht/brkovic-ltd/game.brkovic.ltd
```

## Source Documents

Read first:

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-play-loop-polish-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/local-play-loop-polish-pack-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-hud-binding-readability-pack-review.md`
- `game.brkovic.ltd/docs/watch-officer/qa-playable-greybox-scene-pack-review.md`
- `game.brkovic.ltd/prototypes/watch-officer-godot/README.md`
- `game.brkovic.ltd/prototypes/watch-officer-godot/project.godot`

## Task

Create an export readiness review for the local Watch Officer Godot prototype.

This is a review/planning task only. Do not export the project, do not create web build files, do not modify `public/`, do not deploy, and do not integrate with the game hub.

The goal is to decide what must be true before a separate export task is safe.

## Review Areas

Check and document:

- current Godot project status;
- main scene path;
- local launch command;
- current test suite and latest pass summaries;
- whether export presets exist;
- whether web export templates are available locally;
- likely export target for the next task;
- proposed output directory for exported files, outside `public/` unless Game Director later approves otherwise;
- whether any generated export artifacts must be gitignored or kept out of production paths;
- risks from draft/non-final maritime content;
- risks from local-only greybox UI/art;
- risks from browser/WebGL/audio/input limitations;
- whether public game hub integration should remain blocked until exported build is verified locally.

## Required Recommendations

The review must recommend one of:

- `ready-for-local-web-export-task`
- `changes-required-before-export-task`
- `blocked`

If ready, propose the next task boundaries for a local web export task.

If changes are required, list only blocking changes.

## Required Output

Create:

```text
game.brkovic.ltd/docs/watch-officer/export-readiness-review.md
```

The review must include:

- readiness decision;
- export preconditions;
- exact verification commands to run before export;
- proposed export output path;
- files/paths that must remain untouched;
- recommended next task wording in short form.

## Required Chat Reply

Use the compressed format from `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`.

## Boundaries

- Do not run a Godot export.
- Do not create exported build artifacts.
- Do not implement runtime code.
- Do not implement gameplay changes.
- Do not implement public web embedding.
- Do not deploy to production.
- Do not modify `public/`.
- Do not modify game hub routing.
- Do not modify Captain Ether.
- Do not modify Nav Desk.
- Do not touch auth or production config.
- Do not present draft maritime rules as final training content.
