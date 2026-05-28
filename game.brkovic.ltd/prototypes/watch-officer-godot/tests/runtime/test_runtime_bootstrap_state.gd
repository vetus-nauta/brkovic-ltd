extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var bootstrap := RuntimeBootstrap.new()
	var result := bootstrap.bootstrap(SCENARIO_PATH)

	_assert_equal(bootstrap.last_error, {}, "loader success required before bootstrap starts")
	_assert_true(not result["scenario_static"].is_empty(), "scenario_static built")
	_assert_true(not result["runtime_snapshot"].is_empty(), "runtime_snapshot built")

	var scenario_static: Dictionary = result["scenario_static"]
	var runtime_snapshot: Dictionary = result["runtime_snapshot"]
	var event_log: Array = result["event_log"]
	var replay_input_log: Dictionary = result["replay_input_log"]

	_assert_equal(scenario_static["iala_region"], "A", "scenario_static.iala_region")
	_assert_equal(scenario_static["rule_review_status"], "draft", "scenario_static.rule_review_status")
	_assert_equal(scenario_static["training_claim_status"], "draft_not_final_training_content", "scenario_static.training_claim_status")
	_assert_equal(runtime_snapshot["tick"], 0, "runtime_snapshot.tick")
	_assert_equal(runtime_snapshot["qa"]["seed"], 1001, "runtime_snapshot.qa.seed")
	_assert_equal(runtime_snapshot["qa"]["fixed_tick_hz"], 20, "runtime_snapshot.qa.fixed_tick_hz")
	_assert_equal(runtime_snapshot["qa"]["event_timing_tolerance_ticks"], 1, "runtime_snapshot.qa.event_timing_tolerance_ticks")
	_assert_equal(runtime_snapshot["vts"]["enabled"], false, "runtime_snapshot.vts.enabled")
	_assert_equal(runtime_snapshot["vts"]["state"], "inactive", "runtime_snapshot.vts.state")
	_assert_equal(runtime_snapshot["encounter"]["class"], "crossing", "runtime_snapshot.encounter.class")
	_assert_equal(runtime_snapshot["encounter"]["player_role"], "give_way", "runtime_snapshot.encounter.player_role")
	_assert_equal(runtime_snapshot["cpa_tcpa"]["state"], "safe", "runtime_snapshot.cpa_tcpa.state bootstrap default")
	_assert_equal(runtime_snapshot["cpa_tcpa"]["bootstrap_default"], true, "runtime_snapshot.cpa_tcpa.bootstrap_default")
	_assert_equal(runtime_snapshot["warnings"]["primary_warning"], null, "runtime_snapshot.warnings.primary_warning")
	_assert_equal(runtime_snapshot["warnings"]["secondary_warnings"], [], "runtime_snapshot.warnings.secondary_warnings")
	_assert_equal(runtime_snapshot["scenario_result"], "ready", "runtime_snapshot.scenario_result")
	_assert_equal(runtime_snapshot["scenario_state"], "ready", "runtime_snapshot.scenario_state")
	_assert_equal(replay_input_log["inputs"], [], "replay input log starts empty")
	_assert_equal(replay_input_log["event_timing_tolerance_ticks"], 1, "replay input log tolerance")

	_assert_equal(_event_types(event_log), [
		"scenario_load_started",
		"scenario_loaded",
		"runtime_initialized",
		"snapshot_exported",
		"event_log_finalized"
	], "event log order is deterministic")
	_assert_equal(event_log[0]["tick"], 0, "first event tick")
	_assert_equal(event_log[0]["seed"], 1001, "event log seed")
	_assert_equal(event_log[0]["fixed_tick_hz"], 20, "event log fixed tick")
	_assert_equal(event_log[-1]["payload"]["final_result"], "ready", "event log final result")

	print("runtime_bootstrap_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _event_types(events: Array) -> Array:
	var types := []
	for event in events:
		types.append(event["type"])
	return types


func _assert_true(value: bool, label: String) -> void:
	if value:
		_pass(label)
	else:
		_fail(label, true, value)


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
