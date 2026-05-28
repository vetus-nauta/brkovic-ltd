# Captain Ether Answer Policy

Date: 2026-05-26

## Pedagogical Rule

Minor spelling, punctuation, and small grammar slips must not turn a clearly correct Sea Speak answer into a wrong answer.

When the player gives the right phrase with a small typo, the game should:

- count the answer as correct;
- avoid creating a Lost Oar;
- show the standard spelling or standard phrase as a reminder;
- keep the tone calm and instructional.

## Matching Rule

The answer checker should evaluate answers in this order:

1. Exact accepted answer.
2. Accepted Sea Speak variant or synonym.
3. Small spelling/typing slip close to an accepted answer.
4. Wrong answer.

Synonyms and accepted variants belong in `accepted_answers` and the Captain Ether answer matcher. The synonym list should grow deliberately through the Sea Speak linguist role described in `sea-speak-linguist-brief.md`, not through random permissive matching.

The typo layer must stay conservative for maritime meaning. It must not fuzz numeric tokens, channel numbers, headings, ETA digits, or short nautical terms where one missing letter can change the concept.

`accept-reject-qa-pairs.json` is the regression source for this rule. Every `should_accept` answer should pass, every `should_reject` answer should fail, and dangerous minimal pairs must be checked whenever matcher logic changes.

## Batch 001 Strictness Decisions

Radio procedure batch items must keep marker and procedure-word boundaries:

- message-marker phrase drills require the explicit marker: `Question`, `Request`, or `Answer`;
- plain forms without the marker must stay wrong for those drills;
- message-marker nouns must not accept verb-form lookalikes through typo matching, for example `advice` must not accept `advise`;
- `wait`, `stand by`, `wait out`, `do not answer`, `resume communication`, and `go ahead` are separate procedure concepts;
- station calls keep called-station-first order; forms like `Aurora to Marina Control` stay wrong.

Spelling and number drills are strict:

- `figures` is not `numbers` or `digits`;
- `decimal` is not `point` or `dot`;
- `niner` is not ordinary `nine`;
- official spelling alphabet `Alfa` is not ordinary `Alpha`.

The batch-001 dangerous pairs are:

- `over / out`;
- `say again / repeat`;
- `roger / affirmative / correct`;
- `affirmative / negative`;
- `read back / say again`;
- `channel 12 / channel 13 / channel 16`;
- `1500 / 1400`;
- `Alfa / Alpha`;
- `advice / advise`.

## Batch 002 Strictness Decisions

Marina and harbour batch items must keep routine harbour terms item-specific:

- `berth` must not accept `birth` through typo matching;
- `fender` / `fenders` must not accept `finder` / `finders` through typo matching;
- `dock`, `quay`, `pier`, and `slip` remain wrong for Batch 002 berth drills;
- `line` remains the trained term in mooring-line drills; `rope` stays wrong;
- `fender` remains the trained term; `bumper` stays wrong;
- `port side to` and `starboard side to` are opposite berthing instructions and must not collapse to left/right or each other;
- `stand by outside`, `wait out`, and `do not answer` stay separate;
- `proceed`, `enter`, `approach`, and radio `go ahead` stay item-specific;
- compact berth identifiers such as `B12` stay wrong until alphanumeric berth matching is intentionally designed and regression-tested.

Water-service variants can be item-local only:

- `request water` and `request fresh water` can be accepted for routine water-service items;
- water, fuel, and shore power must not substitute for each other.

The batch-002 dangerous pairs are:

- `berth / birth`;
- `berth / dock / quay / pier / slip`;
- `moor / berth / anchor`;
- `line / rope`;
- `fender / finder`;
- `fender / bumper`;
- `port side to / starboard side to`;
- `ahead / astern / alongside / abeam`;
- `stand by outside / wait out / do not answer`;
- `proceed / enter / approach / go ahead`;
- `request berth / need a berth`;
- `water / fuel / shore power`;
- `arrival / departure`.

## Watch Length And Order

First playable watches should be short enough to finish without fatigue:

- beginner: 12 questions;
- intermediate: 16 questions;
- advanced: 20 questions.

Each watch must progress from shorter units to longer ones:

1. words;
2. short expressions;
3. longer phrases.

The goal is a feeling of a rising radio watch, not a shuffled exam deck.
