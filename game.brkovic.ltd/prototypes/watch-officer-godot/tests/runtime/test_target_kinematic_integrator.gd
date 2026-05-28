extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const FixedTickClock = preload("res://scripts/core/fixed_tick_clock.gd")
const TargetKinematicIntegrator = preload("res://scripts/sim/target_kinematic_integrator.gd")
const SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var bootstrap := RuntimeBootstrap.new()
	var bootstrap_result := bootstrap.bootstrap(SCENARIO_PATH)
	_assert_equal(bootstrap.last_error, {}, "loader success required")

	var runtime_state: Dictionary = bootstrap_result["runtime_state"]
	var ownship_start: Dictionary = runtime_state["ownship"].duplicate(true)
	var target_start: Dictionary = runtime_state["target"].duplicate(true)
	var scenario_result_start = runtime_state["root"]["scenario_result"]
	var warnings_start = runtime_state["warnings"].duplicate(true)
	var cpa_start = runtime_state["cpa_tcpa"].duplicate(true)

	_assert_point_almost_equal(target_start["position_m"], [150.0, 260.0], "target starts at scenario spawn position")
	_assert_almost_equal(float(target_start["heading_deg"]), 270.0, "target heading starts at 270")
	_assert_almost_equal(float(target_start["speed_mps"]), 4.2, "target speed starts at 4.2")
	_assert_equal(target_start["behaviour"], "constant_course_speed", "target behaviour is constant course speed")

	var clock := FixedTickClock.new()
	clock.configure(int(runtime_state["root"]["fixed_tick_hz"]))
	var integrator := TargetKinematicIntegrator.new()

	var target := target_start.duplicate(true)
	for _index in range(10):
		var tick_snapshot := clock.advance_tick()
		target = integrator.step(target, 1.0 / float(tick_snapshot["fixed_tick_hz"]))

	_assert_almost_equal(float(target["heading_deg"]), 270.0, "target heading remains 270")
	_assert_almost_equal(float(target["speed_mps"]), 4.2, "target speed remains 4.2")
	_assert_point_almost_equal(target["position_m"], [147.9, 260.0], "target position advances deterministically on heading 270")

	var vector_end: Array = target["vector_end_position_m"]
	_assert_point_almost_equal(vector_end, [-230.1, 260.0], "target AIS vector endpoint is deterministic")

	_assert_equal(runtime_state["ownship"], ownship_start, "ownship position remains unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "scenario_result unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario_result remains ready")
	_assert_equal(runtime_state["warnings"], warnings_start, "warnings state unchanged")
	_assert_equal(runtime_state["warnings"]["primary_warning"], null, "warnings.primary_warning remains null")
	_assert_equal(runtime_state["cpa_tcpa"], cpa_start, "no CPA/TCPA state change is produced")
	_assert_equal(runtime_state["cpa_tcpa"]["state"], "safe", "CPA/TCPA bootstrap state remains safe")
	_assert_equal(target["range_m"], target_start["range_m"], "range remains bootstrap default")
	_assert_equal(target["bearing_true_deg"], target_start["bearing_true_deg"], "bearing remains bootstrap default")

	print("target_kinematic_integrator_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _assert_almost_equal(actual: float, expected: float, label: String) -> void:
	if abs(actual - expected) <= 0.0001:
		_pass(label)
	else:
		_fail(label, expected, actual)


func _assert_point_almost_equal(actual: Array, expected: Array, label: String) -> void:
	if abs(float(actual[0]) - float(expected[0])) <= 0.0001 and abs(float(actual[1]) - float(expected[1])) <= 0.0001:
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
