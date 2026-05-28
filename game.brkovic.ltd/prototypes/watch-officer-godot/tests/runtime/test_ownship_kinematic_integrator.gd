extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const FixedTickClock = preload("res://scripts/core/fixed_tick_clock.gd")
const ReplayInputLog = preload("res://scripts/runtime/replay_input_log.gd")
const OwnshipKinematicIntegrator = preload("res://scripts/sim/ownship_kinematic_integrator.gd")
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
	var ownship_config: Dictionary = _load_scenario()["ownship"]
	var ownship_start: Dictionary = runtime_state["ownship"].duplicate(true)
	var target_start: Dictionary = runtime_state["target"].duplicate(true)
	var scenario_result_start = runtime_state["root"]["scenario_result"]
	var warnings_start = runtime_state["warnings"].duplicate(true)
	var cpa_start = runtime_state["cpa_tcpa"].duplicate(true)

	_assert_point_almost_equal(ownship_start["position_m"], [0.0, 0.0], "ownship starts at scenario spawn position")

	var clock := FixedTickClock.new()
	clock.configure(int(runtime_state["root"]["fixed_tick_hz"]))
	var integrator := OwnshipKinematicIntegrator.new()

	var ownship := ownship_start.duplicate(true)
	for _index in range(4):
		var tick_snapshot := clock.advance_tick()
		ownship = integrator.step(ownship, ownship_config, [], 1.0 / float(tick_snapshot["fixed_tick_hz"]))

	_assert_almost_equal(float(ownship["heading_deg"]), 0.0, "no turn keeps heading 0")
	_assert_almost_equal(float(ownship["position_m"][0]), 0.0, "straight movement keeps x")
	_assert_almost_equal(float(ownship["position_m"][1]), 0.5, "straight movement advances on heading 0")

	var replay_log := ReplayInputLog.new()
	replay_log.configure_from_log(bootstrap_result["replay_input_log"])
	var turn_tick := clock.advance_tick()
	replay_log.append_input(turn_tick["tick"], turn_tick["time_sec"], "turn_port_pressed", true, "headless_test")
	ownship = integrator.step(ownship, ownship_config, replay_log.get_inputs_for_tick(turn_tick["tick"]), 1.0 / float(turn_tick["fixed_tick_hz"]))
	_assert_almost_equal(float(ownship["heading_deg"]), 359.6, "turn_port_pressed changes heading deterministically")
	_assert_equal(ownship["turn_state"], "port", "turn_port_pressed sets turn state")

	var release_tick := clock.advance_tick()
	replay_log.append_input(release_tick["tick"], release_tick["time_sec"], "turn_released", false, "headless_test")
	ownship = integrator.step(ownship, ownship_config, replay_log.get_inputs_for_tick(release_tick["tick"]), 1.0 / float(release_tick["fixed_tick_hz"]))
	_assert_almost_equal(float(ownship["heading_deg"]), 359.6, "turn_released stops heading change")
	_assert_equal(ownship["turn_state"], "none", "turn_released clears turn state")

	var speed_tick := clock.advance_tick()
	replay_log.append_input(speed_tick["tick"], speed_tick["time_sec"], "speed_set", "cruise", "headless_test")
	ownship = integrator.step(ownship, ownship_config, replay_log.get_inputs_for_tick(speed_tick["tick"]), 1.0 / float(speed_tick["fixed_tick_hz"]))
	_assert_equal(ownship["speed_level"], "cruise", "speed_set changes speed level deterministically")
	_assert_almost_equal(float(ownship["speed_mps"]), 5.0, "speed_set changes ownship speed")
	_assert_equal(ownship["recent_track_m"].size(), ownship_start["recent_track_m"].size() + 7, "ownship recent track grows with movement samples")

	_assert_equal(runtime_state["target"], target_start, "target position remains unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "scenario_result remains ready")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario_result remains ready value")
	_assert_equal(runtime_state["warnings"], warnings_start, "warnings state unchanged")
	_assert_equal(runtime_state["warnings"]["primary_warning"], null, "warnings.primary_warning remains null")
	_assert_equal(runtime_state["cpa_tcpa"], cpa_start, "no CPA/TCPA state change is produced")
	_assert_equal(runtime_state["cpa_tcpa"]["state"], "safe", "CPA/TCPA bootstrap state remains safe")

	print("ownship_kinematic_integrator_test: %s passed, %s failed" % [_passed, _failed])
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
