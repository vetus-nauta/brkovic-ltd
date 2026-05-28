extends RefCounted

class_name RuntimeBootstrap

const ScenarioLoader = preload("res://scripts/core/scenario_loader.gd")
const FixedTickClockScript = preload("res://scripts/core/fixed_tick_clock.gd")
const EventLogScript = preload("res://scripts/core/event_log.gd")
const RuntimeStateScript = preload("res://scripts/runtime/runtime_state.gd")
const RuntimeSnapshotExporterScript = preload("res://scripts/runtime/runtime_snapshot_exporter.gd")
const ReplayInputLogScript = preload("res://scripts/runtime/replay_input_log.gd")

const DEFAULT_SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"

var last_error := {}


func bootstrap(scenario_path := DEFAULT_SCENARIO_PATH) -> Dictionary:
	last_error = {}

	var loader := ScenarioLoader.new()
	var scenario := loader.load_scenario(scenario_path)
	if scenario.is_empty() or not loader.last_error.is_empty():
		last_error = loader.last_error.duplicate(true)
		var failed_log := EventLogScript.new()
		failed_log.configure({
			"run_id": "bootstrap-load-failed",
			"scenario_id": "",
			"scenario_version": "",
			"engine_version": RuntimeStateScript.ENGINE_VERSION,
			"seed": 0,
			"fixed_tick_hz": 0
		})
		failed_log.append_event("scenario_load_failed", last_error)
		return {
			"scenario_static": {},
			"runtime_state": {},
			"runtime_snapshot": {},
			"event_log": failed_log.get_events(),
			"replay_input_log": {},
			"loader_error": last_error
		}

	var run_id := _build_run_id(scenario)
	var clock := FixedTickClockScript.new()
	clock.configure(int(scenario["replay"]["fixed_tick_hz"]))

	var event_log := EventLogScript.new()
	event_log.configure({
		"run_id": run_id,
		"scenario_id": scenario["scenario_id"],
		"scenario_version": scenario["scenario_version"],
		"engine_version": RuntimeStateScript.ENGINE_VERSION,
		"seed": int(scenario["replay"]["seed"]),
		"fixed_tick_hz": int(scenario["replay"]["fixed_tick_hz"])
	})
	event_log.append_event("scenario_load_started", {
		"scenario_path": scenario_path
	})
	event_log.append_event("scenario_loaded", {
		"scenario_id": scenario["scenario_id"],
		"scenario_version": scenario["scenario_version"],
		"iala_region": scenario["iala_region"],
		"rule_review_status": scenario["rule_review_status"],
		"training_claim_status": scenario["training_claim_status"],
		"target_count": scenario["target_vessels"].size(),
		"mark_count": scenario["marks"].size(),
		"vts_enabled": scenario["vts"]["enabled"]
	})

	var runtime_state_builder := RuntimeStateScript.new()
	var runtime_state := runtime_state_builder.build(scenario, run_id, clock.snapshot())
	var snapshot_exporter := RuntimeSnapshotExporterScript.new()
	var runtime_snapshot := snapshot_exporter.export_snapshot(runtime_state)
	var replay_input_log := ReplayInputLogScript.new().build_empty(scenario)

	var target: Dictionary = runtime_state["target"]
	var ownship: Dictionary = runtime_state["ownship"]
	event_log.append_event("runtime_initialized", {
		"run_id": run_id,
		"seed": scenario["replay"]["seed"],
		"fixed_tick_hz": scenario["replay"]["fixed_tick_hz"],
		"ownship_spawn": ownship["position_m"].duplicate(true),
		"ownship_heading_deg": ownship["heading_deg"],
		"target_spawn": target["position_m"].duplicate(true),
		"target_heading_deg": target["heading_deg"]
	})
	event_log.append_event("snapshot_exported", {
		"tick": runtime_snapshot["tick"],
		"time_sec": runtime_snapshot["time_sec"],
		"scenario_state": runtime_snapshot["scenario_state"],
		"scenario_result": runtime_snapshot["scenario_result"]
	})
	event_log.finalize(runtime_snapshot["scenario_result"])

	return {
		"scenario_static": runtime_state["scenario_static"].duplicate(true),
		"runtime_state": runtime_state.duplicate(true),
		"runtime_snapshot": runtime_snapshot.duplicate(true),
		"event_log": event_log.get_events(),
		"replay_input_log": replay_input_log,
		"loader_error": {}
	}


func _build_run_id(scenario: Dictionary) -> String:
	return "bootstrap-%s-%s-%s" % [
		scenario["scenario_id"],
		scenario["scenario_version"],
		str(scenario["replay"]["seed"])
	]
