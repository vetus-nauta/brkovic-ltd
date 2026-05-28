# Staged Public Scenario Selector Report

**Task:** TASK-0118  
**Owner:** Game Director / Platform Local Integration  
**Date:** 2026-05-27  
**Status:** Passed

## Summary

The local staged public candidate for Watch Officer was updated with the approved Scenario 1 / Scenario 2 selector Web export.

This is a local repo staged candidate only. No production deploy and no FTP upload were performed.

## Source

Approved local Web export:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

## Destination

Local staged public candidate:

```text
game.brkovic.ltd/public/play/watch-officer/
```

## Files Present

```text
.htaccess
index.apple-touch-icon.png
index.audio.worklet.js
index.html
index.icon.png
index.js
index.pck
index.png
index.wasm
index.worker.js
```

## Checks

```text
artifact_copy_compare: passed
public_import_exclusion: 0 .import files
htaccess_coop: present
htaccess_coep: present
wasm_mime_rule: present
pck_mime_rule: present
forbidden_claim_scan: passed
```

## Header Requirement

The staged candidate preserves the Godot Web header requirements:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Scope Preserved

Not touched:

- production server;
- FTP;
- hub route;
- registry;
- Captain Ether;
- Nav Desk;
- auth;
- production config;
- VTS;
- Region B;
- final maritime training claims.

## Next Expected

QA staged public candidate smoke.
