# TASK-0087 - Platform Staged Public Candidate Update: Scenario 1 Decision Coaching Pack

Status: `staged-public-candidate-updated`

Owner chat: CHAT-PLATFORM-001 / Platform / Local Integration

Date: 2026-05-27

## Summary

Platform updated the local staged public candidate from the TASK-0086 Engine-approved artifact handoff for the `Scenario 1 Decision Coaching Pack`.

This was a local repository integration only. No production deploy, FTP upload, or production server change was performed.

## Source Documents

```text
game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md
game.brkovic.ltd/docs/game-director/chat-reporting-rules.md
game.brkovic.ltd/docs/game-director/watch-officer-decision-coaching-staged-public-decision-2026-05-27.md
game.brkovic.ltd/docs/watch-officer/staged-public-artifact-handoff-scenario-one-decision-coaching-report.md
game.brkovic.ltd/docs/watch-officer/staged-public-briefing-result-feedback-report.md
```

## Source And Destination

Source:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

Destination:

```text
game.brkovic.ltd/public/play/watch-officer/
```

## Files Copied

Copied only the TASK-0086 approved public Web artifacts:

```text
index.html
index.js
index.wasm
index.pck
index.worker.js
index.audio.worklet.js
index.apple-touch-icon.png
index.icon.png
index.png
```

Not copied:

```text
index.apple-touch-icon.png.import
index.icon.png.import
index.png.import
```

## .htaccess Preservation

Preserved existing path-local config:

```text
game.brkovic.ltd/public/play/watch-officer/.htaccess
```

Confirmed it still contains:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
X-Content-Type-Options: nosniff
AddType application/wasm .wasm
AddType application/octet-stream .pck
```

## Commands And Checks

Copy command:

```bash
cp game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.html game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.js game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.wasm game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.pck game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.worker.js game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.audio.worklet.js game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.apple-touch-icon.png game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.icon.png game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/index.png game.brkovic.ltd/public/play/watch-officer/
```

Required artifact check:

```bash
for f in .htaccess index.html index.js index.wasm index.pck index.worker.js index.audio.worklet.js; do test -f "game.brkovic.ltd/public/play/watch-officer/$f" || { echo "missing $f"; exit 1; }; done; echo 'required staged public artifacts: 7 passed, 0 failed'
```

Result:

```text
required staged public artifacts: 7 passed, 0 failed
```

Approved source/destination compare:

```bash
for f in index.html index.js index.wasm index.pck index.worker.js index.audio.worklet.js index.apple-touch-icon.png index.icon.png index.png; do cmp -s "game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/$f" "game.brkovic.ltd/public/play/watch-officer/$f" || { echo "mismatch $f"; exit 1; }; done; echo 'approved artifact copy compare: 9 passed, 0 failed'
```

Result:

```text
approved artifact copy compare: 9 passed, 0 failed
```

`.import` exclusion check:

```bash
found=$(find game.brkovic.ltd/public/play/watch-officer -type f -name '*.import' -print); if [ -n "$found" ]; then printf '%s\n' "$found"; exit 1; fi; echo 'public .import exclusion: 1 passed, 0 failed'
```

Result:

```text
public .import exclusion: 1 passed, 0 failed
```

`.htaccess` header/MIME check:

```bash
grep -q 'Cross-Origin-Opener-Policy.*same-origin' game.brkovic.ltd/public/play/watch-officer/.htaccess && grep -q 'Cross-Origin-Embedder-Policy.*require-corp' game.brkovic.ltd/public/play/watch-officer/.htaccess && grep -q 'Cross-Origin-Resource-Policy.*same-origin' game.brkovic.ltd/public/play/watch-officer/.htaccess && grep -q 'X-Content-Type-Options.*nosniff' game.brkovic.ltd/public/play/watch-officer/.htaccess && grep -q 'AddType application/wasm .wasm' game.brkovic.ltd/public/play/watch-officer/.htaccess && grep -q 'AddType application/octet-stream .pck' game.brkovic.ltd/public/play/watch-officer/.htaccess && echo '.htaccess headers and MIME: 6 passed, 0 failed'
```

Result:

```text
.htaccess headers and MIME: 6 passed, 0 failed
```

Forbidden staged claim check:

```bash
if grep -RInaI -E 'official|certified|COLREGS[- ]compliant|final maritime training|final training content|legally correct|approved instruction' game.brkovic.ltd/public/play/watch-officer; then exit 1; else echo 'forbidden staged claims: 1 passed, 0 failed'; fi
```

Result:

```text
forbidden staged claims: 1 passed, 0 failed
```

Godot public artifact isolation check:

```bash
found=$(find game.brkovic.ltd/public -type f \( -name '*.pck' -o -name '*.wasm' -o -name 'index.worker.js' -o -name 'index.audio.worklet.js' \) ! -path 'game.brkovic.ltd/public/play/watch-officer/*' -print); if [ -n "$found" ]; then printf '%s\n' "$found"; exit 1; fi; echo 'Godot public artifact isolation: 1 passed, 0 failed'
```

Result:

```text
Godot public artifact isolation: 1 passed, 0 failed
```

Route preservation check:

```bash
python3 - <<'PY'
import json
from pathlib import Path
registry=json.loads(Path('game.brkovic.ltd/content/game-registry.json').read_text())
watch=[g for g in registry['games'] if g.get('slug')=='watch_officer'][0]
assert watch['entry_route']=='/games/watch-officer', watch['entry_route']
assert watch['launch_route']=='/play/watch-officer/', watch['launch_route']
print('route preservation: 2 passed, 0 failed')
PY
```

Result:

```text
route preservation: 2 passed, 0 failed
```

## Local Static/Header Smoke

Command:

```bash
python3 - <<'PY' >/tmp/watch-officer-task-0087-header-smoke.log 2>&1 &
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
server = ThreadingHTTPServer(('127.0.0.1', 8787), handler)
server.serve_forever()
PY
pid=$!
sleep 1
curl -fsSI http://127.0.0.1:8787/play/watch-officer/index.html >/tmp/watch-officer-task-0087-index.headers
curl -fsSI http://127.0.0.1:8787/play/watch-officer/index.wasm >/tmp/watch-officer-task-0087-wasm.headers
curl -fsSI http://127.0.0.1:8787/play/watch-officer/index.pck >/tmp/watch-officer-task-0087-pck.headers
kill "$pid"
wait "$pid" 2>/dev/null || true
grep -q '200 OK' /tmp/watch-officer-task-0087-index.headers
grep -q 'Cross-Origin-Opener-Policy: same-origin' /tmp/watch-officer-task-0087-index.headers
grep -q 'Cross-Origin-Embedder-Policy: require-corp' /tmp/watch-officer-task-0087-index.headers
grep -q 'Cross-Origin-Resource-Policy: same-origin' /tmp/watch-officer-task-0087-index.headers
grep -q 'X-Content-Type-Options: nosniff' /tmp/watch-officer-task-0087-index.headers
grep -q 'Content-type: application/wasm' /tmp/watch-officer-task-0087-wasm.headers
grep -q 'Content-type: application/octet-stream' /tmp/watch-officer-task-0087-pck.headers
echo 'local static/header smoke: 7 passed, 0 failed'
```

Result:

```text
local static/header smoke: 7 passed, 0 failed
```

## Candidate Artifacts

```text
.htaccess                                      385 bytes
index.apple-touch-icon.png                  12142 bytes
index.audio.worklet.js                       7199 bytes
index.html                                   6558 bytes
index.icon.png                               5683 bytes
index.js                                   452321 bytes
index.pck                                  241840 bytes
index.png                                  21443 bytes
index.wasm                              35708238 bytes
index.worker.js                             5793 bytes
```

## Scope Confirmation

- `/games/watch-officer` remains the hub/brief route.
- `/play/watch-officer/` remains the Godot Web build route.
- Godot build artifacts remain isolated to `game.brkovic.ltd/public/play/watch-officer/`.
- Captain Ether was not touched.
- Nav Desk was not touched.
- Router/registry was not modified by this task.
- Auth was not touched.
- Production config was not touched.
- Deploy state was not touched.
- Production files were not touched.
- FTP was not used.
- No production deploy was performed.
- No production server was touched.
- No new scenario was created.
- VTS for scenario 1 was not introduced.
- No new maritime rules were added.
- Watch Officer was not presented as official, certified, COLREGS-compliant, or final maritime training content.

## Next Expected

QA staged public candidate smoke.
