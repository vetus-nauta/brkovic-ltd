extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const FixedTickClock = preload("res://scripts/core/fixed_tick_clock.gd")
const ReplayInputLog = preload("res://scripts/runtime/replay_input_log.gd")
const SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var bootstrap := RuntimeBootstrap.new()
	var bootstrap_result := bootstrap.bootstrap(SCENARIO_PATH)
	_assert_equal(bootstrap.last_error, {}, "loader success required")

	var snapshot_before: Dictionary = bootstrap_result["runtime_snapshot"].duplicate(true)
	var ownship_position_before = snapshot_before["ownship"]["position_m"].duplicate(true)
	var target_position_before = snapshot_before["target"]["position_m"].duplicate(true)

	var clock := FixedTickClock.new()
	clock.configure(int(snapshot_before["qa"]["fixed_tick_hz"]))

	_assert_equal(clock.tick, 0, "fixed tick starts at 0")
	_assert_equal(clock.fixed_tick_hz, 20, "fixed_tick_hz == 20")
	_assert_equal(clock.time_sec, 0.0, "time_sec starts at 0")

	var tick_one := clock.advance_tick()
	_assert_equal(tick_one["tick"], 1, "advancing one tick sets tick == 1")
	_assert_almost_equal(tick_one["time_sec"], 0.05, "time_sec == 0.05 after one tick at 20 Hz")

	var later_ticks := clock.advance_ticks(4)
	_assert_equal(clock.tick, 5, "multiple advances reach deterministic tick")
	_assert_almost_equal(clock.time_sec, 0.25, "multiple advances reach deterministic time")
	_assert_equal(later_ticks.map(func(item): return item["tick"]), [2, 3, 4, 5], "multiple advance tick sequence")
	_assert_equal(_rounded_times(later_ticks), [0.1, 0.15, 0.2, 0.25], "multiple advance time sequence")

	var replay_log := ReplayInputLog.new()
	replay_log.configure_from_log(bootstrap_result["replay_input_log"])
	_assert_equal(replay_log.get_log()["seed"], 1001, "replay input log keeps seed == 1001")
	_assert_equal(replay_log.get_log()["event_timing_tolerance_ticks"], 1, "replay input log keeps tolerance == 1")

	replay_log.append_input(1, 0.05, "turn_port_pressed", true, "headless_test")
	replay_log.append_input(1, 0.05, "speed_up", "cruise", "headless_test")
	replay_log.append_input(5, 0.25, "turn_port_released", false, "headless_test")

	var inputs := replay_log.get_inputs()
	_assert_equal(inputs.size(), 3, "input records appended")
	_assert_equal(inputs[0].keys(), ["tick", "time_sec", "input_type", "input_value", "input_source"], "input record fields")
	_assert_equal(inputs[0]["tick"], 1, "input record tick")
	_assert_almost_equal(inputs[0]["time_sec"], 0.05, "input record time_sec")
	_assert_equal(inputs[0]["input_type"], "turn_port_pressed", "input record input_type")
	_assert_equal(inputs[0]["input_value"], true, "input record input_value")
	_assert_equal(inputs[0]["input_source"], "headless_test", "input record input_source")
	_assert_equal(replay_log.get_inputs_for_tick(1).map(func(item): return item["input_type"]), ["turn_port_pressed", "speed_up"], "same-tick input order preserved")
	_assert_equal(replay_log.get_inputs_for_tick(5).map(func(item): return item["input_type"]), ["turn_port_released"], "later tick input readable")

	var snapshot_after: Dictionary = bootstrap_result["runtime_snapshot"]
	_assert_equal(snapshot_after["ownship"]["position_m"], ownship_position_before, "no ownship position changes in this slice")
	_assert_equal(snapshot_after["target"]["position_m"], target_position_before, "no target position changes in this slice")

	var second_clock := FixedTickClock.new()
	second_clock.configure(20)
	second_clock.advance_ticks(5)
	_assert_equal(second_clock.snapshot(), clock.snapshot(), "fixed tick advancement deterministic across clocks")

	print("fixed_tick_input_log_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _rounded_times(items: Array) -> Array:
	var times := []
	for item in items:
		times.append(snapped(float(item["time_sec"]), 0.0001))
	return times


func _assert_almost_equal(actual: float, expected: float, label: String) -> void:
	if abs(actual - expected) <= 0.00001:
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
