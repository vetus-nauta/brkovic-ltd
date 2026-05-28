extends RefCounted

class_name RuntimeStepOrchestrator

const OwnshipKinematicIntegrator = preload("res://scripts/sim/ownship_kinematic_integrator.gd")
const TargetKinematicIntegrator = preload("res://scripts/sim/target_kinematic_integrator.gd")
const RangeBearingUpdater = preload("res://scripts/sim/range_bearing_updater.gd")
const ScenarioOneEncounterClassifier = preload("res://scripts/sim/scenario_one_encounter_classifier.gd")
const ScenarioTwoHeadOnClassifier = preload("res://scripts/sim/scenario_two_head_on_classifier.gd")
const ScenarioTwoPassEventDetector = preload("res://scripts/sim/scenario_two_pass_event_detector.gd")
const CpaTcpaDebugSolver = preload("res://scripts/sim/cpa_tcpa_debug_solver.gd")
const SafeWaterGeometryMonitor = preload("res://scripts/sim/safe_water_geometry_monitor.gd")
const WarningEscalationPipeline = preload("res://scripts/sim/warning_escalation_pipeline.gd")
const ScenarioResultEvaluator = preload("res://scripts/sim/scenario_result_evaluator.gd")
const RuntimeSnapshotExporter = preload("res://scripts/runtime/runtime_snapshot_exporter.gd")

const SCENARIO_TWO_ID := "head-on-port-to-port"

const UPDATE_ORDER_SCENARIO_ONE := [
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

const UPDATE_ORDER_SCENARIO_TWO := [
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


func step(scenario: Dictionary, runtime_state: Dictionary, input_records: Array = [], external_flags: Dictionary = {}) -> Dictionary:
	var scenario_data: Dictionary = scenario.duplicate(true)
	var next_state: Dictionary = runtime_state.duplicate(true)
	var inputs: Array = input_records.duplicate(true)
	var flags: Dictionary = external_flags.duplicate(true)

	var root: Dictionary = next_state["root"]
	var next_tick: int = int(root["tick"]) + 1
	var fixed_tick_hz: int = int(root["fixed_tick_hz"])
	var delta_sec: float = 1.0 / float(fixed_tick_hz)
	var next_time_sec: float = float(next_tick) / float(fixed_tick_hz)
	var tick_inputs: Array = _inputs_for_tick(inputs, next_tick)

	var ownship_integrator := OwnshipKinematicIntegrator.new()
	var target_integrator := TargetKinematicIntegrator.new()
	var range_bearing_updater := RangeBearingUpdater.new()
	var encounter_classifier := ScenarioOneEncounterClassifier.new()
	var scenario_two_classifier := ScenarioTwoHeadOnClassifier.new()
	var scenario_two_detector := ScenarioTwoPassEventDetector.new()
	var cpa_solver := CpaTcpaDebugSolver.new()
	var safe_water_monitor := SafeWaterGeometryMonitor.new()
	var warning_pipeline := WarningEscalationPipeline.new()
	var result_evaluator := ScenarioResultEvaluator.new()
	var snapshot_exporter := RuntimeSnapshotExporter.new()

	next_state["ownship"] = ownship_integrator.step(next_state["ownship"], scenario_data["ownship"], tick_inputs, delta_sec)
	next_state["target"] = target_integrator.step(next_state["target"], delta_sec)
	next_state["target"] = range_bearing_updater.update_target_geometry(next_state["ownship"], next_state["target"])
	if scenario_data["scenario_id"] == SCENARIO_TWO_ID:
		next_state["encounter"] = scenario_two_classifier.classify(scenario_data, next_state["ownship"], next_state["target"])
	else:
		next_state["encounter"] = encounter_classifier.classify(scenario_data, next_state["target"])
	next_state["cpa_tcpa"] = cpa_solver.solve(scenario_data, next_state["ownship"], next_state["target"], next_state["cpa_tcpa"])
	if scenario_data["scenario_id"] == SCENARIO_TWO_ID:
		next_state["scenario_two"] = _update_scenario_two_state(scenario_data, runtime_state, next_state, flags, scenario_two_detector, next_tick, next_time_sec)
	next_state["safe_water"] = safe_water_monitor.evaluate(scenario_data, next_state["ownship"], next_state["safe_water"])
	next_state["warnings"] = warning_pipeline.build_queue(next_state["safe_water"], next_state["cpa_tcpa"], next_state["ownship"], next_state["target"], next_tick, next_state["warnings"])

	var previous_result: Variant = next_state.get("scenario_result_detail", next_state["root"]["scenario_result"])
	if previous_result is String and previous_result == "ready":
		previous_result = "running"
	var result: Dictionary = result_evaluator.evaluate(next_state["safe_water"], next_state["cpa_tcpa"], next_state["warnings"], flags, previous_result, next_tick)

	next_state["scenario_result_detail"] = result.duplicate(true)
	next_state["root"]["tick"] = next_tick
	next_state["root"]["time_sec"] = next_time_sec
	next_state["root"]["scenario_state"] = "complete" if _is_terminal_result(result["state"]) else "running"
	next_state["root"]["scenario_result"] = result["state"]

	var snapshot: Dictionary = snapshot_exporter.export_snapshot(next_state)

	return {
		"runtime_state": next_state,
		"runtime_snapshot": snapshot,
		"scenario_result": result,
		"applied_input_records": tick_inputs,
		"update_order": _update_order_for_scenario(scenario_data["scenario_id"])
	}


func _inputs_for_tick(input_records: Array, tick: int) -> Array:
	var selected: Array = []
	for record in input_records:
		if int(record.get("tick", -1)) == tick:
			selected.append(record.duplicate(true))
	return selected


func _is_terminal_result(state: String) -> bool:
	return ["success", "warning_outcome", "near_miss", "grounding", "collision"].has(state)


func _update_scenario_two_state(scenario: Dictionary, previous_state: Dictionary, next_state: Dictionary, flags: Dictionary, detector: RefCounted, tick: int, time_sec: float) -> Dictionary:
	var scenario_two: Dictionary = next_state.get("scenario_two", {}).duplicate(true)
	var heading_samples: Array = flags.get("scenario_two_heading_samples", _heading_samples_for_step(previous_state, next_state, tick, time_sec))
	var pass_sample: Dictionary = flags.get("scenario_two_pass_sample", {})
	var early_starboard: Dictionary = detector.detect_early_starboard_alteration(scenario, heading_samples)
	var port_to_port: Dictionary = detector.detect_port_to_port_pass(scenario, pass_sample)
	var last_event_types: Array = []
	if early_starboard.get("detected", false):
		last_event_types.append(early_starboard["event_type"])
	if port_to_port.get("achieved", false):
		last_event_types.append(port_to_port["event_type"])

	scenario_two["encounter_class"] = next_state["encounter"]["class"]
	scenario_two["player_role"] = next_state["encounter"]["player_role"]
	scenario_two["initial_match"] = next_state["encounter"]["initial_match"]
	scenario_two["classifier_status"] = "matched" if next_state["encounter"]["initial_match"] else "not_matched"
	scenario_two["early_starboard_status"] = early_starboard["status"]
	scenario_two["early_starboard_detected"] = early_starboard["detected"]
	scenario_two["early_starboard_tick"] = early_starboard["tick"]
	scenario_two["early_starboard_time_sec"] = early_starboard["time_sec"]
	scenario_two["port_to_port_status"] = port_to_port["status"]
	scenario_two["port_to_port_achieved"] = port_to_port["achieved"]
	scenario_two["pass_relationship"] = port_to_port["pass_relationship"]
	scenario_two["draft_training_logic"] = true
	scenario_two["last_event_types"] = last_event_types
	scenario_two["changed_tick"] = tick
	scenario_two["debug"] = {
		"relative_heading_deg": next_state["encounter"].get("relative_heading_deg_debug", 0.0),
		"reciprocal_error_deg": next_state["encounter"].get("reciprocal_error_deg_debug", 0.0),
		"bearing_ahead_delta_deg": next_state["encounter"].get("bearing_ahead_delta_deg_debug", 0.0),
		"heading_delta_deg": early_starboard.get("heading_delta_deg_debug", 0.0),
		"separation_m": port_to_port.get("separation_m_debug", 0.0)
	}
	return scenario_two


func _heading_samples_for_step(previous_state: Dictionary, next_state: Dictionary, tick: int, time_sec: float) -> Array:
	var fixed_tick_hz: int = int(next_state["root"]["fixed_tick_hz"])
	var previous_tick: int = tick - 1
	return [
		{
			"tick": previous_tick,
			"time_sec": float(previous_tick) / float(fixed_tick_hz),
			"heading_deg": previous_state["ownship"]["heading_deg"]
		},
		{
			"tick": tick,
			"time_sec": time_sec,
			"heading_deg": next_state["ownship"]["heading_deg"]
		}
	]


func _update_order_for_scenario(scenario_id: String) -> Array:
	if scenario_id == SCENARIO_TWO_ID:
		return UPDATE_ORDER_SCENARIO_TWO.duplicate(true)
	return UPDATE_ORDER_SCENARIO_ONE.duplicate(true)
