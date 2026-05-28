extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const RuntimeStepOrchestrator = preload("res://scripts/runtime/runtime_step_orchestrator.gd")
const OwnshipKinematicIntegrator = preload("res://scripts/sim/ownship_kinematic_integrator.gd")
const TargetKinematicIntegrator = preload("res://scripts/sim/target_kinematic_integrator.gd")
const RangeBearingUpdater = preload("res://scripts/sim/range_bearing_updater.gd")
const ScenarioOneEncounterClassifier = preload("res://scripts/sim/scenario_one_encounter_classifier.gd")
const CpaTcpaDebugSolver = preload("res://scripts/sim/cpa_tcpa_debug_solver.gd")
const SafeWaterGeometryMonitor = preload("res://scripts/sim/safe_water_geometry_monitor.gd")
const WarningEscalationPipeline = preload("res://scripts/sim/warning_escalation_pipeline.gd")
const ScenarioResultEvaluator = preload("res://scripts/sim/scenario_result_evaluator.gd")
const RuntimeSnapshotExporter = preload("res://scripts/runtime/runtime_snapshot_exporter.gd")
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
	var scenario_before: Dictionary = scenario.duplicate(true)
	var runtime_before: Dictionary = runtime_state.duplicate(true)
	var input_records: Array = []
	var input_records_before: Array = input_records.duplicate(true)

	var orchestrator := RuntimeStepOrchestrator.new()
	var result: Dictionary = orchestrator.step(scenario, runtime_state, input_records)
	var repeated: Dictionary = orchestrator.step(scenario, runtime_state, input_records)

	var stepped_state: Dictionary = result["runtime_state"]
	var snapshot: Dictionary = result["runtime_snapshot"]
	var expected: Dictionary = _expected_step(scenario, runtime_before, input_records)

	_assert_equal(stepped_state["root"]["tick"], 1, "orchestrator advances exactly one tick")
	_assert_almost_equal(float(stepped_state["root"]["time_sec"]), 0.05, "orchestrator advances exactly one fixed tick time")
	_assert_equal(result["update_order"], _expected_update_order(), "update order is deterministic and QA-readable")
	_assert_equal(snapshot["tick"], 1, "snapshot tick advances")
	_assert_almost_equal(float(snapshot["time_sec"]), 0.05, "snapshot time advances")

	_assert_equal(stepped_state["ownship"], expected["runtime_state"]["ownship"], "ownship update matches existing integrator")
	_assert_equal(stepped_state["target"], expected["runtime_state"]["target"], "target/range/bearing update matches existing modules")
	_assert_equal(stepped_state["encounter"], expected["runtime_state"]["encounter"], "encounter update matches scenario-1 classifier")
	_assert_equal(stepped_state["cpa_tcpa"], expected["runtime_state"]["cpa_tcpa"], "CPA/TCPA is produced only from existing debug solver")
	_assert_equal(stepped_state["safe_water"], expected["runtime_state"]["safe_water"], "safe-water state is produced only from existing geometry monitor")
	_assert_equal(stepped_state["warnings"], expected["runtime_state"]["warnings"], "warnings are produced only from existing warning pipeline")
	_assert_equal(result["scenario_result"], expected["scenario_result"], "result is produced only from existing result evaluator")
	_assert_equal(snapshot, expected["runtime_snapshot"], "runtime snapshot matches existing exporter output")
	_assert_equal(result["applied_input_records"], [], "empty input list is accepted and applies no records")

	_assert_snapshot_shape(snapshot, "no-input baseline produces complete snapshot")
	_assert_equal(snapshot["vts"]["enabled"], false, "VTS remains disabled")
	_assert_equal(snapshot["vts"]["state"], "inactive", "VTS remains inactive")
	_assert_equal(snapshot["qa"]["seed"], 1001, "snapshot keeps QA seed")
	_assert_equal(snapshot["qa"]["fixed_tick_hz"], 20, "snapshot keeps fixed tick hz")
	_assert_equal(snapshot["qa"]["event_timing_tolerance_ticks"], 1, "snapshot keeps QA tick tolerance")
	_assert_equal(stepped_state["scenario_static"]["iala_region"], "A", "scenario 1 IALA Region A assumption preserved")
	_assert_equal(scenario["vts"]["enabled"], false, "scenario 1 VTS disabled assumption preserved")
	_assert_equal(scenario["target_vessels"].size(), 1, "scenario 1 one target assumption preserved")
	_assert_equal(scenario["target_vessels"][0]["crossing_from"], "starboard", "scenario 1 target from starboard assumption preserved")
	_assert_equal(_is_non_terminal(str(stepped_state["root"]["scenario_result"])), true, "result remains non-terminal for baseline first step")
	_assert_equal(stepped_state["root"]["scenario_result"], "running", "baseline first step result is running")

	_assert_equal(repeated["runtime_snapshot"], snapshot, "repeated calls from same initial state and inputs produce same snapshot")
	_assert_equal(repeated["runtime_state"], stepped_state, "repeated calls from same initial state and inputs produce same runtime state")
	_assert_equal(scenario, scenario_before, "source scenario data is not mutated")
	_assert_equal(input_records, input_records_before, "source input records are not mutated")
	_assert_equal(runtime_state, runtime_before, "source runtime state is not mutated")

	var speed_input_records := [
		{
			"tick": 1,
			"time_sec": 0.05,
			"input_type": "speed_set",
			"input_value": "fast",
			"input_source": "qa_test"
		}
	]
	var speed_input_before: Array = speed_input_records.duplicate(true)
	var speed_result: Dictionary = orchestrator.step(scenario, runtime_state, speed_input_records)
	_assert_equal(speed_result["applied_input_records"], speed_input_records, "tick-indexed input records for the advanced tick are accepted")
	_assert_equal(speed_result["runtime_state"]["ownship"]["speed_level"], "fast", "queued input is applied by existing ownship integrator")
	_assert_equal(speed_input_records, speed_input_before, "non-empty source input records are not mutated")

	print("runtime_step_orchestrator_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _expected_step(scenario: Dictionary, runtime_state: Dictionary, input_records: Array) -> Dictionary:
	var next_state: Dictionary = runtime_state.duplicate(true)
	var tick := 1
	var delta_sec := 1.0 / float(next_state["root"]["fixed_tick_hz"])
	var tick_inputs := []
	for record in input_records:
		if int(record.get("tick", -1)) == tick:
			tick_inputs.append(record.duplicate(true))

	next_state["ownship"] = OwnshipKinematicIntegrator.new().step(next_state["ownship"], scenario["ownship"], tick_inputs, delta_sec)
	next_state["target"] = TargetKinematicIntegrator.new().step(next_state["target"], delta_sec)
	next_state["target"] = RangeBearingUpdater.new().update_target_geometry(next_state["ownship"], next_state["target"])
	next_state["encounter"] = ScenarioOneEncounterClassifier.new().classify(scenario, next_state["target"])
	next_state["cpa_tcpa"] = CpaTcpaDebugSolver.new().solve(scenario, next_state["ownship"], next_state["target"], next_state["cpa_tcpa"])
	next_state["safe_water"] = SafeWaterGeometryMonitor.new().evaluate(scenario, next_state["ownship"], next_state["safe_water"])
	next_state["warnings"] = WarningEscalationPipeline.new().build_queue(next_state["safe_water"], next_state["cpa_tcpa"], next_state["ownship"], next_state["target"], tick, next_state["warnings"])
	var scenario_result: Dictionary = ScenarioResultEvaluator.new().evaluate(next_state["safe_water"], next_state["cpa_tcpa"], next_state["warnings"], {}, "running", tick)

	next_state["scenario_result_detail"] = scenario_result.duplicate(true)
	next_state["root"]["tick"] = tick
	next_state["root"]["time_sec"] = float(tick) / float(next_state["root"]["fixed_tick_hz"])
	next_state["root"]["scenario_state"] = "running"
	next_state["root"]["scenario_result"] = scenario_result["state"]

	return {
		"runtime_state": next_state,
		"runtime_snapshot": RuntimeSnapshotExporter.new().export_snapshot(next_state),
		"scenario_result": scenario_result
	}


func _expected_update_order() -> Array:
	return [
		"apply_tick_inputs",
		"ownship_kinematic_integrator",
		"target_kinematic_integrator",
		"range_bearing_relative_side_updater",
		"scenario_one_encounter_classifier",
		"cpa_tcpa_numeric_debug_solver",
		"safe_water_geometry_monitor",
		"warning_escalation_pipeline",
		"scenario_result_evaluator",
		"runtime_snapshot_exporter"
	]


func _assert_snapshot_shape(snapshot: Dictionary, label: String) -> void:
	_assert_equal(snapshot.has("ownship"), true, "%s ownship" % label)
	_assert_equal(snapshot.has("target"), true, "%s target" % label)
	_assert_equal(snapshot.has("encounter"), true, "%s encounter" % label)
	_assert_equal(snapshot.has("cpa_tcpa"), true, "%s cpa_tcpa" % label)
	_assert_equal(snapshot.has("safe_water"), true, "%s safe_water" % label)
	_assert_equal(snapshot.has("warnings"), true, "%s warnings" % label)
	_assert_equal(snapshot.has("scenario_result"), true, "%s scenario_result" % label)
	_assert_equal(snapshot.has("vts"), true, "%s vts" % label)
	_assert_equal(snapshot.has("qa"), true, "%s qa" % label)


func _is_non_terminal(state: String) -> bool:
	return not ["success", "warning_outcome", "near_miss", "grounding", "collision"].has(state)


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
