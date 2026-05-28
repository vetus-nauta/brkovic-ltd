# Captain Ether Branch Taxonomy

Date: 2026-05-26

## Purpose

Captain Ether should grow as a branching training corpus, not as one long linear course.

The long-term `1000+` item goal means:

```text
one corpus -> many playable branches -> short watches
```

It does not mean one huge advanced level.

## Branches

### core_radio

Basic radio procedure and Sea Speak control language.

Includes:

- procedure words;
- station calls;
- acknowledgements;
- message markers;
- readback;
- correction;
- repetition;
- spelling and numbers.

First batch:

```text
content/captain-ether/batches/batch-001-radio-procedure.json
```

### marina_harbour

Marina, harbour, berth, service, and arrival/departure communication.

Includes:

- berth requests;
- fuel berth;
- water;
- shore power;
- approach instructions;
- departure clearance;
- mooring and anchoring.

### navigation_reports

Position and movement reports.

Includes:

- position;
- heading;
- course;
- bearing;
- speed;
- ETA;
- distance;
- reporting points.

### traffic_collision

Traffic information and collision-avoidance intentions.

Includes:

- passing arrangements;
- overtaking;
- crossing;
- CPA/TCPA language;
- risk of collision;
- keep clear;
- alter course;
- reduce speed.

### safety_securite

Safety messages and warnings.

Includes:

- Securite;
- navigation warnings;
- restricted visibility;
- weather and sea state;
- hazards;
- lights and sound signals.

### urgency_panpan

Urgency communication where immediate assistance may be needed, but distress is not declared.

Includes:

- Pan-Pan;
- engine failure;
- steering failure;
- disabled vessel;
- medical assistance;
- towing requests;
- non-distress equipment failures.

### distress_mayday

Distress communication.

Includes:

- Mayday;
- flooding;
- fire;
- collision;
- grounding;
- sinking;
- man overboard;
- abandon ship;
- SAR relay.

### onboard_operations

On-board and bridge-team communication.

Includes:

- watch handover;
- helm orders;
- anchor handling;
- mooring stations;
- safety checks;
- emergency actions aboard.

### vts_port_control

VTS, port control, pilot, tug, and traffic authority communication.

Includes:

- reporting points;
- VTS instructions;
- traffic information;
- pilot request;
- tug assistance;
- port entry/departure.

### review_minimal_pairs

High-risk contrast drills.

Includes:

- port / starboard;
- stern / astern;
- over / out;
- roger / affirmative;
- channel 72 / 71;
- 090 / 90;
- 1400 / 1500;
- Securite / security.

## Future Schema

Current playable items already have:

- `level`;
- `type`;
- `topic`.

Future batch items should also include these draft fields:

```json
{
  "branch": "core_radio",
  "module": "readback_correction"
}
```

Do not require the runtime to use these fields yet. They are for content organization first.

When enough branch data exists, Captain Ether Core can add branch-aware watch selection:

```text
Mixed watch
Core Radio
Marina / Harbour
Navigation Reports
Traffic / Collision
Safety
Urgency
Distress
Onboard
VTS / Port Control
Review Minimal Pairs
```

## Rule

Branches must stay playable as short watches.

The player should never see a branch as a giant list. The game should draw small watches from a large corpus.
