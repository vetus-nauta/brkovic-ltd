extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const RuntimeStepOrchestrator = preload("res://scripts/runtime/runtime_step_orchestrator.gd")
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
	var bootstrap_snapshot: Dictionary = bootstrap_result["runtime_snapshot"]

	_assert_equal(runtime_state.has("scenario_two"), true, "runtime state has scenario_two branch")
	_assert_equal(bootstrap_snapshot.has("scenario_two"), true, "bootstrap snapshot has scenario_two branch")
	_assert_equal(bootstrap_snapshot["scenario_two"]["draft_training_logic"], true, "bootstrap scenario_two draft flag")
	_assert_equal(bootstrap_snapshot["qa"].has("scenario_two_debug"), true, "bootstrap snapshot has qa scenario_two_debug")

	var orchestrator := RuntimeStepOrchestrator.new()
	var result: Dictionary = orchestrator.step(scenario, runtime_state, [], {
		"scenario_two_heading_samples": [
			{"tick": 0, "time_sec": 0.0, "heading_deg": 0.0},
			{"tick": 240, "time_sec": 12.0, "heading_deg": 6.0}
		],
		"scenario_two_pass_sample": {
			"tick": 920,
			"time_sec": 46.0,
			"pass_relationship": "port_to_port",
			"cpa_state": "safe",
			"separation_m": 96.0,
			"collision": false,
			"near_miss": false
		}
	})

	var stepped_state: Dictionary = result["runtime_state"]
	var snapshot: Dictionary = result["runtime_snapshot"]
	var scenario_two: Dictionary = stepped_state["scenario_two"]

	_assert_equal(result["update_order"], _expected_update_order(), "scenario two update order is deterministic")
	_assert_equal(stepped_state["encounter"]["class"], "head_on", "encounter class routed to scenario two classifier")
	_assert_equal(stepped_state["encounter"]["player_role"], "head_on_alter_starboard", "player role routed to scenario two classifier")
	_assert_equal(scenario_two["classifier_status"], "matched", "scenario_two classifier status")
	_assert_equal(scenario_two["early_starboard_status"], "detected", "scenario_two early starboard detected")
	_assert_equal(scenario_two["early_starboard_detected"], true, "scenario_two early starboard bool")
	_assert_equal(scenario_two["port_to_port_status"], "achieved", "scenario_two port-to-port achieved")
	_assert_equal(scenario_two["port_to_port_achieved"], true, "scenario_two port-to-port bool")
	_assert_equal(scenario_two["pass_relationship"], "port_to_port", "scenario_two pass relationship")
	_assert_equal(scenario_two["last_event_types"], [
		"scenario_two_early_starboard_alteration_detected",
		"scenario_two_port_to_port_pass_achieved"
	], "scenario_two event types are deterministic")

	_assert_equal(snapshot.has("scenario_two"), true, "snapshot exports scenario_two branch")
	_assert_equal(snapshot["scenario_two"]["classifier_status"], "matched", "snapshot scenario_two classifier status")
	_assert_equal(snapshot["scenario_two"]["early_starboard_status"], "detected", "snapshot early starboard status")
	_assert_equal(snapshot["scenario_two"]["port_to_port_status"], "achieved", "snapshot port-to-port status")
	_assert_equal(snapshot["scenario_two"].has("debug"), false, "display snapshot excludes scenario_two debug object")
	_assert_equal(snapshot["qa"].has("scenario_two_debug"), true, "qa snapshot includes scenario_two debug object")
	_assert_almost_equal(float(snapshot["qa"]["scenario_two_debug"]["heading_delta_deg"]), 6.0, "qa debug heading delta")
	_assert_almost_equal(float(snapshot["qa"]["scenario_two_debug"]["separation_m"]), 96.0, "qa debug separation")
	_assert_equal(snapshot["vts"]["enabled"], false, "VTS remains disabled")
	_assert_equal(snapshot["vts"]["state"], "inactive", "VTS remains inactive")

	var no_flags_result: Dictionary = orchestrator.step(scenario, runtime_state, [])
	_assert_equal(no_flags_result["runtime_state"]["scenario_two"]["early_starboard_status"], "not_detected", "no flags does not invent early starboard")
	_assert_equal(no_flags_result["runtime_state"]["scenario_two"]["port_to_port_status"], "not_achieved", "no flags does not invent port-to-port")

	print("scenario_two_runtime_state_export_orchestrator_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _expected_update_order() -> Array:
	return [
		"apply_tick_inputs",
		"ownship_kinematic_integrator",
		"target_kinematic_integrator",
		"range_bearing_relative_side_updater",
		"scenario_two_head_on_classifier",
		"cpa_tcpa_numeric_debug_solver",
		"scenario_two_early_starboard_detector",
		"scenario_two_port_to_port_pass_detector",
		"safe_water_geometry_monitor",
		"warning_escalation_pipeline",
		"scenario_result_evaluator",
		"runtime_snapshot_exporter"
	]


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
