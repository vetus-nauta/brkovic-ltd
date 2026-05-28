# Maritime Audit: Scenario 2 Head-On Port-to-Port Drill

**Task:** `TASK-0094`  
**Owner Chat:** `CHAT-MARITIME-RULES-001 / Maritime Rules Auditor`  
**Date:** `2026-05-27`  
**Scenario:** `Head-On Port-to-Port Drill`  
**Report status:** `approved-for-ui-engine-planning`  
**Scope:** Documentation audit only. No code, scenario data, schema, scenes, assets, public files, production files, deploy, FTP, Captain Ether, Nav Desk, router/registry, auth, production config, VTS, Region B, or final maritime training claims changed.

## Source Documents Reviewed

- `game.brkovic.ltd/docs/game-director/mandatory-chat-operating-rules.md`
- `game.brkovic.ltd/docs/game-director/chat-reporting-rules.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/README.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/rules.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/onboarding.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/handoff.md`
- `game.brkovic.ltd/docs/roles/maritime-rules-auditor/first-brief.md`
- `game.brkovic.ltd/docs/watch-officer/scenario-two-head-on-port-to-port-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/mvp-maritime-rules-report.md`
- `game.brkovic.ltd/docs/watch-officer/qa-validation-mvp-report.md`
- `game.brkovic.ltd/docs/game-director/watch-officer-scenario-one-production-prototype-status-2026-05-27.md`

## Audit Decision

Scenario 2 may proceed to UI/HUD and Engine planning as a narrow MVP drill if it remains a draft, scenario-specific practice exercise for one ownship motor yacht and one power-driven target on reciprocal or nearly reciprocal courses in day, calm, good-visibility conditions.

This audit does not approve final maritime training content. It approves only planning boundaries for a prototype scenario whose runtime and player-facing text must preserve draft/non-final limitations.

## Required Boundaries

This scenario and this audit are:

- not legal advice;
- not navigation instruction;
- not final maritime training;
- not official or certified;
- not complete COLREGS / MPPSS coverage;
- not complete IALA / MAMS coverage;
- limited to IALA Region A project scope;
- out of scope for VTS unless separately assigned.

## Rule-Scope Finding

The proposed `head_on` / port-to-port concept is suitable as draft scenario wording because it is restricted to a controlled traffic geometry and does not claim to teach every head-on case. The pack correctly avoids VTS, radar, night, restricted visibility, multiple traffic vessels, special vessel statuses, Region B, traffic separation schemes, sound signals, and full narrow-channel rules.

The scenario should remain a recognition-and-action drill, not a legal rule-number lesson. UI and Engine planning may use `head_on` as a scenario class, but player-facing copy should describe a `head-on risk` or `head-on practice scenario`, not a universal determination that every similar real-world situation has the same rule outcome.

## Required Planning Constraints

| Area | Audit position |
| --- | --- |
| Narrow MVP suitability | Approved for planning if limited to one ownship, one power-driven target, deterministic target motion, day/calm/good visibility, and open water or a very broad simple channel. |
| `head_on` / port-to-port wording | Acceptable as draft scenario wording. Must remain scenario-specific and visibly non-final. |
| Nearly reciprocal threshold | Must be a scenario-local classifier/debug parameter. Do not present any angle threshold as universal law or final COLREGS interpretation. |
| Early starboard alteration | Acceptable as scenario guidance if phrased as the recommended action in this drill, not as all-case navigation instruction. |
| Port alteration severity | Should be severity-graded by timing, distance, CPA trend, and recoverability. Close-range worsening port alteration may be critical; earlier recoverable port alteration may be serious or moderate depending on outcome. |
| Speed reduction recovery | May count as supporting or partial recovery only when it improves CPA/risk state. It should not replace the expected clear starboard alteration for clean success in this scenario. |
| Simple channel geometry | Allowed only if broad and simple enough that the lesson remains head-on recognition. Avoid cues that accidentally teach narrow-channel rules. |
| CPA/pass-distance values | Must remain scenario-local training and QA/debug thresholds. Player UI should use qualitative states unless a separate task approves numeric display. |
| `rule_review_status` | May remain `draft` for implementation planning if `training_claim_status` and visible copy clearly mark non-final training content. `approved` requires named human maritime expert sign-off. |

## Wording Constraints

Preferred draft wording:

- `Head-on risk. Alter starboard early.`
- `Recommended action in this scenario: early starboard alteration and port-to-port pass.`
- `Draft training scenario - not final maritime instruction.`
- `Scenario-specific practice threshold.`
- `CPA caution. Increase separation.`
- `Port alteration increased risk in this scenario.`

Forbidden or unsafe wording before expert approval:

- `official`;
- `certified`;
- `COLREGS compliant`;
- `legally correct`;
- `safe to navigate`;
- `correct in all head-on cases`;
- `universal head-on threshold`;
- `approved maritime training`;
- `this is the required manoeuvre in real navigation`;
- `port alteration is always critical`;
- `speed reduction alone satisfies the head-on rule`;
- `VTS instruction` for this scenario.

Wording to soften:

- Replace `must alter starboard` with `recommended action in this scenario is early starboard alteration`.
- Replace `wrong manoeuvre` with `risk-increasing manoeuvre in this scenario` unless a collision/near-miss state is logged.
- Replace `failed watch` with `unsafe manoeuvre recorded` or `needs correction`.
- Replace `safe CPA` with `CPA state recovered in this scenario` unless values and thresholds are explicitly described as scenario-local.

## Algorithm Boundary Notes

Engine may classify `head_on` from scenario-defined geometry and thresholds, but the classifier must be documented as a deterministic prototype approximation. It must not be described as a maritime authority.

The implementation should distinguish:

- initial expected class from scenario data;
- runtime encounter classification;
- CPA qualitative state;
- pass relationship, such as port-to-port achieved;
- timing of the first clear starboard alteration;
- whether a port alteration worsened CPA/risk state;
- terminal outcomes such as collision, near miss, grounding, or finish success.

UI/HUD must render Engine-owned state only. It must not compute maritime classification, severity, or outcome independently.

## Simple Channel Risk

A simple channel may be used only as a visual or safe-water boundary if it is broad enough that an early starboard alteration is feasible and does not teach narrow-channel law by implication.

Do not add narrow-channel claims, sound-signal teaching, meeting-in-channel doctrine, traffic separation, bank effects, constrained-by-draft assumptions, or VTS/radio negotiation to Scenario 2 without a separate task and maritime review.

## Expert-Review Questions Before Final Training Approval

These questions must remain open until answered by a qualified human maritime expert:

- What scenario-local `nearly reciprocal` threshold should be used for the MVP classifier?
- How should the scenario handle a target slightly off the bow where doubt exists?
- What minimum heading alteration counts as clear and substantial enough for this drill?
- What player-facing wording best expresses early starboard alteration without sounding like legal instruction?
- How should port alteration severity be graded at far, moderate, and close ranges with improving or worsening CPA?
- Can speed reduction alone ever earn partial recovery, and under what CPA/distance conditions?
- What CPA/pass-distance thresholds are acceptable for this scenario as training/debug values?
- If a simple channel is used, what geometry keeps the lesson from becoming narrow-channel training?
- Who is the named maritime reviewer allowed to change `rule_review_status` from `draft` to `approved`?
- Which final result labels are acceptable for learner feedback after expert review?

## Implementation Handoff

UI/HUD and Engine planning may begin from this decision pack only under the following conditions:

- keep `rule_review_status: "draft"` unless expert approval is separately recorded;
- keep visible draft/non-final training wording in briefing, active attempt, result, and QA/debug surfaces;
- keep thresholds scenario-local and hidden from player mode unless separately approved;
- keep VTS out of Scenario 2;
- keep IALA Region A as the only project region;
- keep Region B out of scenario data and UI;
- keep the drill one-ownship/one-target only;
- keep all player-facing copy non-official and non-certified.

## Report For Game Director

Scenario 2 is approved for UI/HUD and Engine planning as a narrow draft MVP head-on drill. The decision pack does not require blocking changes before planning, but implementation must preserve the wording constraints, scenario-local threshold treatment, severity grading, and open expert-review questions listed in this audit.
