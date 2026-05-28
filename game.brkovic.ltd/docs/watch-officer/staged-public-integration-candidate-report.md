# TASK-0061 - отчет по Watch Officer Staged Public Integration Candidate

**Статус:** `staged-public-candidate-created`  
**Owner Chat:** CHAT-PLATFORM-001 / CHAT-ENGINE-001  
**Дата:** 2026-05-26  
**Scenario:** `safe-water-crossing-target`

## Summary

Создан staged public integration candidate для Watch Officer Godot Web prototype внутри локального репозитория.

Это не production deploy, не FTP upload, не финальное обучение и не публичное утверждение maritime rules. Watch Officer остается prototype/draft product.

## Files Changed Or Added

```text
game.brkovic.ltd/content/game-registry.json
game.brkovic.ltd/public/assets/app.js
game.brkovic.ltd/public/play/watch-officer/.htaccess
game.brkovic.ltd/public/play/watch-officer/index.apple-touch-icon.png
game.brkovic.ltd/public/play/watch-officer/index.audio.worklet.js
game.brkovic.ltd/public/play/watch-officer/index.html
game.brkovic.ltd/public/play/watch-officer/index.icon.png
game.brkovic.ltd/public/play/watch-officer/index.js
game.brkovic.ltd/public/play/watch-officer/index.pck
game.brkovic.ltd/public/play/watch-officer/index.png
game.brkovic.ltd/public/play/watch-officer/index.wasm
game.brkovic.ltd/public/play/watch-officer/index.worker.js
game.brkovic.ltd/docs/watch-officer/staged-public-integration-candidate-report.md
```

Root `game.brkovic.ltd/public/.htaccess` was read but not changed. Header support was added path-locally under `public/play/watch-officer/`.

## Copy Source And Destination

Source:

```text
game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/
```

Destination:

```text
game.brkovic.ltd/public/play/watch-officer/
```

Command:

```bash
mkdir -p game.brkovic.ltd/public/play/watch-officer
cp game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/* game.brkovic.ltd/public/play/watch-officer/
```

## Header Strategy

Added path-local Apache config:

```text
game.brkovic.ltd/public/play/watch-officer/.htaccess
```

Headers:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
X-Content-Type-Options: nosniff
```

MIME support:

```text
.wasm -> application/wasm
.pck  -> application/octet-stream
```

## Registry And Hub Route

Updated Watch Officer registry entry:

```text
entry_route: /games/watch-officer
launch_route: /play/watch-officer/
status: prototype
review_status: draft_not_final_training_content
```

`/games/watch-officer` remains the hub/brief route. It now shows prototype/draft wording and a clear action that opens:

```text
/play/watch-officer/
```

No raw Godot build replaced the hub route.

## Commands And Checks

Required artifact checks:

```bash
test -f game.brkovic.ltd/public/play/watch-officer/index.html
test -f game.brkovic.ltd/public/play/watch-officer/index.js
test -f game.brkovic.ltd/public/play/watch-officer/index.wasm
test -f game.brkovic.ltd/public/play/watch-officer/index.pck
```

Output:

```text
required watch officer public artifacts exist
```

JSON validation:

```bash
python3 -m json.tool game.brkovic.ltd/content/game-registry.json
```

Output:

```text
registry json ok
```

JS syntax:

```bash
node --check game.brkovic.ltd/public/assets/app.js
```

Output:

```text
passed, no syntax output
```

Route/link check:

```bash
python3 - <<'PY'
import json
from pathlib import Path
registry=json.loads(Path('game.brkovic.ltd/content/game-registry.json').read_text())
watch=[g for g in registry['games'] if g['slug']=='watch_officer'][0]
assert watch['entry_route']=='/games/watch-officer'
assert watch['launch_route']=='/play/watch-officer/'
assert 'draft' in watch['review_status']
print('watch officer registry route/link ok')
PY
```

Output:

```text
watch officer registry route/link ok
```

Forbidden wording check:

```bash
grep -RInE 'official|certified|COLREGS compliant|correct rule' \
  game.brkovic.ltd/content/game-registry.json \
  game.brkovic.ltd/public/assets/app.js \
  game.brkovic.ltd/public/play/watch-officer/index.html \
  game.brkovic.ltd/public/play/watch-officer/.htaccess
```

Output:

```text
none
```

Godot artifact isolation check:

```bash
find game.brkovic.ltd/public -type f \
  \( -name '*.pck' -o -name '*.wasm' -o -name 'index.worker.js' -o -name 'index.audio.worklet.js' \) \
  ! -path 'game.brkovic.ltd/public/play/watch-officer/*' -print
```

Output:

```text
none
```

## Local Static/Header Smoke

Command:

```bash
python3 - <<'PY' >/tmp/watch-officer-public-header-smoke.log 2>&1 &
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
        super().end_headers()
handler = partial(Handler, directory='game.brkovic.ltd/public')
server = ThreadingHTTPServer(('127.0.0.1', 8767), handler)
server.serve_forever()
PY
pid=$!
sleep 1
curl -sI http://127.0.0.1:8767/play/watch-officer/index.html
curl -sI http://127.0.0.1:8767/play/watch-officer/index.wasm
kill "$pid"
wait "$pid" 2>/dev/null || true
```

Output summary:

```text
HTTP/1.0 200 OK
Content-type: text/html
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin

HTTP/1.0 200 OK
Content-type: application/wasm
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

## Candidate Artifacts

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

## Known Remaining Blockers Before Production Deployment

- Needs QA review of staged public candidate route and headers.
- Needs browser smoke from `game.brkovic.ltd/public/play/watch-officer/` candidate path.
- Needs Game Director approval before FTP/upload/deploy.
- Needs public-hosting verification that Apache applies path-local COOP/COEP/CORP headers.
- Watch Officer remains draft/non-final maritime training content.

## Scope Confirmation

Confirmed not modified:

```text
Captain Ether gameplay
Captain Ether APIs
Nav Desk
auth
production config
FTP/deploy flow
```

No production deployment, no FTP upload, no public server deployment, and no final maritime training claim were introduced.
