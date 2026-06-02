# Ship Cashbox OCR / Scan Tool Release Plan

Date: 2026-06-02

## Current Implementation State

- `ship-cashbox/assets/scan-engine.js` exists as a standalone deterministic engine.
- `index.html` loads `scan-engine.js` before `app.js`.
- `sw.js` caches `scan-engine.js` in the Ship Cashbox shell.
- `scanReviewModal` has a candidate area for amount/date/description suggestions.
- API actions `scan-ocr-status` and `scan-ocr` exist.
- `scan-ocr` has a prepared Tesseract extractor path: allowed attachment download, PDF first page via `pdftoppm`, Tesseract text/TSV, line grouping with bbox/confidence.
- Current local provider is `none`: `tesseract` is not installed, `pdftoppm` is available.
- Current live provider is still rule/manual only. No Tesseract/browser OCR provider is active yet.
- Candidate chips only fill fields; they do not insert a notebook line and do not submit records.
- Current asset version: `20260602-cashbox-ocr-provider-01`.
- Current service-worker cache: `ship-cashbox-shell-v20260602-11`.
- Current API version: `2026.06.02-ship-cashbox-ocr-extractor-01`.

## Product Contract

Ship Cashbox scan is a proof intake layer for the notebook, not a second accounting screen.

- A scan saves the original source as a lightweight PDF proof first.
- OCR may only suggest amount/date/description candidates.
- The user must confirm before a notebook line is inserted.
- The inserted line is a normal notebook expense line with the committed `✓` marker.
- Existing notebook autosave, physical save, submit, attachments, invite, settlement, archive, and PDF reports must keep working.
- No OCR result may auto-submit an expense record.
- Duplicate insertion from the same scan must be blocked.

## Release Train

### Sprint 0 - Stabilize Current Scan Proof

Goal: make current no-OCR scan safe enough for local release.

Scope:

- Keep `Scan to PDF -> review modal -> Insert into notebook`.
- Keep lightweight PDF proof attachment.
- Preserve unsaved notebook draft during attachment upload.
- Ensure scan review modal is keyboard-safe on mobile.
- Ensure service worker cache version is bumped on every JS/CSS change.

Acceptance:

- Local `127.0.0.1:18090` and `127.0.0.1:18091` serve the same version string.
- Scan upload creates PDF attachment.
- Insert adds exactly one `✓` notebook line.
- Repeated insert from same scan is blocked.
- Physical save still works after scan insertion.
- Submit still clears only through existing submit action.

### Sprint 1 - Deterministic Scan Engine

Goal: build our own rule engine that ranks OCR text candidates.

Scope:

- Add standalone `ship-cashbox/assets/scan-engine.js`.
- No OCR dependency yet.
- Accept OCR plain text and optional TSV-like line/word geometry.
- Extract amount candidates.
- Extract date candidates.
- Score candidates with transparent reason codes.
- Return top candidates for review modal.

Amount rules:

- Parse `85`, `85.50`, `85,50`, `1 234,56`, `1.234,56`, `1,234.56`, `€85.50`, `85.50 EUR`, `85,-`, `85.-`.
- Prefer candidates near total markers.
- Penalize tax, VAT, subtotal, discount, change, percent, time, phone, invoice number, IBAN.
- Treat largest amount as a weak signal, not as final truth.

Date rules:

- Parse `02.06.2026`, `02/06/2026`, `02-06-26`, `2026-06-02`, `02 Jun 2026`, `Jun 02, 2026`.
- Prefer candidates near `date`, `datum`, `data`, `fecha`, `дата`, `issued`, `receipt`.
- Penalize due/expiry/valid-until dates.
- Default locale behavior: European `dd.mm.yyyy` / `dd/mm/yyyy`.

Acceptance:

- Engine runs in browser without build step.
- Engine also runs under Node for syntax/smoke testing.
- Given sample OCR strings, expected amount/date appear in top 3.
- Reasons are inspectable for debugging.

### Sprint 2 - UI Candidate Integration

Goal: connect scan-engine to the existing scan review modal.

Scope:

- Add candidate chips under amount/date inputs.
- Tapping a candidate fills the field, not inserts the expense.
- Show confidence as human labels: `likely`, `possible`, `low`.
- Keep manual input as primary fallback.
- Keep `Insert into notebook` as the only accounting action.

Acceptance:

- Candidate tap does not blur/break mobile keyboard.
- Candidate tap does not save/submit.
- Insert still produces one committed notebook line.
- Manual override always wins.

### Sprint 3 - OCR Provider Adapter

Goal: feed real OCR output into scan-engine.

Preferred path:

- Server/local Tesseract adapter first.
- Browser WASM only after weight/performance evaluation.

Tesseract contract:

- Use text plus TSV/hOCR if available.
- Preserve confidence and bounding boxes.
- Keep OCR failure non-fatal: proof PDF and manual entry still work.

Acceptance:

- If OCR succeeds, modal opens with suggested candidates.
- If OCR fails, modal opens exactly like current manual scan review.
- No secrets or external cloud OCR.
- No network dependency for core notebook operation.

### Sprint 4 - Test Corpus And Weight Tuning

Goal: make the deterministic engine better by examples, not by guessing.

Scope:

- Add local non-secret OCR text fixtures.
- Store expected amount/date/description.
- Add smoke script that reports top-1/top-3 accuracy.
- Tune marker weights with real receipts/invoices.

Acceptance:

- Top-3 amount and date accuracy is tracked.
- Every weight change has a reason.
- Bad examples stay in the corpus to prevent regressions.

## Subagent Assignments

### Explorer A - Integration Audit

Inspect current scan/notebook/attachment flow and list safe hook points, risks, and required smoke tests.

### Worker B - Scan Engine

Create standalone deterministic `scan-engine.js` with amount/date extraction and scoring. Do not edit app integration files.

### Explorer C - Release Discipline

Prepare sprint gates, rollback, and OCR provider decision points.

## Rollback

Frontend rollback:

- Revert `index.html`, `assets/app.js`, `assets/app.css`, `assets/scan-engine.js`, `sw.js`, and related translations to previous release.
- Bump service worker cache again after rollback so stale assets are purged.

Data rollback:

- No database migration is planned for OCR candidate release.
- OCR suggestions are not authoritative data.
- The PDF proof remains a normal attachment.
- Notebook lines remain editable text.

## Verification

Run before local handoff:

```bash
node --check ship-cashbox/assets/app.js
node --check ship-cashbox/sw.js
test ! -f ship-cashbox/assets/scan-engine.js || node --check ship-cashbox/assets/scan-engine.js
node - <<'NODE'
const fs = require('fs');
for (const file of ['ru','en','de','es','it','sr','zh'].map((lang) => `lang/${lang}.json`)) {
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log('ok', file);
}
NODE
git diff --check
```

Manual smoke:

1. Open `http://127.0.0.1:18091/ship-cashbox/index.html`.
2. Confirm version string in loaded HTML/JS.
3. Open active group as treasurer.
4. Type in notebook with mobile viewport.
5. Save physically.
6. Use `Scan to PDF`.
7. Confirm PDF attachment appears.
8. Insert scan line.
9. Confirm exactly one `✓` line appears.
10. Edit inserted line and confirm marker behavior remains predictable.
11. Save physically again.
12. Submit notebook through existing submit action.
13. Open settlement/archive/report paths.
