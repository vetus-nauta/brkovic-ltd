extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const FixedTickClock = preload("res://scripts/core/fixed_tick_clock.gd")
const OwnshipKinematicIntegrator = preload("res://scripts/sim/ownship_kinematic_integrator.gd")
const TargetKinematicIntegrator = preload("res://scripts/sim/target_kinematic_integrator.gd")
const RangeBearingUpdater = preload("res://scripts/sim/range_bearing_updater.gd")
const SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var bootstrap := RuntimeBootstrap.new()
	var bootstrap_result := bootstrap.bootstrap(SCENARIO_PATH)
	_assert_equal(bootstrap.last_error, {}, "loader success required")

	var scenario := _load_scenario()
	var runtime_state: Dictionary = bootstrap_result["runtime_state"]
	var ownship_start: Dictionary = runtime_state["ownship"].duplicate(true)
	var target_start: Dictionary = runtime_state["target"].duplicate(true)
	var encounter_start: Dictionary = runtime_state["encounter"].duplicate(true)
	var cpa_start: Dictionary = runtime_state["cpa_tcpa"].duplicate(true)
	var warnings_start: Dictionary = runtime_state["warnings"].duplicate(true)
	var scenario_result_start = runtime_state["root"]["scenario_result"]

	var updater := RangeBearingUpdater.new()
	var target_geometry := updater.update_target_geometry(ownship_start, target_start)

	_assert_almost_equal(float(target_geometry["range_m"]), 300.1666, "initial target range from ownship spawn is deterministic")
	_assert_almost_equal(float(target_geometry["bearing_true_deg"]), 29.9816, "initial true bearing from ownship to target is deterministic")
	_assert_almost_equal(float(target_geometry["relative_bearing_deg"]), 29.9816, "initial relative bearing is deterministic")
	_assert_equal(target_geometry["relative_side"], "starboard", "initial relative side remains compatible with scenario crossing_from")

	var clock := FixedTickClock.new()
	clock.configure(int(runtime_state["root"]["fixed_tick_hz"]))
	var ownship_integrator := OwnshipKinematicIntegrator.new()
	var target_integrator := TargetKinematicIntegrator.new()
	var ownship := ownship_start.duplicate(true)
	var target := target_start.duplicate(true)

	for _index in range(20):
		var tick_snapshot := clock.advance_tick()
		var delta_sec := 1.0 / float(tick_snapshot["fixed_tick_hz"])
		ownship = ownship_integrator.step(ownship, scenario["ownship"], [], delta_sec)
		target = target_integrator.step(target, delta_sec)

	var ownship_before_update := ownship.duplicate(true)
	var target_before_update := target.duplicate(true)
	var moved_geometry := updater.update_target_geometry(ownship, target)

	_assert_almost_equal(float(moved_geometry["range_m"]), 295.9120, "range updates deterministically after movement samples")
	_assert_almost_equal(float(moved_geometry["bearing_true_deg"]), 29.5191, "true bearing updates deterministically after movement samples")
	_assert_almost_equal(float(moved_geometry["relative_bearing_deg"]), 29.5191, "relative bearing updates deterministically after movement samples")
	_assert_equal(moved_geometry["relative_side"], "starboard", "relative side remains deterministic after movement samples")

	_assert_equal(ownship, ownship_before_update, "ownship position is not changed by updater")
	_assert_equal(target, target_before_update, "target position is not changed by updater")
	_assert_equal(moved_geometry["position_m"], target_before_update["position_m"], "target position preserved in updated target")
	_assert_equal(moved_geometry["heading_deg"], target_before_update["heading_deg"], "target heading preserved in updated target")
	_assert_equal(moved_geometry["speed_mps"], target_before_update["speed_mps"], "target speed preserved in updated target")
	_assert_equal(moved_geometry["vector_end_position_m"], target_before_update["vector_end_position_m"], "target AIS vector preserved in updated target")

	_assert_equal(runtime_state["encounter"], encounter_start, "encounter state unchanged")
	_assert_equal(runtime_state["encounter"]["class"], "crossing", "encounter.class remains bootstrap assumption")
	_assert_equal(runtime_state["cpa_tcpa"], cpa_start, "cpa_tcpa state unchanged")
	_assert_equal(runtime_state["cpa_tcpa"]["state"], "safe", "cpa_tcpa.state remains bootstrap-only and unchanged")
	_assert_equal(runtime_state["warnings"], warnings_start, "warnings state unchanged")
	_assert_equal(runtime_state["warnings"]["primary_warning"], null, "warnings.primary_warning remains null")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "scenario_result unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario_result remains ready")

	print("range_bearing_relative_side_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _load_scenario() -> Dictionary:
	var file := FileAccess.open(SCENARIO_PATH, FileAccess.READ)
	var parser := JSON.new()
	parser.parse(file.get_as_text())
	return parser.data


func _assert_almost_equal(actual: float, expected: float, label: String) -> void:
	if abs(actual - expected) <= 0.0001:
		_pass(label)
	else:
		_fail(label, expected, actual)


func _assert_equal(actual: Variant, expected: Variant, label: String) -> void:
	if actual == expected:
		_pass(label)
	else:
		_fail(label, expected, actual)


func _pass(label: String) -> void:
	_passed += 1
	print("PASS: %s" % label)


func _fail(label: String, expected: Variant, actual: Variant) -> void:
	_failed += 1
	push_error("FAIL: %s expected=%s actual=%s" % [label, expected, actual])
