# Tests

Scenario loader test harness has started.

Current test:

```text
scenario_loader/test_safe_water_crossing_target.gd
```

Run when Godot is available:

```bash
godot --headless --path game.brkovic.ltd/prototypes/watch-officer-godot --script res://tests/scenario_loader/test_safe_water_crossing_target.gd
```

The test validates scenario loading, `iala_region: "A"` rejection rules, VTS-disabled scenario 1 constraints, deterministic replay metadata, qualitative CPA/TCPA state, and event timing tolerance of +/- 1 fixed tick.
