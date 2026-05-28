# Branch Selector UX Readiness Card

Date: 2026-05-27
Task: TASK-CE-OFFICE-UX-0001
Role: UX/HUD Designer
Mode: report-only

## Status

NEEDS DIRECTOR DECISION before any public branch/module selector is exposed.

This card does not design final UI. It defines player-facing readiness gates,
likely states, UX risks, mobile constraints, and QA checks for a future
branch/module selection surface.

## Inputs Reviewed

- `docs/game-director/mandatory-chat-operating-rules.md`
- `docs/game-director/chat-reporting-rules.md`
- `content/captain-ether/role-command-protocol.md`
- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/roles/README.md`
- `content/captain-ether/roles/office-manifest.md`
- `content/captain-ether/roles/ux-hud-designer/rules.md`
- `content/captain-ether/roles/ux-hud-designer/handoff.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/roles/director-engineer/reports/beta-1-1-start-watch-branch-filter-contract-2026-05-27.md`

## Public Exposure Gates

A public branch selector should stay hidden until all of these are true:

- The Beta 1.0 default remains the universal mixed watch with no required new
  fields.
- Branch-focused API behavior has passed QA re-review and Director-Engineer
  acceptance.
- Publicly listed branches meet the branch exposure floor from the current
  contract: at least `60` total items, `24` beginner-eligible items, `32`
  beginner+intermediate eligible items, `40` advanced-eligible items, `6`
  words, `10` short expressions, `20` phrases, `3` modules with regression
  coverage, complete `branch` and `module` metadata, and branch-specific smoke
  passing for beginner, intermediate, and advanced.
- Unavailable branch/level combinations are hidden before request time.
- Underfilled branches do not silently fall back to mixed watch.
- Focused module mode remains hidden until module thresholds, wording, empty
  states, and QA smoke are separately approved.
- The selector does not expose internal branch/module metadata in question
  payloads unless a later payload decision explicitly allows it.
- Existing watch lengths stay unchanged: beginner `12`, intermediate `16`,
  advanced `20`.
- Final selected watch order still feels like a rising radio watch:
  `word -> short_expression -> phrase`.
- Branch-specific dangerous minimal pairs and answer-policy protections pass
  regression before player exposure.

## Likely Player States

Future UX must account for these states before implementation starts:

- Default mixed watch: current public entry path, no branch decision required.
- Eligible focused branch: player can choose a branch that is safe at the
  selected level and starts a normal-length watch.
- Branch unavailable for selected level: branch is not shown or is visibly
  unavailable before starting; no failed watch-start surprise.
- Branch available at higher levels only: beginner player should not see the
  choice as a broken or locked promise.
- Returning player with weak items: focused branch should explain neither
  quotas nor internals, but review items may still appear in the watch.
- Branch pool temporarily underfilled after content edits: selector must fail
  closed by hiding that option, not by starting a mixed watch that looks
  mislabeled.
- Module-specific practice: hidden for now; if later exposed, module selection
  needs its own readiness card because it is more catalog-like and more prone
  to shallow repetition.
- Error state: controlled, calm, no debug text, no raw filter values, no player
  identity, and no implication that the player did something wrong.

## Course-Catalog Risk

The main UX risk is making Captain Ether feel like a course catalog instead of
a short radio watch.

Risk signals:

- too many visible branch names before the content can support them;
- nested branch/module lists shown before the player starts training;
- disabled options outnumber playable options;
- labels read like curriculum taxonomy rather than radio situations;
- the player must make several administrative choices before hearing the next
  prompt;
- branch choice appears to replace the mixed watch instead of complementing it;
- shallow branches cause repeated prompts and make the system feel small.

Recommended guardrails for a future UI task:

- Keep mixed watch as the primary path.
- Expose only Director-approved branches that can safely fill the selected
  level.
- Prefer a small number of high-confidence choices over showing the whole
  taxonomy.
- Avoid module browsing in public UI until modules are content-rich.
- Avoid progress copy that promises certification, formal course completion, or
  final maritime competence.
- Keep wording situational and watch-like rather than syllabus-like.

## Mobile Concerns

Mobile selector work should be treated as a first-class gate, not a shrink-down
of desktop.

Required mobile constraints:

- No sticky-heavy header during watch start.
- No horizontal overflow at common mobile widths.
- Branch options must fit without truncating safety-critical words.
- Touch targets must remain comfortable when the player is signed in and the
  profile/header area is present.
- The question-first watch layout must not be pushed below the fold after a
  branch is selected.
- The selector must not add persistent chrome that competes with the current
  question, answer field, or feedback.
- Error/unavailable states must fit in one small calm block and not expose raw
  technical strings.
- If branch choice is placed near level choice, the order must remain clear:
  choose level, optionally choose focus, start watch.

## QA Checks Needed

Before public selector approval, QA should cover at least:

- Mixed default still starts without new fields and preserves response shape.
- Mixed mode remains the public default after fresh load, returning session,
  mobile viewport, and desktop viewport.
- Public selector lists only Director-approved branches for the chosen level.
- Hidden/unavailable branches cannot be started from the UI.
- Branch/level option visibility matches the API fixture matrix.
- No selector copy exposes raw `branch`, `module`, QA notes, accepted answers,
  player email, user id, player hash, session, CSRF, or debug fields.
- Focused branch start produces a normal watch length and progressive order.
- Review/weak items can appear without confusing or punitive wording.
- Underfilled branch response is handled without creating a watch session,
  changing progress, creating Lost Oars, or creating answer-log entries.
- Submit, finish, summary, Lost Oars, and answer-log behavior remain compatible
  after a focused branch watch.
- Dangerous minimal pairs pass for branch samples, especially numbers,
  channels, signals, direction, time, and procedure words.
- Mobile smoke checks at narrow width confirm no horizontal overflow, no
  clipped branch labels, no oversized header, and visible first prompt after
  starting a watch.
- Service worker/cache behavior is checked only if a later UI task changes
  public assets.

## UX Recommendation

Do not expose a public branch/module selector in the next implementation slice.

The next safe UX step is internal branch-filter QA and Director acceptance. A
later UX task can design a minimal public selector only after the content pools,
API behavior, QA matrix, and exposure thresholds are accepted. The selector
should be an optional focus control around the existing mixed watch, not a
course-browser replacement.

## Copy-Ready Handoff

Director-Engineer can treat this as a report-only UX readiness card.

Recommended next owner: Director Ether / Director-Engineer to decide whether
QA should re-review the branch-filter contract before any implementation task.

No UI design is approved by this report. No runtime/API/content changes are
requested from UX/HUD Designer.

## Scope Preserved

- runtime/API not changed.
- UI not changed.
- content data not changed.
- `starter.json` not changed.
- batches not changed.
- matcher not changed.
- router/registry not changed.
- auth/platform not changed.
- Watch Officer not changed.
- Nav Desk not changed.
- Game Director docs not changed.
- production config not changed.
- deploy/FTP state not touched.
- secrets and private config not touched.

## Checks

Tests: not run; documentation-only task.
