# Local Web Export Scenario Selector Report

**Task:** TASK-0116  
**Owner:** Game Director / Engine Integration  
**Date:** 2026-05-27  
**Status:** Passed

## Summary

Local Web export completed for the Watch Officer build with the local Scenario 1 / Scenario 2 selector.

This is a prototype-local export only. No files were copied to `public/`, no deploy was performed, and no production route or registry was changed.

## Export Command

```text
/home/alexey/.local/bin/godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --export-release "Web Local" exports/web-local/index.html
```

## Export Output

Artifacts remain under:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

Generated files:

```text
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

## Pre-Export Tests

```text
scenario_selector_local_flow_test: 51 passed, 0 failed
scenario_two_playable_scene_slice_test: 57 passed, 0 failed
playable_greybox_scene_pack_test: 31 passed, 0 failed
local_play_loop_polish_pack_test: 45 passed, 0 failed
scenario_two_hud_binding_readability_pack_test: 29 passed, 0 failed
scenario_loader_test: 121 passed, 0 failed
```

## Export Notes

Godot reported non-blocking headless/editor warnings:

```text
Custom cursor shape not supported by this display server.
Blend file import enabled but Blender path is not configured.
```

The export command completed with exit code `0`.

## Scope Preserved

Not touched:

- `public/`;
- production deploy;
- hub route;
- product registry;
- Captain Ether;
- Nav Desk;
- auth;
- production config;
- FTP;
- VTS;
- Region B;
- final maritime training claims.

## Next Expected

QA local browser smoke for the exported Scenario 1 / Scenario 2 selector build.
