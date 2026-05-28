# Scripts

Scenario loader validation has started.

Current implementation:

```text
core/scenario_loader.gd
```

This loader validates scenario data before runtime. It does not spawn vessels, create scenes, run movement, calculate CPA/TCPA, render UI, or make final maritime training claims.

Future scripts should keep Engine ownership clear: fixed tick simulation, movement, encounter classification, CPA/TCPA state, warnings, result state, and replay/logging belong to Engine. UI should consume exported state only.
