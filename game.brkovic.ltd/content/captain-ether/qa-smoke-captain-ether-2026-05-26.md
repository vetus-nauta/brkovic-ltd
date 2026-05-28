# Captain Ether QA Smoke Report

Date: 2026-05-26  
Environment: production  
URL: https://game.brkovic.ltd/games/captain-ether  
Mode: QA only, no application code changes.

## Context Read

- `content/captain-ether/captain-ether-handoff-2026-05-26.md`
- `content/captain-ether/answer-policy.md`
- `content/captain-ether/accept-reject-qa-pairs.json`
- `content/captain-ether/answer-log-policy.md`

## Summary

| Block | Result | Notes |
| --- | --- | --- |
| Entry/login | PASS | Deep link opened login; email login completed; post-login route stayed `/games/captain-ether`, not hub. Login codes/secrets were not printed in the report. |
| Beginner watch | PASS | Beginner watch completed with 12 questions. Question order confirmed as `word -> short_expression -> phrase`. |
| Mobile HUD | PASS | 390x844 viewport: question is visible as the main element, compact/static header, hidden profile email in game state, horizontal overflow `0`. |
| Matcher | PASS | Required cases and sampled dangerous minimal pairs passed on production matcher paths. |
| Lost Oars | FAIL | Core behavior works, but successful correction does not immediately remove the card from the visible list. |
| Answer log | PASS | Disputed answer logged, clean exact answer did not increase log count, no email found in entry, unauthenticated endpoint returned `401`. |

## Entry/Login

Result: PASS  
Owner: Platform  

Checks:

- Opened deep link `/games/captain-ether`.
- Login form was shown on the Captain Ether route.
- Email login completed.
- After login, UI stayed at `/games/captain-ether`.
- Captain Ether level select was visible.
- Hub screen was not shown after login.
- Login codes and secrets were not included in this report.

## Beginner Watch

Result: PASS  
Owner: Captain Ether core / UX-HUD  

Checks:

- Started beginner watch.
- Completed 12 questions.
- Confirmed progressive item order: `word -> short_expression -> phrase`.
- Summary screen appeared after question 12.

## Mobile HUD

Result: PASS  
Owner: UX-HUD  

Viewport: 390x844

Observed:

- Horizontal overflow: `0`.
- Header position: `static`.
- Header is compact.
- Question prompt is visible near the top and acts as the main visual anchor.
- Profile email is hidden during game state.

## Matcher

Result: PASS  
Owner: Captain Ether core / Sea Speak Linguist  

Required cases:

| Item | Answer | Expected | Observed |
| --- | --- | --- | --- |
| `word_starboard_001` | `starbord` | correct / spelling | PASS, `match_type=spelling`; standard form `starboard` visible in UI |
| `phrase_require_assistance_001` | `i need help` | correct | PASS |
| `phrase_eta_001` | `1500Z` | wrong | PASS, `match_type=wrong` |
| `phrase_securite_001` | `security security security` | wrong | PASS, `match_type=wrong` |

Sampled dangerous minimal pairs:

| Pair | Item | Answer | Result |
| --- | --- | --- | --- |
| port / starboard | `word_port_001` | `starboard` | PASS, wrong |
| stern / astern | `word_stern_001` | `astern` | PASS, wrong |
| over / out | `expr_over_001` | `out` | PASS, wrong |
| roger / affirmative | `expr_roger_001` | `affirmative` | PASS, wrong |
| channel 72 / channel 71 | `expr_switch_channel_001` | `channel 71` | PASS, wrong |
| 090 / 90 | `phrase_my_heading_001` | `90 degrees` | PASS, wrong |
| 1400 / 1500 | `phrase_eta_001` | `1500Z` | PASS, wrong |
| Securite / security | `phrase_securite_001` | `security security security` | PASS, wrong |

Note: Some intermediate items did not appear through repeated `start-watch` attempts because current account state and selection behavior affected the pool. The targeted matcher checks above were run against the production matcher path through `resolve-lost-oar.php` using explicit `item_id` values.

## Lost Oars

Result: FAIL  
Owner: UX-HUD  
Severity: Medium  

What passed:

- Wrong answer was added to Lost Oars.
- Lost Oars screen did not show raw `wrong`.
- Correct revision resolved the item in backend state.
- After reopening Lost Oars, the item was gone.

Bug:

Successful correction resolves the item, but the visible Lost Oars card remains on screen immediately after clicking `Проверить`. It becomes faded/disabled and disappears only after reopening Lost Oars.

Reproduction:

1. Login and open Captain Ether.
2. Start a beginner watch.
3. Submit a wrong answer.
4. Open Lost Oars from the hub.
5. Enter the standard correct answer and click `Проверить`.
6. Observe that the card remains visible until the Lost Oars screen is reopened.

Expected:

- The item should be removed from the visible list immediately after successful correction.

## Answer Log

Result: PASS  
Owner: Platform / Captain Ether core  

Checks:

- Disputed answer appeared in `/api/captain-ether/answer-log.php?limit=20`.
- `1500Z` for `phrase_eta_001` appeared as `log_kind=wrong`.
- Clean exact answer did not increase `total_logged`.
- Entry includes `player_hash`.
- No email-like value was found in the logged entry.
- Unauthenticated request to the endpoint returned `401`.

## Bugs Found

| Severity | Owner | Title |
| --- | --- | --- |
| Medium | UX-HUD | Lost Oars resolved card remains visible until reopening the screen. |
| Medium | Captain Ether core | Some intermediate items may be hard to reach through `start-watch` under current account state and selection behavior. |

## Routing

- Captain Ether core: review intermediate watch item reachability under weak-point/account-state conditions.
- UX-HUD: fix immediate removal of resolved Lost Oars cards.
- Sea Speak Linguist: no linguistic issue found in this smoke.
- Platform: no auth/answer-log privacy issue found in this smoke.
