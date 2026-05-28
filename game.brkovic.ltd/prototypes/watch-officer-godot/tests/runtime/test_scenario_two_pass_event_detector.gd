extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const EventLog = preload("res://scripts/core/event_log.gd")
const ScenarioTwoPassEventDetector = preload("res://scripts/sim/scenario_two_pass_event_detector.gd")
const SCENARIO_PATH := "res://data/scenarios/head-on-port-to-port.json"

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
	var cpa_start: Dictionary = runtime_state["cpa_tcpa"].duplicate(true)
	var warnings_start: Dictionary = runtime_state["warnings"].duplicate(true)
	var safe_water_start: Dictionary = runtime_state["safe_water"].duplicate(true)
	var scenario_result_start = runtime_state["root"]["scenario_result"]
	var detector := ScenarioTwoPassEventDetector.new()

	var early_starboard := detector.detect_early_starboard_alteration(scenario, [
		{"tick": 0, "time_sec": 0.0, "heading_deg": 0.0},
		{"tick": 120, "time_sec": 6.0, "heading_deg": 2.0},
		{"tick": 240, "time_sec": 12.0, "heading_deg": 6.0}
	])
	_assert_equal(early_starboard["detected"], true, "early starboard alteration detected")
	_assert_equal(early_starboard["status"], "detected", "early starboard status")
	_assert_equal(early_starboard["tick"], 240, "early starboard tick")
	_assert_almost_equal(float(early_starboard["time_sec"]), 12.0, "early starboard time")
	_assert_almost_equal(float(early_starboard["heading_delta_deg_debug"]), 6.0, "early starboard heading delta")
	_assert_equal(early_starboard["draft_training_logic"], true, "early starboard draft flag")

	var late_starboard := detector.detect_early_starboard_alteration(scenario, [
		{"tick": 0, "time_sec": 0.0, "heading_deg": 0.0},
		{"tick": 1300, "time_sec": 65.0, "heading_deg": 12.0}
	])
	_assert_equal(late_starboard["detected"], false, "late starboard outside window is not detected")
	_assert_equal(late_starboard["status"], "not_detected", "late starboard status")

	var port_turn := detector.detect_early_starboard_alteration(scenario, [
		{"tick": 0, "time_sec": 0.0, "heading_deg": 0.0},
		{"tick": 240, "time_sec": 12.0, "heading_deg": 354.0}
	])
	_assert_equal(port_turn["detected"], false, "port turn is not early starboard")

	var wrong_scenario := scenario.duplicate(true)
	wrong_scenario["scenario_id"] = "safe-water-crossing-target"
	var wrong_scenario_event := detector.detect_early_starboard_alteration(wrong_scenario, [
		{"tick": 240, "time_sec": 12.0, "heading_deg": 8.0}
	])
	_assert_equal(wrong_scenario_event["detected"], false, "wrong scenario id rejects early starboard event")

	var port_to_port := detector.detect_port_to_port_pass(scenario, {
		"tick": 920,
		"time_sec": 46.0,
		"pass_relationship": "port_to_port",
		"cpa_state": "safe",
		"separation_m": 96.0,
		"collision": false,
		"near_miss": false
	})
	_assert_equal(port_to_port["achieved"], true, "port-to-port pass achieved")
	_assert_equal(port_to_port["status"], "achieved", "port-to-port status")
	_assert_equal(port_to_port["pass_relationship"], "port_to_port", "port-to-port relationship")
	_assert_equal(port_to_port["cpa_state"], "safe", "port-to-port cpa state")
	_assert_almost_equal(float(port_to_port["separation_m_debug"]), 96.0, "port-to-port separation")

	var starboard_to_starboard := detector.detect_port_to_port_pass(scenario, {
		"tick": 920,
		"time_sec": 46.0,
		"pass_relationship": "starboard_to_starboard",
		"cpa_state": "safe",
		"separation_m": 96.0,
		"collision": false,
		"near_miss": false
	})
	_assert_equal(starboard_to_starboard["achieved"], false, "wrong pass relationship is rejected")
	_assert_equal(starboard_to_starboard["status"], "not_achieved", "wrong pass relationship status")

	var danger_pass := detector.detect_port_to_port_pass(scenario, {
		"tick": 920,
		"time_sec": 46.0,
		"pass_relationship": "port_to_port",
		"cpa_state": "danger",
		"separation_m": 32.0,
		"collision": false,
		"near_miss": false
	})
	_assert_equal(danger_pass["achieved"], false, "danger cpa does not achieve port-to-port pass")

	var collision_pass := detector.detect_port_to_port_pass(scenario, {
		"tick": 920,
		"time_sec": 46.0,
		"pass_relationship": "port_to_port",
		"cpa_state": "safe",
		"separation_m": 0.0,
		"collision": true,
		"near_miss": false
	})
	_assert_equal(collision_pass["achieved"], false, "collision blocks port-to-port achievement")

	var event_log := EventLog.new()
	event_log.configure({
		"run_id": runtime_state["root"]["run_id"],
		"scenario_id": scenario["scenario_id"],
		"scenario_version": scenario["scenario_version"],
		"engine_version": runtime_state["root"]["engine_version"],
		"seed": scenario["replay"]["seed"],
		"fixed_tick_hz": scenario["replay"]["fixed_tick_hz"]
	})
	var early_event := detector.append_detection_event(event_log, early_starboard)
	var pass_event := detector.append_detection_event(event_log, port_to_port)
	_assert_equal(early_event["type"], "scenario_two_early_starboard_alteration_detected", "early event type")
	_assert_equal(pass_event["type"], "scenario_two_port_to_port_pass_achieved", "pass event type")
	_assert_equal(early_event["payload"]["detected"], true, "early event payload detected")
	_assert_equal(pass_event["payload"]["achieved"], true, "pass event payload achieved")
	_assert_equal(event_log.get_event_types(), [
		"scenario_two_early_starboard_alteration_detected",
		"scenario_two_port_to_port_pass_achieved"
	], "event order is deterministic")

	_assert_equal(runtime_state["cpa_tcpa"], cpa_start, "CPA/TCPA state remains unchanged")
	_assert_equal(runtime_state["warnings"], warnings_start, "warnings remain unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "scenario result unchanged")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario result remains ready")
	_assert_equal(runtime_state["safe_water"], safe_water_start, "no safe-water geometry state change is produced")

	print("scenario_two_pass_event_detector_test: %s passed, %s failed" % [_passed, _failed])
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
