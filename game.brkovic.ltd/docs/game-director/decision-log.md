# Game Director Decision Log

## GD-DECISION-20260526-01 - Repository And Route Structure Approved

**Date:** 2026-05-26  
**Status:** Approved by CEO  
**Area:** Platform / Repository / Routing  
**Decision:** Use `brkovic-ltd` as the canonical repository. Keep the game platform inside it as `game.brkovic.ltd`. Use the game platform root as a game selection hub. Route Captain Ether through `/games/captain-ether` and Watch Officer through `/games/watch-officer`.  
**Reason:** This avoids confusion between `Revoyacht`, old staging paths, the main site, and the game platform. It also gives each game its own route and card.  
**Consequences:** Older references to `/home/alexey/GitHub/Revoyacht/game-brkovic-ltd` are deprecated. New work starts from `PATHS_QUICK.md`.  
**Related files:** `PATHS_QUICK.md`, `REPOSITORY_MAP.md`, `game.brkovic.ltd/PATHS.md`

## GD-DECISION-20260526-02 - Watch Officer Enters Pre-Production

**Date:** 2026-05-26  
**Status:** Approved by Game Director  
**Area:** Product  
**Decision:** Watch Officer is registered as the second product in `game.brkovic.ltd`, but gameplay code is not started until product bible, MVP brief, first 5 minutes, maritime rules report, UI/HUD report, engine plan, and QA validation checklist are reviewed.  
**Reason:** The product depends on verified maritime logic and tight scope control. Starting with code would increase the risk of building an attractive but educationally weak simulator.  
**Consequences:** The current route `/games/watch-officer` remains a product card. The next work packages are reports and product documents.  
**Related files:** `docs/watch-officer/product-bible.md`, `docs/watch-officer/mvp-brief.md`, `docs/watch-officer/first-5-minutes.md`, `docs/watch-officer/scope-boundaries.md`

## GD-DECISION-20260526-03 - Platform Router Owns Deep Links

**Date:** 2026-05-26  
**Status:** Approved locally  
**Area:** Platform  
**Decision:** The shared game platform router owns deep links. `entry_route` in `content/game-registry.json` is the canonical route contract for every game. Captain Ether, Watch Officer, and future games consume routes but do not own the platform router.  
**Reason:** Direct links from Nav Desk and future cards must open the correct game or product brief without manual per-game exceptions.  
**Consequences:** `/games/captain-ether` opens Captain Ether, `/games/watch-officer` opens the Watch Officer brief, `/` remains the hub, and unknown routes render a controlled not-found screen.  
**Related files:** `docs/game-director/platform-router-contract-2026-05-26.md`, `public/assets/app.js`, `content/game-registry.json`

## GD-DECISION-20260526-04 - Nav Desk Opens Game Hub

**Date:** 2026-05-26  
**Status:** Approved by Game Director  
**Area:** Nav Desk / Platform UX  
**Decision:** The Nav Desk learning card links to the general game hub `https://game.brkovic.ltd/`, not directly to Captain Ether.  
**Reason:** Nav Desk represents a training games section, not a single game. The user should choose Captain Ether, Watch Officer, and future trainers inside the hub.  
**Consequences:** The Nav Desk card text becomes `Обучающие игры`. Captain Ether remains available at `/games/captain-ether` inside the hub and as a deep link for direct references.  
**Supersedes:** Direct Nav Desk link to `https://game.brkovic.ltd/games/captain-ether`  
**Related files:** `navdesk.html`, `PATHS_QUICK.md`, `REPOSITORY_MAP.md`

## GD-DECISION-20260526-05 - Watch Officer MVP Uses IALA Region A Only

**Date:** 2026-05-26  
**Status:** Approved by Game Director  
**Area:** Gameplay / Maritime Rules  
**Decision:** Watch Officer MVP uses IALA Region A only. Every scenario data file must still explicitly declare `iala_region: "A"` so the data model remains ready for future Region B support.  
**Reason:** Region A matches the current European/Mediterranean product context and keeps the MVP small, testable, and reviewable. Region A/B dual support would increase QA and educational risk before the first playable loop is proven.  
**Consequences:** MVP scenarios may not mix Region A and Region B. Region B is deferred. Engine and QA should validate that `iala_region` exists and is set to `"A"` for MVP scenarios.  
**Related files:** `docs/watch-officer/mvp-maritime-rules-report.md`, `docs/watch-officer/mvp-brief.md`, `docs/game-director/workstreams.md`

## GD-DECISION-20260526-06 - First Scenario Constraints Approved

**Date:** 2026-05-26  
**Status:** Approved for prototype planning  
**Area:** Scenario / Gameplay / QA  
**Decision:** The first scenario `Safe Water, Crossing Target` uses one IALA Region A lateral pair, safe corridor, shallow zone, caution buffers, one power-driven crossing target from starboard, qualitative CPA/TCPA for the player, numeric CPA/TCPA in QA/debug logs, and no VTS popup.  
**Reason:** The first prototype must validate one readable navigation-and-traffic loop before adding radio pressure or more mark types.  
**Consequences:** Scenario 1 teaches lateral corridor discipline and crossing-target awareness. VTS, cardinal marks, isolated danger marks, safe-water mark as primary lesson, hard danger polygons, and Region B are deferred. Prototype may use `rule_review_status: "draft"` only with clear non-final training wording.  
**Related files:** `docs/game-director/first-scenario-decision-pack-2026-05-26.md`, `docs/watch-officer/first-5-minutes.md`, `docs/watch-officer/qa-validation-mvp-report.md`

## GD-DECISION-20260526-07 - Watch Officer Controlled Production Deploy Approved

**Date:** 2026-05-26  
**Status:** Approved for controlled production deploy task  
**Area:** Platform / Deployment  
**Decision:** The QA-approved Watch Officer staged public candidate may be deployed to production as a prototype/draft build under `/play/watch-officer/`, with `/games/watch-officer` remaining the brief route.  
**Reason:** TASK-0062 verified required artifacts, registry/routes, app syntax, header strategy, browser canvas smoke, keyboard start/reset, draft wording, VTS inactive state, and Captain Ether route separation.  
**Consequences:** Deployment is limited to the approved files in `content/game-registry.json`, `public/assets/app.js`, and `public/play/watch-officer/`. Production deploy must verify COOP/COEP/CORP headers, `.wasm`/`.pck` MIME types, browser rendering, and Captain Ether stability. This is not final maritime training approval.  
**Related files:** `docs/game-director/watch-officer-production-deploy-decision-2026-05-26.md`, `docs/game-director/task-0063-controlled-production-deploy-watch-officer-2026-05-26.md`, `docs/watch-officer/qa-staged-public-candidate-review.md`

## GD-DECISION-20260526-08 - Watch Officer Production Prototype Requires Independent QA Smoke

**Date:** 2026-05-26  
**Status:** Assigned to QA  
**Area:** QA / Production  
**Decision:** TASK-0063 deploy report is accepted as production prototype deployment evidence, but the next gate is independent QA public production smoke via TASK-0064 before calling the production prototype accepted.  
**Reason:** Deploy chat verified the route, headers, MIME, browser smoke, and Captain Ether route, but QA must independently confirm public behavior after deployment.  
**Consequences:** Watch Officer remains prototype/draft. Final maritime training approval remains closed.  
**Related files:** `docs/watch-officer/production-deploy-watch-officer-report.md`, `docs/game-director/task-0064-qa-watch-officer-production-smoke-2026-05-26.md`

## GD-DECISION-20260526-09 - Captain Ether Production Smoke Auth Block Owned By Platform Auth

**Date:** 2026-05-26  
**Status:** Assigned to Platform Auth  
**Area:** Platform Auth / Captain Ether QA  
**Decision:** Captain Ether Batch 003 production smoke auth blocker is assigned to Platform Auth, not Captain Ether content/API. Platform Auth must provide an approved non-secret production QA login method.  
**Reason:** Captain Ether route and unauthenticated auth guard appear healthy; the remaining production smoke checks require an approved login path. Exposing `dev_code` or writing login secrets to reports would be the wrong fix.  
**Consequences:** Captain Ether QA waits for TASK-0065, then reruns the existing Batch 003 production smoke task. No auth secrets may be written into repository files, reports, screenshots, logs, or chat output.  
**Related files:** `docs/game-director/task-0065-platform-auth-captain-ether-production-qa-login-2026-05-26.md`, `content/captain-ether/roles/director-engineer/reports/platform-auth-production-qa-login-request-2026-05-27.md`

## GD-DECISION-20260526-10 - Watch Officer Production Prototype Is Live

**Date:** 2026-05-26  
**Status:** Approved as public prototype/draft  
**Area:** Watch Officer / Production QA  
**Decision:** Watch Officer production prototype is recorded as live at `/play/watch-officer/`, with `/games/watch-officer` remaining the brief route.  
**Reason:** TASK-0064 independently verified production URLs, COOP/COEP/CORP headers, `.wasm` and `.pck` MIME types, brief route behavior, Godot Web rendering, Space start, R reset, draft/non-final wording, VTS inactive state, forbidden claim absence, and Captain Ether route separation.  
**Consequences:** Watch Officer may be used as a public prototype/draft. It is not final maritime training content, not certified, and not a final COLREGS/maritime authority product.  
**Related files:** `docs/watch-officer/qa-watch-officer-production-smoke-review.md`, `docs/watch-officer/production-deploy-watch-officer-report.md`

## GD-DECISION-20260526-11 - Captain Ether Production QA Login Method Approved

**Date:** 2026-05-26  
**Status:** Approved production QA login method  
**Area:** Platform Auth / Captain Ether QA  
**Decision:** Captain Ether QA may use the approved dedicated production QA mailbox/test account access path through a private channel.  
**Reason:** Batch 003 production smoke needs authenticated QA checks, and the correct fix is a controlled QA access method, not `dev_code`, content/API changes, or secret leakage into reports.  
**Consequences:** Captain Ether QA should rerun Batch 003 production smoke as TASK-0066 after receiving private access. No login codes, sessions, cookies, SMTP details, `.netrc`, private config, player email, or identity data may be written into repo files, reports, screenshots, logs, or chat output.  
**Related files:** `docs/game-director/captain-ether-production-qa-login-decision-2026-05-26.md`, `docs/game-director/task-0066-captain-ether-qa-rerun-batch-003-production-smoke-2026-05-26.md`

## GD-DECISION-20260526-12 - Captain Ether Batch 003 Production Smoke Closed

**Date:** 2026-05-26  
**Status:** PASS / Closed  
**Area:** Captain Ether / Production QA  
**Decision:** Captain Ether Batch 003 production smoke is closed as PASS.  
**Reason:** TASK-0066 verified production route/login, intended route retention, watch lengths `12/16/20`, progressive order `word -> short_expression -> phrase`, `22` unique Batch 003 item IDs live, `132` player-facing question payloads with `0` forbidden fields, and `22/22` targeted navigation matcher checks.  
**Consequences:** The prior production auth blocker is resolved. Batch 003 can be treated as live and playable from production QA perspective. The approved private QA login method remains governed by Platform Auth secrecy rules.  
**Related files:** `content/captain-ether/roles/qa/reports/batch-003-production-smoke-2026-05-27.md`, `docs/game-director/task-0066-captain-ether-qa-rerun-batch-003-production-smoke-2026-05-26.md`

## GD-DECISION-20260526-13 - Watch Officer Next Increment Is Briefing + Result Feedback

**Date:** 2026-05-26  
**Status:** Approved for UX specification  
**Area:** Watch Officer / Product Increment  
**Decision:** The next Watch Officer prototype increment is `Briefing + Result Feedback Pack`.  
**Reason:** The first production prototype is live and technically verified. The next improvement should increase player understanding of the same scenario before adding new maritime rules, a new scenario, VTS, auth, or platform work.  
**Consequences:** UX/HUD receives TASK-0067 to specify pre-start briefing and post-attempt result feedback. Engine implementation waits for that spec. Watch Officer remains prototype/draft and not final maritime training content.  
**Related files:** `docs/game-director/watch-officer-next-prototype-increment-decision-2026-05-26.md`, `docs/game-director/task-0067-watch-officer-briefing-result-feedback-ux-spec-2026-05-26.md`

## GD-DECISION-20260526-14 - Briefing + Result Feedback Moves To Engine

**Date:** 2026-05-26  
**Status:** Assigned to Engine  
**Area:** Watch Officer / Engine  
**Decision:** TASK-0067 UX spec is accepted for Engine implementation. Engine receives TASK-0068 to implement briefing and result feedback in the local Godot prototype.  
**Reason:** UX spec preserves Engine-owned maritime logic, keeps UI display-only, keeps VTS disabled, and maintains draft/non-final training wording. The two small player-facing improvements should be implemented together because they share attempt state and result display.  
**Consequences:** TASK-0068 may touch local Godot prototype files and tests only. It may not export, deploy, touch public production files, Captain Ether, Nav Desk, router/registry, auth, or production config.  
**Related files:** `docs/watch-officer/briefing-result-feedback-ux-spec.md`, `docs/game-director/task-0068-engine-briefing-result-feedback-implementation-2026-05-26.md`

## GD-DECISION-20260526-15 - Briefing + Result Feedback Moves To QA

**Date:** 2026-05-26  
**Status:** Assigned to QA  
**Area:** Watch Officer / QA  
**Decision:** TASK-0068 implementation report is accepted for QA review. QA receives TASK-0069 to review the local Godot briefing + result feedback pack before any export/deploy decision.  
**Reason:** Engine implemented the combined pack and reported full headless regression passing, including `briefing_result_feedback_pack_test: 56 passed, 0 failed`. QA must independently verify behavior, wording, state visibility, no numeric CPA/TCPA in player result surface, VTS inactive, and no final training claims.  
**Consequences:** No export or production deploy is approved yet. Watch Officer remains live as the previous public prototype until QA and Game Director approve the next export/deploy sequence.  
**Related files:** `docs/watch-officer/briefing-result-feedback-implementation-report.md`, `docs/game-director/task-0069-qa-review-briefing-result-feedback-pack-2026-05-26.md`

## GD-DECISION-20260526-16 - Briefing + Result Feedback Approved For Local Web Export

**Date:** 2026-05-26  
**Status:** Assigned to Engine  
**Area:** Watch Officer / Export  
**Decision:** TASK-0069 QA review approves the briefing + result feedback pack for local Web export. Engine receives TASK-0070 to create a prototype-local Web export under `prototypes/watch-officer-godot/exports/web-local/`.  
**Reason:** QA verified the local implementation behavior and full headless regression, including briefing visibility, result feedback visibility, reset loop, display-only state rendering, no numeric CPA/TCPA in player result surface, VTS inactive state, and no final training claims.  
**Consequences:** TASK-0070 may update prototype-local export artifacts only. It may not touch `public/`, deploy, upload, or modify production files. Production remains on the previous live prototype until export QA and Game Director deploy decision.  
**Related files:** `docs/watch-officer/qa-briefing-result-feedback-pack-review.md`, `docs/game-director/task-0070-engine-local-web-export-briefing-result-feedback-2026-05-26.md`

## GD-DECISION-20260526-17 - Briefing + Result Feedback Local Export Moves To QA

**Date:** 2026-05-26  
**Status:** Assigned to QA  
**Area:** Watch Officer / Web Export QA  
**Decision:** TASK-0070 local Web export report is accepted for QA local browser smoke. QA receives TASK-0071 to verify the prototype-local Web export before any staged public candidate decision.  
**Reason:** Engine created the export under `prototypes/watch-officer-godot/exports/web-local/` and reported full regression passing. Browser-level smoke is required before copying artifacts into `public/` or considering production deployment.  
**Consequences:** No staged public copy, production deploy, or FTP upload is approved yet. Current production remains the previous Watch Officer prototype until QA and Game Director approve the next integration sequence.  
**Related files:** `docs/watch-officer/local-web-export-briefing-result-feedback-report.md`, `docs/game-director/task-0071-qa-local-web-export-smoke-briefing-result-feedback-2026-05-26.md`

## GD-DECISION-20260526-18 - Briefing + Result Feedback Approved For Staged Public Candidate

**Date:** 2026-05-26  
**Status:** Assigned to Platform/Engine  
**Area:** Watch Officer / Staged Public Candidate  
**Decision:** TASK-0071 QA local Web export smoke approves the briefing + result feedback pack for a local staged public candidate update. The work is split by direction: Engine receives TASK-0072 for artifact handoff, then Platform receives TASK-0073 to update `game.brkovic.ltd/public/play/watch-officer/` in the repository only.  
**Reason:** QA verified artifact presence, local HTTP serving, Web runtime headers, `.wasm` and `.pck` MIME, browser canvas ready, Space start, R reset, briefing visibility, VTS inactive state, and no final training claims.  
**Consequences:** TASK-0072 may not touch `public/`; it only produces the Engine artifact manifest. TASK-0073 may copy the approved export into the local public candidate path only. No production deploy, FTP upload, or production server change is approved.  
**Related files:** `docs/watch-officer/qa-local-web-export-briefing-result-feedback-review.md`, `docs/game-director/watch-officer-briefing-result-staged-public-decision-2026-05-26.md`, `docs/game-director/task-0072-engine-artifact-handoff-briefing-result-feedback-2026-05-26.md`, `docs/game-director/task-0073-platform-staged-public-candidate-briefing-result-feedback-2026-05-26.md`

## GD-DECISION-20260526-19 - Briefing + Result Feedback Staged Candidate Moves To QA

**Date:** 2026-05-26  
**Status:** Assigned to QA  
**Area:** Watch Officer / Staged Public QA  
**Decision:** TASK-0072 Engine handoff and TASK-0073 Platform staged public update are accepted for QA staged public smoke. QA receives TASK-0074 before any production deploy decision.  
**Reason:** Engine confirmed the approved artifact manifest and Platform updated the local staged public path without `.import` files, preserving `.htaccess`, route contract, artifact isolation, and no final-training claims.  
**Consequences:** No production deploy, FTP upload, or production server change is approved yet. Production remains the previous Watch Officer prototype until QA and Game Director approve deployment.  
**Related files:** `docs/watch-officer/staged-public-artifact-handoff-briefing-result-feedback-report.md`, `docs/watch-officer/staged-public-briefing-result-feedback-report.md`, `docs/game-director/task-0074-qa-staged-public-smoke-briefing-result-feedback-2026-05-26.md`

## GD-DECISION-20260526-20 - Briefing + Result Feedback Approved For Controlled Production Deploy

**Date:** 2026-05-26  
**Status:** Assigned to Platform Deployment Officer  
**Area:** Watch Officer / Production Deploy  
**Decision:** TASK-0074 QA staged public smoke approves the briefing + result feedback pack for controlled production deployment. Platform Deployment Officer receives TASK-0075.  
**Reason:** QA verified staged artifacts, `.import` exclusion, `.htaccess` headers/MIME, registry route preservation, forbidden claim absence, Godot artifact isolation, local HTTP/header smoke, browser brief route, canvas ready, Space start, R reset, VTS inactive state, and Captain Ether route separation.  
**Consequences:** TASK-0075 may upload only approved files under `public/play/watch-officer/`. It may not upload registry/router/auth/Captain Ether/Nav Desk/unrelated production files. Watch Officer remains prototype/draft and not final maritime training content.  
**Related files:** `docs/watch-officer/qa-staged-public-briefing-result-feedback-review.md`, `docs/game-director/watch-officer-briefing-result-production-deploy-decision-2026-05-26.md`, `docs/game-director/task-0075-controlled-production-deploy-briefing-result-feedback-2026-05-26.md`

## GD-DECISION-20260526-21 - Captain Ether Batch 004 Auth Block Owned By Platform Auth

**Date:** 2026-05-26  
**Status:** Assigned to Platform Auth  
**Area:** Platform Auth / Captain Ether QA  
**Decision:** Captain Ether Batch 004 production smoke auth blocker is assigned to Platform Auth as TASK-0076.  
**Reason:** QA confirmed the route opens, unauthenticated Captain Ether API returns `401`, production `request-code` returns HTTP `200`, and `dev_code` is not exposed. The blocker is that the approved private QA code channel returns `auth_failed` before QA can retrieve the one-time code. This is not a Captain Ether content/API issue.  
**Consequences:** Captain Ether must not solve this inside content/API or expose `dev_code`. Platform Auth must restore/replace the private code channel or provide one-off approved private access without writing secrets to repository files, reports, screenshots, logs, or chat output.  
**Related files:** `docs/game-director/task-0076-platform-auth-refresh-captain-ether-batch-004-qa-code-channel-2026-05-26.md`, `content/captain-ether/roles/director-engineer/reports/platform-auth-batch-004-production-qa-code-channel-request-2026-05-27.md`, `content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`

## GD-DECISION-20260526-22 - Briefing + Result Feedback Deploy Moves To QA

**Date:** 2026-05-26  
**Status:** Assigned to QA  
**Area:** Watch Officer / Production QA  
**Decision:** TASK-0075 controlled deploy report is accepted for independent QA public production smoke. QA receives TASK-0077.  
**Reason:** Deploy Officer uploaded only approved Watch Officer artifacts, backed up overwritten files, verified production URLs, COOP/COEP/CORP headers, `.wasm` and `.pck` MIME types, browser canvas, briefing visibility, Space start, R reset, VTS inactive state, forbidden claim absence, and Captain Ether route availability.  
**Consequences:** Watch Officer production update is not closed until TASK-0077 QA confirms it independently. Watch Officer remains prototype/draft and not final maritime training content.  
**Related files:** `docs/watch-officer/production-deploy-briefing-result-feedback-report.md`, `docs/game-director/task-0077-qa-production-smoke-briefing-result-feedback-2026-05-26.md`

## GD-DECISION-20260526-23 - Captain Ether Batch 004 One-Off QA Access Approved

**Date:** 2026-05-26  
**Status:** Approved / Assigned to Captain Ether QA  
**Area:** Platform Auth / Captain Ether QA  
**Decision:** Platform Auth approved one-off private production QA access for Captain Ether Batch 004 production smoke, and Captain Ether QA receives TASK-0078 to rerun the existing smoke task.  
**Reason:** TASK-0076 confirms the blocker is the private QA access channel, not a proven Captain Ether content/API/runtime issue. The correct path is private access handoff without exposing `dev_code` or writing secrets into project artifacts.  
**Consequences:** Captain Ether QA may rerun Batch 004 production smoke after private access handoff. No login codes, sessions, cookies, CSRF values, SMTP details, `.netrc`, private config, player email, player identity data, or other secrets may be written into repository files, reports, screenshots, logs, or chat output.  
**Related files:** `docs/game-director/captain-ether-batch-004-production-qa-code-channel-decision-2026-05-26.md`, `docs/game-director/task-0078-captain-ether-qa-rerun-batch-004-production-smoke-2026-05-26.md`

## GD-DECISION-20260526-24 - Watch Officer Briefing + Result Feedback Production Update Closed

**Date:** 2026-05-26  
**Status:** Approved production prototype update  
**Area:** Watch Officer / Production QA  
**Decision:** Watch Officer `Briefing + Result Feedback Pack` production update is closed as approved.  
**Reason:** TASK-0077 independently verified public production routes, required artifacts, COOP/COEP/CORP headers, `.wasm` and `.pck` MIME types, browser canvas rendering, ready briefing, Space start, R reset, VTS inactive state, no forbidden final-training claims, and Captain Ether route separation.  
**Consequences:** Watch Officer production prototype now includes briefing + result feedback improvements. It remains prototype/draft content only; final maritime training approval remains closed.  
**Related files:** `docs/watch-officer/qa-production-briefing-result-feedback-review.md`, `docs/watch-officer/production-deploy-briefing-result-feedback-report.md`

## GD-DECISION-20260526-25 - Captain Ether Batch 004 Production Smoke Closed

**Date:** 2026-05-26  
**Status:** PASS / Closed  
**Area:** Captain Ether / Production QA  
**Decision:** Captain Ether Batch 004 production smoke is closed as PASS.  
**Reason:** TASK-0078 verified production route/login, intended route retention, watch lengths `12/16/20`, progressive order `word -> short_expression -> phrase`, `24` unique Batch 004 item IDs live, `284` player-facing question payloads with `0` forbidden fields, and `31/31` targeted Safety/Securite matcher checks.  
**Consequences:** Batch 004 can be treated as live and playable from production QA perspective. The one-off private QA access was used only for this smoke and must not be reused without a new Platform Auth decision. No secrets were written into reports, repository files, screenshots, logs, or chat output.  
**Related files:** `content/captain-ether/roles/qa/reports/batch-004-production-smoke-2026-05-27.md`, `docs/game-director/task-0078-captain-ether-qa-rerun-batch-004-production-smoke-2026-05-26.md`

## GD-DECISION-20260526-26 - Watch Officer Next Increment Is Decision Coaching

**Date:** 2026-05-26  
**Status:** Approved for UX specification  
**Area:** Watch Officer / Product Increment  
**Decision:** The next Watch Officer prototype increment is `Scenario 1 Decision Coaching Pack`, assigned first to UI/HUD as TASK-0079.  
**Reason:** The production prototype already has the first scenario, runtime state, warnings, result evaluation, briefing, and result feedback. The next most valuable step is to make the same scenario clearer as a training drill by improving in-run coaching cues and post-attempt reasons, without opening new scenario, VTS, auth, router, or deploy work.  
**Consequences:** UI/HUD creates a display-only spec for coaching cues and result-reason presentation. Engine implementation waits for Game Director acceptance of the spec. Watch Officer remains prototype/draft and not final maritime training content.  
**Related files:** `docs/game-director/watch-officer-decision-coaching-increment-decision-2026-05-26.md`, `docs/game-director/task-0079-watch-officer-scenario-one-decision-coaching-ux-spec-2026-05-26.md`

## GD-DECISION-20260526-27 - Decision Coaching Moves To Engine

**Date:** 2026-05-26  
**Status:** Assigned to Engine  
**Area:** Watch Officer / Engine  
**Decision:** TASK-0079 UX spec is accepted for Engine implementation. Engine receives TASK-0080 to implement the `Scenario 1 Decision Coaching Pack` in the local Godot prototype.  
**Reason:** The UX spec keeps UI/HUD display-only, uses Engine-owned safe-water/CPA/warning/result state, preserves VTS disabled for scenario 1, hides numeric CPA/TCPA from player mode, and keeps draft/non-final training wording.  
**Consequences:** TASK-0080 may touch local Godot prototype files and tests only. It may not export, deploy, copy to `public/`, touch Captain Ether, Nav Desk, router/registry, auth, production config, or FTP.  
**Related files:** `docs/watch-officer/scenario-one-decision-coaching-ux-spec.md`, `docs/game-director/task-0080-engine-scenario-one-decision-coaching-pack-2026-05-26.md`

## GD-DECISION-20260526-28 - Decision Coaching Moves To QA

**Date:** 2026-05-26  
**Status:** Assigned to QA  
**Area:** Watch Officer / QA  
**Decision:** TASK-0080 implementation report is accepted for QA review. QA receives TASK-0081 to verify the local Scenario 1 Decision Coaching Pack before any export/deploy decision.  
**Reason:** Engine implemented display-only coaching cues and result reasons, preserved VTS disabled, avoided player-facing numeric CPA/TCPA/debug fields, and reported full headless regression passing, including `scenario_one_decision_coaching_pack_test: 74 passed, 0 failed`.  
**Consequences:** No export, public copy, production deploy, or FTP work is approved yet. Watch Officer production remains on the previously approved briefing/result feedback build until QA and Game Director approve the next export/deploy sequence.  
**Related files:** `docs/watch-officer/scenario-one-decision-coaching-implementation-report.md`, `docs/game-director/task-0081-qa-review-scenario-one-decision-coaching-pack-2026-05-26.md`

## GD-DECISION-20260526-29 - Decision Coaching Approved For Local Web Export

**Date:** 2026-05-26  
**Status:** Assigned to Engine  
**Area:** Watch Officer / Export  
**Decision:** TASK-0081 QA review approves the Scenario 1 Decision Coaching Pack for local Web export. Engine receives TASK-0082 to export only under `prototypes/watch-officer-godot/exports/web-local/`.  
**Reason:** QA verified the coaching rail, cue limits, reset behavior, display-only boundaries, hidden debug data boundaries, VTS inactive state, no new scenario, no new maritime rule, and no final-training claims. Full headless regression passed, including `scenario_one_decision_coaching_pack_test: 74 passed, 0 failed`.  
**Consequences:** TASK-0082 may update prototype-local export artifacts only. It may not copy to `public/`, deploy, use FTP, or touch Captain Ether, Nav Desk, router/registry, auth, production config, or production files.  
**Related files:** `docs/watch-officer/qa-scenario-one-decision-coaching-pack-review.md`, `docs/game-director/watch-officer-decision-coaching-local-export-decision-2026-05-26.md`, `docs/game-director/task-0082-engine-local-web-export-scenario-one-decision-coaching-2026-05-26.md`

## GD-DECISION-20260526-30 - Decision Coaching Local Export Moves To QA

**Date:** 2026-05-26  
**Status:** Assigned to QA  
**Area:** Watch Officer / Web Export QA  
**Decision:** TASK-0082 local Web export report is accepted for QA local browser smoke. QA receives TASK-0083 to verify the exported Scenario 1 Decision Coaching Pack before any staged public candidate decision.  
**Reason:** Engine exported only to `prototypes/watch-officer-godot/exports/web-local/`, confirmed required Web artifacts, and reported full headless regression passing. Browser-level local smoke is required before copying artifacts into `public/`.  
**Consequences:** No staged public copy, production deploy, FTP upload, or production server change is approved yet. Current production remains the previously approved briefing/result feedback build until QA and Game Director approve the next integration sequence.  
**Related files:** `docs/watch-officer/local-web-export-scenario-one-decision-coaching-report.md`, `docs/game-director/task-0083-qa-local-web-export-smoke-scenario-one-decision-coaching-2026-05-26.md`

## GD-DECISION-20260527-31 - Opening Cue Visibility Fix Assigned

**Date:** 2026-05-27  
**Status:** Assigned to Engine  
**Area:** Watch Officer / Engine / Web Export QA  
**Decision:** TASK-0083 local Web export smoke is accepted as `changes-required`; Engine receives TASK-0084 to make the opening lateral-pair cue browser-visible long enough and rerun the prototype-local Web export.  
**Reason:** QA verified the local export broadly, but the opening cue `Read the lateral pair. Stay in the marked corridor.` was not observable in normal browser smoke. The exported build advanced directly to `Monitor the crossing target. CPA safe | Draft training`, including immediate and CPU-throttled screenshot attempts.  
**Consequences:** No staged public candidate, public copy, production deploy, FTP upload, or production server change is approved. Engine may make a narrow local prototype fix and rerun local export only under `prototypes/watch-officer-godot/exports/web-local/`.  
**Related files:** `docs/watch-officer/qa-local-web-export-scenario-one-decision-coaching-review.md`, `docs/game-director/task-0084-engine-fix-opening-cue-and-rerun-local-export-2026-05-27.md`

## GD-DECISION-20260527-32 - Opening Cue Fix Moves To QA Rerun

**Date:** 2026-05-27  
**Status:** Assigned to QA  
**Area:** Watch Officer / Web Export QA  
**Decision:** TASK-0084 opening cue visibility fix and local export rerun are accepted for QA rerun. QA receives TASK-0085 to verify the exported browser flow before any staged public candidate decision.  
**Reason:** Engine added a 40 fixed-tick opening cue hold, preserved higher-priority warning/result overrides, reran full headless regression, and rebuilt the local Web export under `prototypes/watch-officer-godot/exports/web-local/`. The focused decision coaching test now reports `78 passed, 0 failed`.  
**Consequences:** No staged public copy, production deploy, FTP upload, or production server change is approved yet. QA must confirm the opening cue is observable in browser export and that core local Web smoke remains clean.  
**Related files:** `docs/watch-officer/opening-cue-visibility-fix-local-export-report.md`, `docs/game-director/task-0085-qa-rerun-local-web-export-opening-cue-smoke-2026-05-27.md`

## GD-DECISION-20260527-33 - Decision Coaching Approved For Staged Public Candidate

**Date:** 2026-05-27  
**Status:** Assigned to Engine / Platform  
**Area:** Watch Officer / Staged Public Candidate  
**Decision:** TASK-0085 QA rerun approves the Scenario 1 Decision Coaching Pack for a local staged public candidate update. The work is split by direction: Engine receives TASK-0086 for artifact handoff, then Platform receives TASK-0087 to update `game.brkovic.ltd/public/play/watch-officer/` in the repository only.  
**Reason:** QA verified the opening cue is visible in browser export, remains observable through the early-running hold window at tick `36` / time `1.80s`, later progresses to target monitoring, preserves cue count limits, hides debug/numeric player-facing fields, keeps VTS inactive, passes reset behavior, and has no forbidden final-training claims.  
**Consequences:** TASK-0086 may not touch `public/`; it only produces the Engine artifact manifest. TASK-0087 may copy the approved export into the local public candidate path only. No production deploy, FTP upload, or production server change is approved.  
**Related files:** `docs/watch-officer/qa-local-web-export-opening-cue-rerun-review.md`, `docs/game-director/watch-officer-decision-coaching-staged-public-decision-2026-05-27.md`, `docs/game-director/task-0086-engine-artifact-handoff-scenario-one-decision-coaching-2026-05-27.md`, `docs/game-director/task-0087-platform-staged-public-candidate-scenario-one-decision-coaching-2026-05-27.md`

## GD-DECISION-20260527-34 - Decision Coaching Handoff Moves To Platform

**Date:** 2026-05-27  
**Status:** Assigned to Platform  
**Area:** Watch Officer / Staged Public Candidate  
**Decision:** TASK-0086 Engine artifact handoff is accepted. Platform receives TASK-0087 to update the local staged public candidate path `game.brkovic.ltd/public/play/watch-officer/` from the approved export manifest.  
**Reason:** Engine confirmed the TASK-0084/TASK-0085 approved export path, required Web artifacts, file sizes, copy list, and `.import` exclusion list, with `artifact_handoff_check: 12 passed, 0 failed`.  
**Consequences:** Platform may copy only the approved artifacts into the local staged public path and preserve `.htaccess`. No production deploy, FTP upload, or production server change is approved.  
**Related files:** `docs/watch-officer/staged-public-artifact-handoff-scenario-one-decision-coaching-report.md`, `docs/game-director/task-0087-platform-staged-public-candidate-scenario-one-decision-coaching-2026-05-27.md`

## GD-DECISION-20260527-35 - Decision Coaching Staged Candidate Moves To QA

**Date:** 2026-05-27  
**Status:** Assigned to QA  
**Area:** Watch Officer / Staged Public QA  
**Decision:** TASK-0087 Platform staged public update is accepted for QA staged public smoke. QA receives TASK-0088 before any production deploy decision.  
**Reason:** Platform copied only approved artifacts, preserved `.htaccess`, excluded `.import` metadata, preserved route contract, kept Godot artifacts isolated, passed local header/MIME smoke, and did not deploy or touch production files.  
**Consequences:** No production deploy, FTP upload, or production server change is approved yet. Production remains the previously approved Watch Officer build until QA and Game Director approve deployment.  
**Related files:** `docs/watch-officer/staged-public-scenario-one-decision-coaching-report.md`, `docs/game-director/task-0088-qa-staged-public-smoke-scenario-one-decision-coaching-2026-05-27.md`

## GD-DECISION-20260527-36 - Decision Coaching Approved For Controlled Production Deploy

**Date:** 2026-05-27  
**Status:** Assigned to Platform Deployment Officer  
**Area:** Watch Officer / Production Deploy  
**Decision:** TASK-0088 QA staged public smoke approves the Scenario 1 Decision Coaching Pack for controlled production deployment. Platform Deployment Officer receives TASK-0089.  
**Reason:** QA verified staged artifacts, `.import` exclusion, `.htaccess` headers/MIME, route preservation, HTTP artifacts, browser canvas, ready briefing, Space start, opening lateral-pair cue immediate and hold-window visibility, later target monitoring cue, reset behavior, no forbidden claims, and Captain Ether route separation.  
**Consequences:** TASK-0089 may upload only approved files under `public/play/watch-officer/`. It may not upload registry/router/auth/Captain Ether/Nav Desk/unrelated production files. Watch Officer remains prototype/draft and not final maritime training content.  
**Related files:** `docs/watch-officer/qa-staged-public-scenario-one-decision-coaching-review.md`, `docs/game-director/watch-officer-decision-coaching-production-deploy-decision-2026-05-27.md`, `docs/game-director/task-0089-controlled-production-deploy-scenario-one-decision-coaching-2026-05-27.md`

## GD-DECISION-20260527-37 - Decision Coaching Production Deploy Moves To QA

**Date:** 2026-05-27  
**Status:** Assigned to QA  
**Area:** Watch Officer / Production QA  
**Decision:** TASK-0089 production deploy report is accepted as passed. QA receives TASK-0090 to run independent public production smoke for the deployed Scenario 1 Decision Coaching Pack.  
**Reason:** Platform Deployment Officer uploaded only approved Watch Officer Web artifacts, preserved Captain Ether/Nav Desk/router/registry/auth/unrelated production config boundaries, confirmed production URL/header/MIME checks, and passed production browser smoke including opening lateral-pair cue visibility, hold-window visibility, later target-monitoring cue, R reset, VTS inactive state, and Captain Ether route separation.  
**Consequences:** Watch Officer remains a public prototype/draft until QA completes TASK-0090 and Game Director records the production prototype status. Final maritime training approval remains closed. No deploy, FTP upload, production edit, product code edit, Captain Ether change, Nav Desk change, router/registry change, auth change, or production config change is assigned to QA.  
**Related files:** `docs/watch-officer/production-deploy-scenario-one-decision-coaching-report.md`, `docs/game-director/task-0090-qa-production-smoke-scenario-one-decision-coaching-2026-05-27.md`

## GD-DECISION-20260527-38 - Visual Comfort Spec Starts Before Scenario 2

**Date:** 2026-05-27  
**Status:** Assigned to Visual Comfort  
**Area:** Watch Officer / Visual Direction  
**Decision:** CHAT-VISUAL-001 receives TASK-0091 to create the first Watch Officer visual comfort / art direction spec before Scenario 2 implementation begins.  
**Reason:** The prototype is now functional enough that visual comfort rules should be fixed before the next scenario adds more visible complexity. This prevents drift toward cartoon, harsh CAD, thin-line engineering, or noisy arcade UI while preserving the soft professional maritime simulator direction.  
**Consequences:** TASK-0091 is documentation-only. It may not touch code, scenes, assets, exports, public files, production files, deploy/FTP, Captain Ether, Nav Desk, router/registry, auth, production config, scenario data, maritime logic, or final training claims. TASK-0090 remains the independent production QA gate for Scenario 1.  
**Related files:** `docs/roles/visual-comfort-art-direction/first-brief.md`, `docs/game-director/task-0091-visual-comfort-art-direction-spec-2026-05-27.md`

## GD-DECISION-20260527-39 - Maritime Rules Auditor Cabinet Prepared

**Date:** 2026-05-27  
**Status:** Prepared, not activated  
**Area:** Watch Officer / Maritime Rules Audit  
**Decision:** A future `CHAT-MARITIME-RULES-001` cabinet is prepared for Maritime Rules Auditor work covering COLREGS/MPPSS, IALA/MAMS, scenario-rule audits, algorithm boundaries, wording safety, and draft/non-final training limits.  
**Reason:** This separates implementation QA from maritime-rule authority review. QA verifies behavior and regressions; Maritime Rules Auditor will review rule traceability, algorithm boundaries, learner wording, and overclaim risk when activated by Game Director.  
**Consequences:** The role is not activated and has no current product task. It may not edit code, scenario logic, public files, production files, Captain Ether, Nav Desk, router/registry, auth, deployment, FTP, or final maritime training claims unless explicitly assigned.  
**Related files:** `docs/roles/maritime-rules-auditor/README.md`, `docs/roles/maritime-rules-auditor/rules.md`, `docs/roles/maritime-rules-auditor/onboarding.md`, `docs/roles/maritime-rules-auditor/handoff.md`, `docs/roles/maritime-rules-auditor/first-brief.md`

## GD-DECISION-20260527-40 - Audio Direction Starts As Focus Soundscape Spec

**Date:** 2026-05-27  
**Status:** Assigned to Audio Direction  
**Area:** Watch Officer / Audio Direction  
**Decision:** CHAT-AUDIO-001 is prepared and receives TASK-0092 to create the first Watch Officer audio direction and sound design spec.  
**Reason:** Watch Officer needs calm focus music, maritime ambience, system sounds, success/fail feedback, and warning audio rules before audio assets are produced. The first pass must define psychological comfort, one-hour loop structure, ambience layers, and accessibility boundaries without creating files or touching runtime systems.  
**Consequences:** TASK-0092 is documentation-only. It may not create audio files, edit code, scenes, assets, exports, public files, production files, deploy/FTP, Captain Ether, Nav Desk, router/registry, auth, production config, scenario data, maritime logic, VTS/radio chatter, or final training claims.  
**Related files:** `docs/roles/audio-direction-sound-design/README.md`, `docs/roles/audio-direction-sound-design/rules.md`, `docs/roles/audio-direction-sound-design/onboarding.md`, `docs/roles/audio-direction-sound-design/handoff.md`, `docs/roles/audio-direction-sound-design/first-brief.md`, `docs/game-director/task-0092-audio-direction-sound-design-spec-2026-05-27.md`

## GD-DECISION-20260527-41 - Audio Direction Spec Ready For Review

**Date:** 2026-05-27  
**Status:** For Review  
**Area:** Watch Officer / Audio Direction  
**Decision:** TASK-0092 output is accepted as ready for Game Director review.  
**Reason:** The audio spec defines calm professional maritime focus, one-hour loop planning, maritime ambience layers, water/wind/birds treatment, UI/system sounds, success/fail/correction sounds, warning sound escalation, mute/reduction rules, browser considerations, and QA acceptance criteria without creating audio files or touching implementation.  
**Consequences:** No audio implementation, asset generation, Engine hook, export, deploy, or production change is approved yet. Visual comfort and QA production smoke remain active parallel gates.  
**Related files:** `docs/watch-officer/audio-direction-sound-design-spec.md`

## GD-DECISION-20260527-42 - Visual Comfort Spec Ready For Review

**Date:** 2026-05-27  
**Status:** For Review  
**Area:** Watch Officer / Visual Direction  
**Decision:** TASK-0091 output is accepted as ready for Game Director review.  
**Reason:** The visual spec defines the soft professional maritime simulator direction, prohibited cartoon/CAD/arcade styles, palette, line weights, water/safe/shallow/danger treatment, vessel/mark/AIS vector treatment, decision coaching rail rules, HUD readability, motion comfort, desktop/mobile criteria, accessibility criteria, QA checklist, and UI/HUD plus Engine handoff notes without touching implementation.  
**Consequences:** No visual implementation, asset change, Engine/UI pass, export, deploy, or production change is approved yet. TASK-0090 remains the only blocker before recording Scenario 1 production prototype status.  
**Related files:** `docs/watch-officer/visual-comfort-art-direction-spec.md`

## GD-DECISION-20260527-43 - Scenario 1 Production Prototype Approved

**Date:** 2026-05-27  
**Status:** Approved public production prototype  
**Area:** Watch Officer / Production Prototype  
**Decision:** Scenario 1 Decision Coaching Pack is approved as a public production prototype.  
**Reason:** TASK-0090 independent QA production smoke passed with `production_smoke: 41 passed, 0 failed`, including production URLs, artifact HTTP checks, COOP/COEP/CORP headers, MIME checks, non-empty browser canvas, ready briefing, Space start, opening lateral-pair cue immediate and hold-window visibility, later target-monitoring cue, R reset, VTS inactive/no popup, draft/non-final wording, forbidden final-claim scan, and Captain Ether route separation.  
**Consequences:** Scenario 1 is stable enough to move MVP development to the next scenario. This is not final maritime training approval, certification, legal correctness approval, or COLREGS-compliant training approval.  
**Related files:** `docs/watch-officer/qa-production-scenario-one-decision-coaching-review.md`, `docs/game-director/watch-officer-scenario-one-production-prototype-status-2026-05-27.md`

## GD-DECISION-20260527-44 - Scenario 2 Starts With Rules Decision Pack

**Date:** 2026-05-27  
**Status:** Assigned to Gameplay  
**Area:** Watch Officer / Scenario 2  
**Decision:** CHAT-GAMEPLAY-001 receives TASK-0093 to draft Scenario 2 Head-On Port-to-Port rules decision pack.  
**Reason:** Scenario 1 production prototype gate is closed. The next MVP gap is content breadth, and the lowest-risk next training expansion is a narrow head-on port-to-port drill before adding VTS, Region B, random traffic, radar/night, or broader mark lessons.  
**Consequences:** TASK-0093 is documentation-only. It may not edit code, scenario data, schema, scenes, assets, public files, production files, deploy/FTP, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims.  
**Related files:** `docs/game-director/task-0093-gameplay-scenario-two-head-on-port-to-port-rules-2026-05-27.md`

## GD-DECISION-20260527-45 - Scenario 2 Moves To Maritime Audit

**Date:** 2026-05-27  
**Status:** Assigned to Maritime Rules Auditor  
**Area:** Watch Officer / Maritime Rules Audit  
**Decision:** TASK-0093 Scenario 2 Head-On Port-to-Port rules report is accepted for maritime audit. CHAT-MARITIME-RULES-001 receives TASK-0094 before UI/HUD or Engine implementation.  
**Reason:** The Gameplay report is strong enough to proceed, but it correctly identifies unresolved maritime-rule questions around nearly reciprocal thresholds, off-bow doubt, starboard alteration wording, port alteration severity, speed-reduction recovery, simple-channel constraints, CPA/pass-distance training values, and sign-off for `rule_review_status: "approved"`. These must be bounded before implementation so scenario-specific logic is not mistaken for final maritime instruction.  
**Consequences:** TASK-0094 is documentation audit only. No code, scenario data, schema, UI/HUD, Engine implementation, export, deploy, public files, production files, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claim is approved.  
**Related files:** `docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md`, `docs/game-director/task-0094-maritime-audit-scenario-two-head-on-port-to-port-2026-05-27.md`

## GD-DECISION-20260527-46 - Scenario 2 Approved For UI And Engine Planning

**Date:** 2026-05-27  
**Status:** Assigned to UI/HUD and Engine  
**Area:** Watch Officer / Scenario 2 Planning  
**Decision:** TASK-0094 maritime audit approves Scenario 2 Head-On Port-to-Port for UI/HUD and Engine planning. UI/HUD receives TASK-0095 and Engine receives TASK-0096.  
**Reason:** Maritime audit approved the scenario as a narrow draft MVP drill, with required boundaries for scenario-local thresholds, early starboard alteration wording, port alteration severity grading, speed reduction as secondary recovery, simple-channel caution, visible draft/non-final wording, VTS exclusion, IALA Region A only, and open human-expert questions before final training approval.  
**Consequences:** TASK-0095 and TASK-0096 are documentation-only. No implementation, scenario/schema edit, export, deploy, public file change, production change, Captain Ether, Nav Desk, router/registry, auth, VTS, Region B, or final maritime training claim is approved.  
**Related files:** `docs/watch-officer/maritime-audit-scenario-two-head-on-port-to-port.md`, `docs/game-director/task-0095-ui-hud-scenario-two-head-on-port-to-port-spec-2026-05-27.md`, `docs/game-director/task-0096-engine-scenario-two-schema-classifier-planning-2026-05-27.md`

## GD-DECISION-20260527-47 - Scenario 2 UI And Engine Planning Ready For Review

**Date:** 2026-05-27  
**Status:** For Review  
**Area:** Watch Officer / Scenario 2 Planning  
**Decision:** TASK-0095 UI/HUD spec and TASK-0096 Engine schema/classifier planning are ready for Game Director review.  
**Reason:** The UI/HUD spec keeps player-facing Scenario 2 guidance display-only, hides numeric CPA/TCPA and classifier thresholds, preserves draft/non-final wording, excludes VTS, and uses Visual/Audio direction as non-implementation inputs. The Engine planning report identifies narrow schema generalization, Scenario 2 data contract, head-on classifier boundaries, port-to-port pass detection, event logging, CPA/TCPA integration, runtime snapshot fields, replay fixtures, tests, likely future files, and stop conditions.  
**Consequences:** No implementation is approved yet. The likely next slice is schema/data/loader validation for Scenario 2 only, while preserving Scenario 1 regression and avoiding playable scene, export, deploy, VTS, Region B, or final maritime training claims.  
**Related files:** `docs/watch-officer/scenario-two-head-on-port-to-port-ui-hud-spec.md`, `docs/watch-officer/scenario-two-engine-schema-classifier-planning.md`

## GD-DECISION-20260527-48 - Scenario 2 Loader Validation Slice Starts

**Date:** 2026-05-27
**Status:** In Progress
**Area:** Watch Officer / Engine
**Decision:** TASK-0097 starts the first Scenario 2 implementation slice: schema/data/loader validation only.
**Reason:** UI/HUD and Engine planning are ready enough to create a Scenario 2 data contract without touching playable scene, classifier runtime, warning/result runtime, export, public files, or production.
**Consequences:** This slice may add Scenario 2 JSON, narrow schema generalization, loader validation, and headless loader tests. It may not implement gameplay, UI/HUD, head-on classifier runtime, port-to-port detection, export, deploy, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0097-engine-scenario-two-schema-data-loader-validation-2026-05-27.md`

## GD-DECISION-20260527-49 - Scenario 2 Loader Validation Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA review
**Area:** Watch Officer / Engine
**Decision:** TASK-0097 completed the Scenario 2 schema/data/loader validation slice.
**Reason:** Scenario 2 now has draft data, schema support, loader contract validation, and headless loader tests while preserving Scenario 1 regression. JSON parse checks passed for schema and both scenarios. The required loader test passed with `scenario_loader_test: 121 passed, 0 failed`; full headless regression passed with 0 failed tests.
**Consequences:** The next gate is QA review of TASK-0097. No playable Scenario 2, UI/HUD implementation, head-on runtime classifier, port-to-port detection, export, deploy, VTS, Region B, or final maritime training claim is approved by this decision.
**Related files:** `docs/watch-officer/scenario-two-schema-data-loader-validation-report.md`, `prototypes/watch-officer-godot/data/scenarios/head-on-port-to-port.json`

## GD-DECISION-20260527-50 - Scenario 2 Loader Validation Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0098 is assigned to QA for Scenario 2 schema/data/loader validation review.
**Reason:** TASK-0097 passed implementation-side checks, but the next Engine slice should not start until QA confirms the loader contract, Scenario 1 regression, Scenario 2 draft data, VTS exclusion, Region A-only boundary, and no accidental playable/export/public/deploy changes.
**Consequences:** QA may run headless loader/regression checks and write a review report. QA may not edit implementation code, scenario data, public files, production files, Captain Ether, Nav Desk, router/registry, auth, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0098-qa-review-scenario-two-schema-data-loader-validation-2026-05-27.md`

## GD-DECISION-20260527-51 - Scenario 2 Loader Validation QA Approved

**Date:** 2026-05-27
**Status:** Approved for next Engine slice
**Area:** Watch Officer / QA
**Decision:** TASK-0098 approves Scenario 2 schema/data/loader validation for the next Engine slice.
**Reason:** QA confirmed Scenario 1 loader regression, Scenario 2 draft load, Region A-only data, draft/non-final claim status, disabled VTS, one reciprocal-or-nearly-reciprocal power-driven target, head_on / head_on_alter_starboard encounter contract, deterministic replay metadata, and blocking loader errors for invalid Scenario 2 fields. Required loader test passed with `scenario_loader_test: 121 passed, 0 failed`; full headless regression passed with 0 failed tests.
**Consequences:** The next Engine task may implement Scenario 2 head-on classifier and event logging foundation. Playable Scenario 2 scene, UI/HUD implementation, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-scenario-two-schema-data-loader-validation-review.md`

## GD-DECISION-20260527-52 - Scenario 2 Head-On Classifier Slice Assigned

**Date:** 2026-05-27
**Status:** Assigned to Engine
**Area:** Watch Officer / Engine
**Decision:** TASK-0099 is assigned for Scenario 2 head-on classifier and event logging foundation.
**Reason:** TASK-0098 approved the Scenario 2 loader/data contract. The next useful implementation step is a narrow classifier foundation that creates deterministic Engine-owned classification and event evidence before playable scene, UI, result logic, export, or deploy work.
**Consequences:** Engine may add a Scenario 2 specific classifier module, deterministic event log names/payloads, and focused headless tests. Playable Scenario 2, UI/HUD, port-to-port pass detection, result evaluation, warning escalation, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/game-director/task-0099-engine-scenario-two-head-on-classifier-event-log-foundation-2026-05-27.md`

## GD-DECISION-20260527-53 - Scenario 2 Head-On Classifier Slice Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA review
**Area:** Watch Officer / Engine
**Decision:** TASK-0099 completed the Scenario 2 head-on classifier and event logging foundation slice.
**Reason:** Engine added a Scenario 2 specific classifier, deterministic initial-classification event payload, focused headless test, and Scenario 2 target-state support while preserving Scenario 1 regression. Required tests passed: `scenario_loader_test: 121 passed, 0 failed`, `scenario_one_encounter_classifier_test: 16 passed, 0 failed`, and `scenario_two_head_on_classifier_event_log_test: 34 passed, 0 failed`. Full headless regression passed with 0 failed tests.
**Consequences:** The next gate is QA review of TASK-0099. Playable Scenario 2, UI/HUD, port-to-port pass detection, result evaluation changes, warning escalation changes, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/scenario-two-head-on-classifier-event-log-foundation-report.md`

## GD-DECISION-20260527-54 - Scenario 2 Head-On Classifier Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0100 is assigned to QA for Scenario 2 head-on classifier and event log foundation review.
**Reason:** TASK-0099 passed implementation-side checks. QA should confirm the classifier remains scenario-specific, Scenario 1 regression is preserved, invalid inputs reject safely, deterministic event payload is acceptable, and no playable/export/public/deploy scope was opened.
**Consequences:** QA may run headless tests and write a review report. QA may not edit code, implement pass detection, implement UI/HUD, create a playable scene, export, deploy, edit public files, or touch Captain Ether, Nav Desk, router/registry, auth, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0100-qa-review-scenario-two-head-on-classifier-event-log-foundation-2026-05-27.md`

## GD-DECISION-20260527-57 - Scenario 2 Head-On Classifier QA Approved

**Date:** 2026-05-27
**Status:** Approved for next Engine slice
**Area:** Watch Officer / QA
**Decision:** TASK-0100 approves Scenario 2 head-on classifier and event log foundation for the next Engine slice.
**Reason:** QA confirmed the classifier is scenario-specific, Scenario 1 regression is preserved, invalid inputs reject safely, deterministic event payload is present, and no playable/export/public/deploy scope was opened. Required tests passed with `scenario_loader_test: 121 passed, 0 failed`, `scenario_one_encounter_classifier_test: 16 passed, 0 failed`, and `scenario_two_head_on_classifier_event_log_test: 34 passed, 0 failed`. Full headless regression passed with 0 failed tests.
**Consequences:** The next Engine task may implement Scenario 2 port-to-port pass detection and early starboard alteration event foundation. Playable Scenario 2, UI/HUD, result evaluation changes, warning escalation changes, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-scenario-two-head-on-classifier-event-log-foundation-review.md`

## GD-DECISION-20260527-58 - Scenario 2 Port-To-Port Event Slice Assigned

**Date:** 2026-05-27
**Status:** Assigned to Engine
**Area:** Watch Officer / Engine
**Decision:** TASK-0102 is assigned for Scenario 2 port-to-port pass detection and early starboard alteration event foundation.
**Reason:** TASK-0100 approved the head-on classifier and event log foundation. The next narrow Engine-owned state is deterministic detection of the expected early starboard action and the controlled port-to-port pass relationship before playable scene, UI/HUD, result evaluation, export, or deploy work.
**Consequences:** Engine may add a Scenario 2 specific event detector, deterministic event names/payloads, and focused headless tests. Playable Scenario 2, UI/HUD, result evaluation changes, warning escalation changes, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/game-director/task-0102-engine-scenario-two-port-to-port-pass-early-starboard-event-foundation-2026-05-27.md`

## GD-DECISION-20260527-59 - Scenario 2 Port-To-Port Event Slice Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA review
**Area:** Watch Officer / Engine
**Decision:** TASK-0102 completed the Scenario 2 port-to-port pass and early starboard alteration event foundation slice.
**Reason:** Engine added a Scenario 2 specific event detector, deterministic event names/payloads, and focused headless tests while preserving Scenario 1 and Scenario 2 classifier regressions. Required tests passed with `scenario_loader_test: 121 passed, 0 failed`, `scenario_one_encounter_classifier_test: 16 passed, 0 failed`, `scenario_two_head_on_classifier_event_log_test: 34 passed, 0 failed`, and `scenario_two_pass_event_detector_test: 30 passed, 0 failed`. Full headless regression passed with 0 failed tests.
**Consequences:** The next gate is QA review of TASK-0102. Playable Scenario 2, UI/HUD, result evaluation changes, warning escalation changes, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/scenario-two-port-to-port-pass-early-starboard-event-foundation-report.md`

## GD-DECISION-20260527-60 - Scenario 2 Port-To-Port Event Slice Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0103 is assigned to QA for Scenario 2 port-to-port pass and early starboard alteration event foundation review.
**Reason:** TASK-0102 passed implementation-side checks. QA should confirm event detector scope, deterministic payloads, rejection paths, and preserved boundaries before the next Engine slice starts.
**Consequences:** QA may run headless tests and write a review report. QA may not edit code, implement UI/HUD, create a playable scene, change result evaluation, change warning escalation, export, deploy, edit public files, or touch Captain Ether, Nav Desk, router/registry, auth, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0103-qa-review-scenario-two-port-to-port-pass-early-starboard-event-foundation-2026-05-27.md`

## GD-DECISION-20260527-61 - Scenario 2 Port-To-Port Event QA Approved

**Date:** 2026-05-27
**Status:** Approved for next Engine slice
**Area:** Watch Officer / QA
**Decision:** TASK-0103 approves Scenario 2 port-to-port pass and early starboard alteration event foundation for the next Engine slice.
**Reason:** QA confirmed Scenario 2-specific detector scope, early starboard action-window behavior, rejection of late/port/wrong pass/unsafe CPA/collision cases, deterministic event types, deterministic payloads, and preserved boundaries. Required tests and full headless regression passed with 0 failed tests.
**Consequences:** The next Engine task may bind Scenario 2 classifier/detector outputs into Engine-owned runtime state and export contract planning. Playable Scenario 2, UI/HUD implementation, result evaluation changes, warning escalation changes, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-scenario-two-port-to-port-pass-early-starboard-event-foundation-review.md`

## GD-DECISION-20260527-62 - Scenario 2 Runtime State Export Plan Passed

**Date:** 2026-05-27
**Status:** Passed
**Area:** Watch Officer / Engine
**Decision:** TASK-0104 created the Scenario 2 runtime state export contract and orchestrator integration plan.
**Reason:** Scenario 2 classifier and detector foundations are approved. Before UI/HUD or playable-scene work, Engine needs a clear contract for `runtime_state["scenario_two"]`, `snapshot["scenario_two"]`, event payloads, debug-only fields, and orchestrator update order.
**Consequences:** The next Engine task may implement Scenario 2 runtime state export and orchestrator integration foundation. Playable Scenario 2, UI/HUD implementation, result evaluation changes, warning escalation changes, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/scenario-two-runtime-state-export-contract-plan.md`

## GD-DECISION-20260527-63 - Scenario 2 Runtime State Export Integration Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA review
**Area:** Watch Officer / Engine
**Decision:** TASK-0105 completed Scenario 2 runtime state export and orchestrator integration foundation.
**Reason:** Engine now routes Scenario 2 through Scenario 2 classifier/detector modules, exports `runtime_state["scenario_two"]`, `snapshot["scenario_two"]`, and `snapshot["qa"]["scenario_two_debug"]`, while preserving Scenario 1 runtime step behavior. Focused and full headless regression passed with 0 failed tests.
**Consequences:** The next gate is QA review of TASK-0105. Playable Scenario 2, UI/HUD implementation, result evaluation semantic changes, warning escalation semantic changes, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/scenario-two-runtime-state-export-orchestrator-integration-foundation-report.md`

## GD-DECISION-20260527-64 - Scenario 2 Runtime State Export Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0106 is assigned to QA for Scenario 2 runtime state export and orchestrator integration foundation review.
**Reason:** TASK-0105 passed implementation-side checks. QA should confirm Scenario 1 behavior preservation, Scenario 2 state/snapshot branches, debug segregation, VTS disabled state, and no accidental UI/playable/export scope.
**Consequences:** QA may run headless tests and write a review report. QA may not edit code, implement UI/HUD, create a playable scene, change result evaluation, change warning escalation, export, deploy, edit public files, or touch Captain Ether, Nav Desk, router/registry, auth, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0106-qa-review-scenario-two-runtime-state-export-orchestrator-integration-foundation-2026-05-27.md`

## GD-DECISION-20260527-65 - Scenario 2 Runtime State Export QA Approved

**Date:** 2026-05-27
**Status:** Approved for next slice
**Area:** Watch Officer / QA
**Decision:** TASK-0106 approves Scenario 2 runtime state export and orchestrator integration foundation.
**Reason:** QA confirmed Scenario 1 runtime behavior preservation, Scenario 2 runtime/snapshot/QA-debug branches, Scenario 2 classifier/detector routing, debug segregation from display snapshot, disabled/inactive VTS, and no accidental UI/playable/export scope. Required tests and full headless regression passed with 0 failed tests.
**Consequences:** Scenario 2 UI/HUD binding plan or Engine playable scene planning may start. UI/HUD can consume Engine-owned Scenario 2 state as display-only. Final maritime training approval remains closed.
**Related files:** `docs/watch-officer/qa-scenario-two-runtime-state-export-orchestrator-integration-foundation-review.md`

## GD-DECISION-20260527-55 - Localization Role Office Prepared

**Date:** 2026-05-27
**Status:** Prepared, not yet activated
**Area:** Watch Officer / Localization
**Decision:** CHAT-LOCALIZATION-001 is created as Localization / Language Lead for English/Russian copy, terminology, text-key discipline, and localization safety.
**Reason:** Watch Officer already contains English/Russian prototype copy and Scenario 2 will add more player-facing wording. A separate language role is needed before UI/HUD text expands, so translations do not change maritime meaning, exceed layout constraints, or create final/certified training claims.
**Consequences:** Localization may be assigned a future task to create a terminology baseline, text-key inventory, and English/Russian copy table. This decision does not approve code edits, UI implementation, scenario data changes, final maritime training claims, export, deploy, Captain Ether, Nav Desk, router/registry, auth, VTS, or Region B.
**Related files:** `docs/roles/localization-language-lead/README.md`, `docs/roles/localization-language-lead/rules.md`, `docs/roles/localization-language-lead/onboarding.md`, `docs/roles/localization-language-lead/handoff.md`, `docs/roles/localization-language-lead/first-brief.md`

## GD-DECISION-20260527-56 - Localization Language Policy Set

**Date:** 2026-05-27
**Status:** Approved policy
**Area:** Watch Officer / Localization
**Decision:** Watch Officer localization policy is English-first with system/browser locale detection and English fallback. Supported localization candidates are Russian, German, Italian, Spanish, Serbian/Montenegrin/Croatian, and Mandarin Chinese.
**Reason:** The product needs clear language order before UI/HUD and scenario text expansion. English must remain the source and fallback so missing or ambiguous locale detection never blocks gameplay.
**Consequences:** Implementation should eventually detect the user's system/browser locale and fallback to English if unknown or unsupported. Sea Speak training phrases remain fixed English learning content and must not be translated as ordinary UI copy. Localization may translate UI, instructions, explanations, warnings, and result feedback around Sea Speak, but not replace the Sea Speak phrase target.
**Related files:** `docs/roles/localization-language-lead/README.md`, `docs/roles/localization-language-lead/rules.md`

## GD-DECISION-20260527-66 - Scenario 2 UI/HUD Binding Foundation Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA review
**Area:** Watch Officer / UI-HUD
**Decision:** TASK-0107 completed Scenario 2 UI/HUD binding foundation.
**Reason:** HUD now maps Engine-owned `snapshot["scenario_two"]` fields to approved Scenario 2 draft briefing, active coaching, status, and result feedback wording. The implementation remains display-only and does not import simulation modules or read `snapshot["qa"]["scenario_two_debug"]`. Focused and full headless regression passed with 0 failed tests.
**Consequences:** The next gate is QA review of TASK-0107. Playable Scenario 2 route, scenario selection UI, export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/scenario-two-ui-hud-binding-foundation-report.md`

## GD-DECISION-20260527-67 - Scenario 2 UI/HUD Binding Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0108 is assigned to QA for Scenario 2 UI/HUD binding foundation review.
**Reason:** TASK-0107 passed implementation-side checks. QA should confirm Scenario 1 HUD preservation, Scenario 2 display-only behavior, approved wording, hidden debug fields, forbidden-claim absence, disabled/inactive VTS, and no accidental playable/export/public scope.
**Consequences:** QA may run headless tests and write a review report. QA may not edit code, implement playable Scenario 2, export, deploy, edit public files, or touch Captain Ether, Nav Desk, router/registry, auth, production config, FTP, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0108-qa-review-scenario-two-ui-hud-binding-foundation-2026-05-27.md`

## GD-DECISION-20260527-68 - Scenario 2 UI/HUD Binding QA Approved

**Date:** 2026-05-27
**Status:** Approved for next slice
**Area:** Watch Officer / QA
**Decision:** TASK-0108 approves Scenario 2 UI/HUD binding foundation for the next Scenario 2 playable-scene planning slice.
**Reason:** QA confirmed approved Scenario 2 draft wording, one primary cue plus capped chips, display-only binding to `runtime_snapshot["scenario_two"]`, no HUD-side simulation computation, no `snapshot["qa"]["scenario_two_debug"]` exposure, Scenario 1 HUD preservation, disabled/inactive VTS, and absence of forbidden player-facing claims. Required focused tests passed with 0 failed tests.
**Consequences:** The next task may plan Scenario 2 playable-scene integration. Export, deploy, public changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-scenario-two-ui-hud-binding-foundation-review.md`

## GD-DECISION-20260527-69 - Scenario 2 Playable Scene Planning Passed

**Date:** 2026-05-27
**Status:** Passed
**Area:** Watch Officer / Engine
**Decision:** TASK-0109 created the local Scenario 2 playable-scene planning artifact.
**Reason:** QA approved Scenario 2 HUD binding, so the next controlled move is a narrow local Godot playable-scene slice. The plan keeps the existing greybox scene as the preferred boundary, preserves Scenario 1 as default, adds local scenario path selection, reuses orchestrator/HUD binding, and excludes export, deploy, public routes, registry, Captain Ether, Nav Desk, auth, VTS, Region B, and final maritime training claims.
**Consequences:** The next task may implement the local Scenario 2 playable-scene slice with focused headless tests. Export/deploy/public work remains closed.
**Related files:** `docs/watch-officer/scenario-two-playable-scene-planning.md`

## GD-DECISION-20260527-70 - Scenario 2 Local Playable Scene Slice Assigned

**Date:** 2026-05-27
**Status:** Assigned to Engine
**Area:** Watch Officer / Engine
**Decision:** TASK-0110 is assigned to Engine for local Scenario 2 playable-scene implementation.
**Reason:** TASK-0109 produced a bounded plan. The next narrow slice should add local scenario path selection in the existing greybox controller, preserve Scenario 1 default behavior, reuse orchestrator/HUD binding, and prove Scenario 2 can boot/start/step/reset locally.
**Consequences:** Engine may edit only the controller, a focused test, and the implementation report. Export, deploy, public files, hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/game-director/task-0110-engine-local-scenario-two-playable-scene-slice-2026-05-27.md`

## GD-DECISION-20260527-71 - Scenario 2 Local Playable Scene Slice Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA review
**Area:** Watch Officer / Engine
**Decision:** TASK-0110 completed the local Scenario 2 playable-scene slice.
**Reason:** The existing greybox controller can now select Scenario 2 locally while preserving Scenario 1 as default. Scenario 2 boots to deterministic ready state, starts with existing controls, queues starboard input, advances through the orchestrator, renders Scenario 2 HUD text, and resets while preserving the active local path. Required focused tests passed with 0 failed tests.
**Consequences:** The next gate is QA review of TASK-0110. Export, deploy, public files, hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/scenario-two-playable-scene-slice-report.md`

## GD-DECISION-20260527-72 - Scenario 2 Local Playable Scene Slice Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0111 is assigned to QA for the local Scenario 2 playable-scene slice review.
**Reason:** TASK-0110 passed implementation-side checks. QA should confirm Scenario 1 default preservation, local Scenario 2 path selection, start/input/step/reset behavior, display-safe HUD output, absence of public/export/deploy scope, and maintained draft/non-final boundaries.
**Consequences:** QA may run focused headless tests and write a review report. QA may not edit code, export, deploy, edit public files, or touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.
**Related files:** `docs/watch-officer/scenario-two-playable-scene-slice-report.md`

## GD-DECISION-20260527-73 - Scenario 2 Local Playable Scene QA Approved

**Date:** 2026-05-27
**Status:** Approved for next slice
**Area:** Watch Officer / QA
**Decision:** TASK-0111 approves the local Scenario 2 playable-scene slice.
**Reason:** QA confirmed Scenario 1 default path preservation, local Scenario 2 path selection without router/registry/public route work, deterministic reset, start/input/step behavior through the orchestrator, display-safe Scenario 2 HUD output, reset path persistence, and no forbidden export/deploy/public/final-claim scope. Required focused tests passed with 0 failed tests.
**Consequences:** The next task may prepare a local polish/export-decision slice for Scenario 2. Production deploy, public route/registry changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-local-scenario-two-playable-scene-slice-review.md`

## GD-DECISION-20260527-74 - Local Scenario Selector Preparation Passed

**Date:** 2026-05-27
**Status:** Passed
**Area:** Watch Officer / UX / Engine
**Decision:** TASK-0112 created the local scenario selector UX spec and TASK-0113 identified the minimal implementation point.
**Reason:** Scenario 2 is locally playable, but local export should not proceed while the prototype still boots only the Scenario 1 default for players. A selector is needed before browser/export validation.
**Consequences:** The next implementation may add a local Scenario 1 / Scenario 2 selector inside the existing Godot prototype. Public route, registry, deploy, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/scenario-selector-ux-spec.md`

## GD-DECISION-20260527-75 - Local Scenario Selector Implementation Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA review
**Area:** Watch Officer / Engine
**Decision:** TASK-0114 implemented the local scenario selector in the existing Godot greybox prototype.
**Reason:** The selector now exposes Scenario 1 and Scenario 2 locally, preserves Scenario 1 as fresh-boot default, shows draft/non-final and Region A/VTS inactive status, allows Scenario 2 selection, hides during running attempts, preserves selected path on reset, and can return to Scenario 1. Focused tests passed with 0 failed tests.
**Consequences:** The next gate is QA review. Export, deploy, public files, hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/local-scenario-selector-implementation-report.md`

## GD-DECISION-20260527-76 - Local Scenario Selector Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0115 is assigned to QA for local scenario selector review.
**Reason:** TASK-0114 passed implementation-side focused tests. QA should confirm selector behavior, Scenario 1 default preservation, Scenario 2 local selection, reset behavior, absence of public route/registry/deploy scope, and no forbidden player-facing claims.
**Consequences:** QA may run focused headless tests and write a review report. QA may not edit code, export, deploy, edit public files, or touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0115-qa-review-local-scenario-selector-2026-05-27.md`

## GD-DECISION-20260527-77 - Local Scenario Selector QA Approved

**Date:** 2026-05-27
**Status:** Approved for local export decision
**Area:** Watch Officer / QA
**Decision:** TASK-0115 approves the local Scenario 1 / Scenario 2 selector for local Web export decision.
**Reason:** QA confirmed Scenario 1 default boot, Scenario 1/Scenario 2 selector behavior, draft/non-final and Region A/VTS inactive status, Scenario 2 ready boot, selector hiding while running, reset preservation, return to Scenario 1, absence of public route/registry/hub/deploy scope, and no final/certified/legal/COLREGS-compliant claims. Required focused tests passed with 0 failed tests.
**Consequences:** The next task may run local Web export for the selector build. Production deploy, public route/registry changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-local-scenario-selector-review.md`

## GD-DECISION-20260527-78 - Local Web Export Scenario Selector Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA browser smoke
**Area:** Watch Officer / Engine
**Decision:** TASK-0116 completed the prototype-local Web export for the Scenario 1 / Scenario 2 selector build.
**Reason:** Pre-export focused tests passed with 0 failed tests and Godot Web export completed with exit code 0. Artifacts remain under the prototype `exports/web-local/` directory.
**Consequences:** The next gate is QA local browser smoke. Production deploy, public route/registry changes, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/local-web-export-scenario-selector-report.md`

## GD-DECISION-20260527-79 - Local Web Export Scenario Selector Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0117 is assigned to QA for local browser smoke of the Scenario 1 / Scenario 2 selector export.
**Reason:** TASK-0116 created the local export. QA should confirm artifact presence, local HTTP serving, browser canvas readiness, selector behavior, Scenario 1 default, Scenario 2 selection/reset, draft/non-final wording, and absence of forbidden claims before staged public candidate decision.
**Consequences:** QA may run local browser smoke and write a review report. QA may not deploy, edit public files, or touch hub route, registry, Captain Ether, Nav Desk, auth, production config, FTP, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0117-qa-local-web-export-scenario-selector-smoke-2026-05-27.md`

## GD-DECISION-20260527-80 - Local Web Export Scenario Selector QA Approved

**Date:** 2026-05-27
**Status:** Approved for staged public candidate decision
**Area:** Watch Officer / QA
**Decision:** TASK-0117 approves the local Web export smoke for the Scenario 1 / Scenario 2 selector build.
**Reason:** QA confirmed export artifacts, HTTP/MIME behavior, required COOP/COEP browser headers, non-empty Godot WebGL canvas, fresh Scenario 1 default, Scenario 2 browser selection, reset preserving Scenario 2, Scenario 1 reselect, draft/non-final and Region A/VTS inactive wording, and absence of forbidden visible claims. No blockers remain for staged public candidate decision.
**Consequences:** The next task may update the local staged public candidate under `public/play/watch-officer/`. Production deploy, FTP, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-local-web-export-scenario-selector-review.md`

## GD-DECISION-20260527-81 - Scenario Selector Staged Public Candidate Assigned

**Date:** 2026-05-27
**Status:** Assigned to Platform Local Integration
**Area:** Watch Officer / Platform
**Decision:** TASK-0118 is assigned for local staged public candidate update of the Scenario 1 / Scenario 2 selector build.
**Reason:** Local Web export and browser smoke are approved. The local staged public candidate can be updated by copying approved export artifacts into `public/play/watch-officer/` while preserving required Godot Web headers and avoiding production deploy.
**Consequences:** Local repo `public/play/watch-officer/` may be updated. Production deploy, FTP, hub route, registry, Captain Ether, Nav Desk, auth, production config, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/local-web-export-scenario-selector-report.md`

## GD-DECISION-20260527-82 - Scenario Selector Staged Public Candidate Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA staged smoke
**Area:** Watch Officer / Platform
**Decision:** TASK-0118 updated the local staged public candidate for the Scenario 1 / Scenario 2 selector build.
**Reason:** Approved local Web export artifacts were copied into `public/play/watch-officer/`, `.htaccess` with COOP/COEP and MIME rules was preserved, `.import` files are absent, artifact comparison passed, and forbidden-claim scan passed.
**Consequences:** The next gate is QA staged public candidate smoke. Production deploy, FTP, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/staged-public-scenario-selector-report.md`

## GD-DECISION-20260527-83 - Scenario Selector Staged Public Candidate Moves To QA

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0119 is assigned to QA for staged public candidate smoke of the Scenario selector build.
**Reason:** TASK-0118 passed local platform checks. QA should confirm files, headers, browser canvas, selector behavior, Scenario 1/2 flows, forbidden-claim absence, and no deploy/FTP scope.
**Consequences:** QA may run local staged browser smoke and write a report. QA may not deploy, use FTP, or touch hub route, registry, Captain Ether, Nav Desk, auth, production config, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0119-qa-staged-public-scenario-selector-smoke-2026-05-27.md`

## GD-DECISION-20260527-84 - Scenario Selector Staged Public QA Approved

**Date:** 2026-05-27
**Status:** Approved for production deploy decision
**Area:** Watch Officer / QA
**Decision:** TASK-0119 approves the staged public candidate for production deploy decision.
**Reason:** QA confirmed staged files, `.htaccess` COOP/COEP/CORP/nosniff and MIME rules, absence of `.import` files, local HTTP/header behavior, browser canvas readiness, Scenario 1 default, Scenario 2 selection, reset preservation, Scenario 1 reselect, draft/non-final and Region A/VTS inactive wording, and absence of forbidden visible claims. No blockers remain.
**Consequences:** The next task may perform controlled production deploy of `public/play/watch-officer/`. FTP/deploy must remain limited to Watch Officer staged candidate files. VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-staged-public-scenario-selector-review.md`

## GD-DECISION-20260527-85 - Scenario Selector Production Deploy Assigned

**Date:** 2026-05-27
**Status:** Assigned to Platform Deploy
**Area:** Watch Officer / Platform Deploy
**Decision:** TASK-0120 is assigned for controlled production deploy of the Scenario 1 / Scenario 2 selector build.
**Reason:** Staged public candidate passed QA. Production may be updated by uploading only the approved Watch Officer public path files and preserving Godot Web headers/MIME rules.
**Consequences:** Deploy scope is limited to `public/play/watch-officer/` production files. Captain Ether, Nav Desk, hub route, registry, auth, unrelated production config, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/qa-staged-public-scenario-selector-review.md`

## GD-DECISION-20260527-86 - Scenario Selector Production Deploy Passed

**Date:** 2026-05-27
**Status:** Passed, ready for QA production smoke
**Area:** Watch Officer / Platform Deploy
**Decision:** TASK-0120 deployed the Scenario 1 / Scenario 2 selector build to production.
**Reason:** Production upload was limited to approved Watch Officer files under `/play/watch-officer/`, remote files were backed up outside the repository, upload completed for all 10 files, production URL/header/MIME checks passed, and browser sanity confirmed a non-empty Godot canvas with selector interaction screenshots.
**Consequences:** The next gate is QA production smoke. Captain Ether, Nav Desk, hub route, registry, auth, unrelated production config, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/watch-officer/production-deploy-scenario-selector-report.md`

## GD-DECISION-20260527-87 - Scenario Selector Production Smoke Assigned

**Date:** 2026-05-27
**Status:** Assigned to QA
**Area:** Watch Officer / QA
**Decision:** TASK-0121 is assigned to QA for production smoke of the deployed Scenario selector build.
**Reason:** TASK-0120 updated production and passed deploy-side HTTP/header/browser sanity. Independent QA should verify public routes, artifacts, headers, browser canvas, selector flows, forbidden-claim absence, and Captain Ether route preservation.
**Consequences:** QA may run production smoke and write a report. QA may not deploy, use FTP, or touch hub route, registry, Captain Ether implementation, Nav Desk, auth, production config, VTS, Region B, or final maritime training claims.
**Related files:** `docs/game-director/task-0121-qa-production-smoke-scenario-selector-2026-05-27.md`

## GD-DECISION-20260527-88 - Scenario Selector Public Prototype Live

**Date:** 2026-05-27
**Status:** Approved public prototype live
**Area:** Watch Officer / QA
**Decision:** TASK-0121 approves the production Scenario 1 / Scenario 2 selector build as live public prototype.
**Reason:** QA confirmed production routes and artifacts return HTTP 200, COOP/COEP/CORP/nosniff and MIME headers are present, browser smoke loads a non-empty canvas, Scenario 1 defaults correctly, Scenario 2 is selectable, reset preserves Scenario 2, Scenario 1 reselect works, draft/non-final and Region A/VTS inactive wording is visible, forbidden final/certified/legal/COLREGS-compliant claims are absent in reviewed browser states, and Captain Ether route remains HTTP 200.
**Consequences:** Watch Officer public prototype now contains Scenario 1 and Scenario 2 selector build. Final maritime training approval, VTS, Region B, hub route changes, registry changes, Captain Ether implementation changes, Nav Desk, auth, and unrelated production config remain closed.
**Related files:** `docs/watch-officer/qa-production-scenario-selector-review.md`

## GD-DECISION-20260528-89 - Post-Recovery Sprint Control Opened

**Date:** 2026-05-28
**Status:** Assigned
**Area:** Watch Officer / Game Director
**Decision:** TASK-0122 opens the post-recovery checkpoint and next sprint control after the project crash recovery.
**Reason:** The Watch Officer mirror contained the newest director state and was aligned back into the canonical `brkovic-ltd/game.brkovic.ltd` allowed areas. A controlled checkpoint is required before assigning more product work.
**Consequences:** The next sprint may proceed only through narrow task assignments. Production deploy, FTP, hub route changes, registry changes, Captain Ether implementation, Nav Desk, auth, VTS, Region B, and final maritime training claims remain closed.
**Related files:** `docs/game-director/task-0122-post-recovery-checkpoint-and-sprint-control-2026-05-28.md`

## GD-DECISION-20260528-90 - Scenario 2 Coaching + Result Feedback Sprint Assigned

**Date:** 2026-05-28
**Status:** Assigned
**Area:** Watch Officer / UX / Engine / QA
**Decision:** The next sprint increment is Scenario 2 Coaching + Result Feedback Pack, split into TASK-0123 UX spec, TASK-0124 local Engine implementation, and TASK-0125 QA review.
**Reason:** Scenario 2 is already selectable and playable locally/publicly through the selector build. The next product value is player understanding of the same Scenario 2 drill, not new maritime scope.
**Consequences:** UX may write the spec, Engine may implement or confirm the local Godot pack with focused tests, and QA may review after the Engine report. No export, staged public candidate, production deploy, VTS expansion, Region B, or final maritime training claim is approved by this sprint assignment.
**Related files:** `docs/game-director/task-0123-ux-scenario-two-coaching-result-feedback-spec-2026-05-28.md`, `docs/game-director/task-0124-engine-scenario-two-coaching-result-feedback-pack-2026-05-28.md`, `docs/game-director/task-0125-qa-review-scenario-two-coaching-result-feedback-pack-2026-05-28.md`

## GD-DECISION-20260528-91 - Scenario 2 Coaching QA Findings Assigned To Engine

**Date:** 2026-05-28
**Status:** Assigned
**Area:** Watch Officer / Engine / QA
**Decision:** TASK-0125 returned `changes-required`, so TASK-0126 is assigned to Engine and TASK-0127 is reserved for QA rerun.
**Reason:** QA found two narrow UX acceptance gaps: Scenario 2 briefing is missing the required `Region A / VTS inactive` line, and isolated early-starboard running state is missing the `Early starboard alteration made.` cue.
**Consequences:** Engine may touch only the HUD binder, focused Scenario 2 coaching/result test, and QA fix report. No export, staged public candidate, production deploy, route/registry change, VTS expansion, Region B, or final maritime training claim is approved.
**Related files:** `docs/watch-officer/qa-scenario-two-coaching-result-feedback-review.md`, `docs/game-director/task-0126-engine-fix-scenario-two-coaching-result-feedback-qa-findings-2026-05-28.md`, `docs/game-director/task-0127-qa-rerun-scenario-two-coaching-result-feedback-fixes-2026-05-28.md`

## GD-DECISION-20260528-92 - Scenario 2 Coaching + Result Feedback Local QA Approved

**Date:** 2026-05-28
**Status:** Approved for local export decision
**Area:** Watch Officer / QA
**Decision:** TASK-0127 approves the Scenario 2 Coaching + Result Feedback Pack for local Godot prototype scope.
**Reason:** Engine resolved the two TASK-0125 findings, and QA rerun confirmed the Scenario 2 briefing now includes `Region A / VTS inactive` and isolated early-starboard running state now shows `Early starboard alteration made.` with approved chips. Focused and affected regression tests passed with 0 failed tests.
**Consequences:** The next task may decide and assign local Web export for this pack. This decision does not approve export by itself, staged public candidate, production deploy, route/registry changes, VTS expansion, Region B, or final maritime training claims.
**Related files:** `docs/watch-officer/scenario-two-coaching-result-feedback-qa-fix-report.md`, `docs/watch-officer/qa-scenario-two-coaching-result-feedback-rerun-review.md`

## GD-DECISION-20260528-93 - Scenario 2 Coaching Local Web Export Assigned

**Date:** 2026-05-28
**Status:** Assigned
**Area:** Watch Officer / Export / QA
**Decision:** TASK-0128 is assigned for prototype-local Web export of the QA-approved Scenario 2 Coaching + Result Feedback Pack, followed by TASK-0129 QA local browser smoke.
**Reason:** TASK-0127 approved the local Godot pack. The next safe gate is local Web export under the prototype export cache, not public candidate or production deploy.
**Consequences:** Engine may generate artifacts only under `game.brkovic.ltd/prototypes/watch-officer-godot/exports/web-local/`. QA may run local browser smoke after the export report. Public files, staged candidate, production deploy, route/registry changes, VTS expansion, Region B, and final maritime training claims remain closed.
**Related files:** `docs/game-director/task-0128-engine-local-web-export-scenario-two-coaching-result-feedback-2026-05-28.md`, `docs/game-director/task-0129-qa-local-web-export-smoke-scenario-two-coaching-result-feedback-2026-05-28.md`

## GD-DECISION-20260528-94 - Scenario 2 Coaching Local Web Export QA Approved

**Date:** 2026-05-28
**Status:** Approved for staged public candidate decision
**Area:** Watch Officer / Export / QA
**Decision:** TASK-0129 approves the prototype-local Web export smoke for Scenario 2 Coaching + Result Feedback Pack.
**Reason:** TASK-0128 created the local Web export, and QA confirmed expected artifacts, local HTTP/MIME/header behavior, cross-origin isolation, non-empty Godot canvas, Scenario 1 default selector behavior, Scenario 2 selection, Scenario 2 briefing `Region A / VTS inactive`, draft/non-final wording, and forbidden-claim absence. Focused headless coverage remains passing for the early-starboard cue.
**Consequences:** The next task may update a local staged public candidate under `game.brkovic.ltd/public/play/watch-officer/`. This decision does not approve production deploy, FTP, hub route or registry changes, VTS expansion, Region B, or final maritime training claims.
**Related files:** `docs/watch-officer/local-web-export-scenario-two-coaching-result-feedback-report.md`, `docs/watch-officer/qa-local-web-export-scenario-two-coaching-result-feedback-review.md`
