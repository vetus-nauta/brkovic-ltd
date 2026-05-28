# Watch Officer QA Review: Staged Public Candidate

**Status:** approved-for-game-director-production-deploy-decision  
**Owner Chat:** QA / Validation - Watch Officer  
**Date:** 2026-05-26  
**Task:** `TASK-0062`  
**Scope:** `game.brkovic.ltd/docs/watch-officer/`

## Purpose

This report reviews the `TASK-0061` staged public integration candidate from the QA side.

It confirms whether the local repository candidate is ready for Game Director production deployment decision.

This report does not deploy to production, upload by FTP, modify production server config, modify Captain Ether gameplay or APIs, modify Nav Desk, touch auth, remove draft/non-final wording, or present Watch Officer as official, certified, COLREGS-compliant, or final maritime training content.

## Sources Reviewed

- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-public-integration-decision-2026-05-26.md`
- `game.brkovic.ltd/docs/watch-officer/staged-public-integration-candidate-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-local-web-export-artifact-review.md`
- `game.brkovic.ltd/content/game-registry.json`
- `game.brkovic.ltd/public/assets/app.js`
- `game.brkovic.ltd/public/play/watch-officer/.htaccess`

## Static And Source Checks

```text
required_public_artifacts: passed
registry_json: passed
app_js_syntax: passed
registry_routes_status: passed
forbidden_final_training_wording_scan: passed
godot_artifact_isolation_scan: passed
```

Required files present under `game.brkovic.ltd/public/play/watch-officer/`:

```text
index.html
index.js
index.wasm
index.pck
index.worker.js
```

Candidate artifact set:

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

No generated Godot artifacts were found elsewhere under `game.brkovic.ltd/public/` outside `game.brkovic.ltd/public/play/watch-officer/`.

Forbidden wording scan returned no matches for:

```text
official
certified
COLREGS compliant
correct rule
```

## Header Smoke

Python static server does not apply Apache `.htaccess`, so QA used a local-only public-root server that injects the same path-local headers for `/play/watch-officer/`.

Command:

```bash
python3 - <<'PY'
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
import mimetypes
mimetypes.add_type('application/wasm', '.wasm')
mimetypes.add_type('application/octet-stream', '.pck')
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.startswith('/play/watch-officer/'):
            self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
            self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
            self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
            self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()
handler = partial(Handler, directory='game.brkovic.ltd/public')
server = ThreadingHTTPServer(('127.0.0.1', 8767), handler)
server.serve_forever()
PY
```

Header smoke result:

```text
/play/watch-officer/index.html: HTTP 200, text/html, COOP/COEP/CORP present
/play/watch-officer/index.wasm: HTTP 200, application/wasm, COOP/COEP/CORP present
/play/watch-officer/index.pck: HTTP 200, application/octet-stream, COOP/COEP/CORP present
/play/watch-officer/: HTTP 200, text/html, COOP/COEP/CORP present
```

The staged `.htaccess` declares the required headers:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
X-Content-Type-Options: nosniff
```

It also defines:

```text
.wasm -> application/wasm
.pck  -> application/octet-stream
```

## Browser Smoke

Browser smoke used headless Chromium through Playwright against:

```text
http://127.0.0.1:8767/play/watch-officer/
```

Smoke method:

- waited for the Godot canvas;
- waited for runtime startup;
- sampled WebGL pixels through `readPixels`;
- captured ready screenshot;
- pressed `Space`;
- captured after-start screenshot;
- pressed `R`;
- captured after-reset screenshot;
- visually inspected staged screenshots for HUD readability, draft/non-final wording, VTS inactive state, and deterministic reset.

Result:

```text
staged_public_browser_smoke: passed
canvas: 1280x720, non-empty WebGL pixels
Space input: Attempt running visible
R input: Attempt ready and Tick 0 visible
```

Screenshots produced:

```text
game.brkovic.ltd/docs/watch-officer/qa-staged-public-candidate-ready.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-candidate-after-start.png
game.brkovic.ltd/docs/watch-officer/qa-staged-public-candidate-after-reset.png
```

Observed non-blocking console notes:

```text
Godot Web runtime loaded with WebGL 2.0
Blocking on the main thread is very dangerous
Output buffer has not enough frames; skipping output frame
```

These did not block rendering, start/reset input, or HUD readability in the local staged smoke.

## Route And Registry Checks

`/games/watch-officer` remains the hub/brief route in the registry:

```text
entry_route: /games/watch-officer
```

`/play/watch-officer/` is the staged Godot candidate route:

```text
launch_route: /play/watch-officer/
```

Watch Officer remains marked as prototype/draft:

```text
status: prototype
stage_ru: Прототип / draft
review_status: draft_not_final_training_content
```

The brief route code in `game.brkovic.ltd/public/assets/app.js` renders Watch Officer through `renderGameBrief(game)` and links the prototype action to `game.launch_route`. It does not replace the hub/brief route with the raw Godot export.

Captain Ether route remains stable in the registry:

```text
slug: captain_ether
status: active
entry_route: /games/captain-ether
```

The Captain Ether branch in `renderGameRoute(game)` remains separate from Watch Officer brief rendering.

## Contract Checks

| Check | QA result |
| --- | --- |
| Required Godot Web artifacts exist in `public/play/watch-officer/` | Passed. |
| Path-local `.htaccess` declares COOP/COEP/CORP | Passed. |
| `.wasm` and `.pck` MIME handling defined or verified | Passed. `.htaccess` declares MIME handling and local smoke served correct types. |
| Local server can serve `/play/watch-officer/index.html` | Passed. HTTP 200. |
| Local browser can load staged candidate path | Passed. Browser loaded `/play/watch-officer/`. |
| Canvas is non-empty after load | Passed. WebGL pixels sampled non-empty. |
| Keyboard smoke passes | Passed. `Space` start and `R` reset verified through screenshots. |
| `/games/watch-officer` remains hub/brief route | Passed. Registry and app route code confirm brief route. |
| Brief route links to `/play/watch-officer/` | Passed. Registry `launch_route` and app launch button use `/play/watch-officer/`. |
| Registry marks Watch Officer as prototype/draft | Passed. |
| No final maritime training claim appears | Passed. Source scan and screenshot inspection found no final-training claim. |
| Captain Ether route remains stable | Passed. Registry and app route branch remain separate. |
| Nav Desk, auth, FTP/deploy, and production config remain untouched by QA | Passed. QA made no changes to these areas and did not deploy. |

## Blocking Changes

None.

## QA Conditions For Production Deployment Decision

- Production deployment must be a separate Game Director decision and task.
- Production server must actually apply the path-local COOP/COEP/CORP headers for `/play/watch-officer/`.
- Production server must serve `.wasm` as `application/wasm` and `.pck` as `application/octet-stream`.
- `/games/watch-officer` must remain a brief route and must not be replaced by the raw Godot export.
- Watch Officer must remain visibly prototype/draft and non-final training content.
- Do not deploy if any public-hosting smoke loses canvas rendering, keyboard focus, draft wording, or VTS inactive state.

## Scope Confirmation

Confirmed not modified by this QA review:

```text
Captain Ether gameplay
Captain Ether APIs
Nav Desk
auth
FTP/deploy flow
production config
```

No production deployment, FTP upload, public server deployment, or final maritime training claim was introduced by QA.

## Report For ШЕФ ПРОЕКТА Watch Officer

TASK-0062 result: **approved-for-game-director-production-deploy-decision**.

QA confirms the staged public candidate exists under `/play/watch-officer/`, has required Godot Web artifacts, declares and locally verifies required Web runtime headers, renders a non-empty WebGL canvas in browser smoke, supports `Space` start and `R` reset, keeps draft/non-final wording and VTS inactive visible, and preserves `/games/watch-officer` as the hub/brief route.

No blocking changes are required before Game Director production deployment decision. Production deployment remains closed until explicitly approved, and the public server must be verified to apply the same path-local headers.
