extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const WarningEscalationPipeline = preload("res://scripts/sim/warning_escalation_pipeline.gd")
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
	var safe_water_start: Dictionary = runtime_state["safe_water"].duplicate(true)
	var cpa_start: Dictionary = runtime_state["cpa_tcpa"].duplicate(true)
	var ownship_start: Dictionary = runtime_state["ownship"].duplicate(true)
	var target_start: Dictionary = runtime_state["target"].duplicate(true)
	var scenario_result_start = runtime_state["root"]["scenario_result"]
	var event_log_start: Array = bootstrap_result["event_log"].duplicate(true)

	var pipeline := WarningEscalationPipeline.new()

	var baseline := pipeline.build_queue(safe_water_start, cpa_start, ownship_start, target_start, 0)
	_assert_equal(baseline["primary_warning"], null, "no-warning baseline returns null primary_warning")
	_assert_equal(baseline["secondary_warnings"], [], "no-warning baseline returns empty secondary_warnings")

	var corridor_output := pipeline.build_queue(_safe_water("corridor_buffer"), cpa_start, ownship_start, target_start, 10)
	_assert_warning(corridor_output["primary_warning"], "geometry.leaving_safe_water", "warning.leaving_safe_water", "geometry", "caution", 6, "corridor buffer creates caution leaving-safe-water warning")

	var shallow_buffer_output := pipeline.build_queue(_safe_water("shallow_buffer"), cpa_start, ownship_start, target_start, 11)
	_assert_warning(shallow_buffer_output["primary_warning"], "geometry.shallow_water", "warning.shallow_water", "geometry", "caution", 5, "shallow buffer creates caution shallow-water warning")

	var shallow_output := pipeline.build_queue(_safe_water("shallow"), cpa_start, ownship_start, target_start, 12)
	_assert_warning(shallow_output["primary_warning"], "geometry.shallow_water", "warning.shallow_water", "geometry", "danger", 4, "shallow creates danger shallow-water warning")

	var grounded_output := pipeline.build_queue(_safe_water("grounded"), cpa_start, ownship_start, target_start, 13)
	_assert_warning(grounded_output["primary_warning"], "geometry.grounding", "warning.grounding", "geometry", "immediate", 3, "grounded creates immediate grounding warning")
	_assert_equal(runtime_state["root"]["scenario_result"], scenario_result_start, "grounded warning does not change scenario result")

	var cpa_inactive_caution_output := pipeline.build_queue(safe_water_start, _cpa_tcpa("caution", false), ownship_start, target_start, 14)
	_assert_equal(cpa_inactive_caution_output["primary_warning"], null, "CPA/TCPA caution inactive creates no warning")
	_assert_equal(cpa_inactive_caution_output["secondary_warnings"], [], "CPA/TCPA caution inactive leaves secondary empty")

	var previous_warnings := {
		"primary_warning": {
			"id": "cpa_tcpa.cpa_risk",
			"state": "active",
			"severity": "caution",
			"priority": 7,
			"text_key": "warning.cpa_risk",
			"source": "cpa_tcpa",
			"related_entity_id": "target_01",
			"spatial_anchor_m": null,
			"started_tick": 3,
			"updated_tick": 4,
			"cleared_tick": null,
			"debug_payload": {}
		},
		"secondary_warnings": [
			{
				"id": "cpa_tcpa.cpa_risk",
				"state": "active",
				"severity": "caution",
				"priority": 7,
				"text_key": "warning.cpa_risk",
				"source": "cpa_tcpa",
				"related_entity_id": "target_01",
				"spatial_anchor_m": null,
				"started_tick": 5,
				"updated_tick": 5,
				"cleared_tick": null,
				"debug_payload": {}
			}
		]
	}
	var cpa_caution_output := pipeline.build_queue(safe_water_start, _cpa_tcpa("caution", true), ownship_start, target_start, 15, previous_warnings)
	_assert_warning(cpa_caution_output["primary_warning"], "cpa_tcpa.cpa_risk", "warning.cpa_risk", "cpa_tcpa", "caution", 7, "CPA/TCPA caution active creates caution CPA warning")
	_assert_equal(cpa_caution_output["primary_warning"]["started_tick"], 3, "started_tick is preserved from previous active warning")
	_assert_equal(cpa_caution_output["primary_warning"]["updated_tick"], 15, "updated_tick is current tick")
	_assert_equal(cpa_caution_output["primary_warning"]["cleared_tick"], null, "active warning cleared_tick remains null")
	_assert_equal(cpa_caution_output["secondary_warnings"], [], "duplicate source warnings are deduplicated deterministically")

	var cpa_danger_geometry_output := pipeline.build_queue(_safe_water("corridor_buffer"), _cpa_tcpa("danger", true), ownship_start, target_start, 16)
	_assert_warning(cpa_danger_geometry_output["primary_warning"], "cpa_tcpa.cpa_risk", "warning.cpa_risk", "cpa_tcpa", "danger", 2, "CPA/TCPA danger outranks geometry caution")
	_assert_warning(cpa_danger_geometry_output["secondary_warnings"][0], "geometry.leaving_safe_water", "warning.leaving_safe_water", "geometry", "caution", 6, "geometry caution remains secondary behind CPA danger")
	_assert_equal(_warning_count_by_source(cpa_danger_geometry_output, "cpa_tcpa"), 1, "CPA/TCPA source warning is not duplicated")
	_assert_equal(_warning_count_by_source(cpa_danger_geometry_output, "geometry"), 1, "geometry source warning is not duplicated")

	var cpa_immediate_output := pipeline.build_queue(_safe_water("grounded"), _cpa_tcpa("immediate", true), ownship_start, target_start, 17)
	_assert_warning(cpa_immediate_output["primary_warning"], "cpa_tcpa.cpa_risk", "warning.cpa_risk", "cpa_tcpa", "immediate", 1, "CPA/TCPA immediate outranks all non-result warnings")
	_assert_warning(cpa_immediate_output["secondary_warnings"][0], "geometry.grounding", "warning.grounding", "geometry", "immediate", 3, "grounding remains secondary behind CPA immediate")

	var repeated := pipeline.build_queue(_safe_water("corridor_buffer"), _cpa_tcpa("danger", true), ownship_start, target_start, 16)
	_assert_equal(cpa_danger_geometry_output, repeated, "repeated calls with same input return same ordered warnings")

	_assert_equal(safe_water_start, runtime_state["safe_water"], "warning output does not mutate safe_water")
	_assert_equal(cpa_start, runtime_state["cpa_tcpa"], "warning output does not mutate cpa_tcpa")
	_assert_equal(ownship_start, runtime_state["ownship"], "warning output does not mutate ownship")
	_assert_equal(target_start, runtime_state["target"], "warning output does not mutate target")
	_assert_equal(runtime_state["root"]["scenario_result"], "ready", "scenario result remains ready")
	_assert_equal(bootstrap_result["event_log"], event_log_start, "no warning or result event is emitted by this slice")

	print("warning_escalation_foundation_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _safe_water(state: String) -> Dictionary:
	return {
		"state": state,
		"previous_state": "in_corridor",
		"active_zone_id": state,
		"nearest_boundary_m_debug": 4.0,
		"safe_corridor_inside": state == "in_corridor" or state == "corridor_buffer",
		"shallow_zone_inside": state == "shallow",
		"finish_gate_crossed": false
	}


func _cpa_tcpa(state: String, active: bool) -> Dictionary:
	return {
		"state": state,
		"previous_state": "safe",
		"cpa_m_debug": 30.0,
		"tcpa_sec_debug": 45.0,
		"active": active,
		"threshold_set_id": "safe-water-crossing-target:0.1.0",
		"closest_point_ownship_m": [0.0, 100.0],
		"closest_point_target_m": [15.0, 120.0],
		"changed_tick": 9,
		"bootstrap_default": false
	}


func _warning_count_by_source(warnings: Dictionary, source: String) -> int:
	var count := 0
	var primary = warnings["primary_warning"]
	if primary != null and primary["source"] == source:
		count += 1
	for warning in warnings["secondary_warnings"]:
		if warning["source"] == source:
			count += 1
	return count


func _assert_warning(warning: Dictionary, expected_id: String, expected_text_key: String, expected_source: String, expected_severity: String, expected_priority: int, label: String) -> void:
	_assert_equal(warning["id"], expected_id, "%s id" % label)
	_assert_equal(warning["state"], "active", "%s state" % label)
	_assert_equal(warning["severity"], expected_severity, "%s severity" % label)
	_assert_equal(warning["priority"], expected_priority, "%s priority" % label)
	_assert_equal(warning["text_key"], expected_text_key, "%s text_key" % label)
	_assert_equal(warning["source"], expected_source, "%s source" % label)
	_assert_equal(warning.has("related_entity_id"), true, "%s related_entity_id exists" % label)
	_assert_equal(warning.has("spatial_anchor_m"), true, "%s spatial_anchor_m exists" % label)
	_assert_equal(warning.has("started_tick"), true, "%s started_tick exists" % label)
	_assert_equal(warning.has("updated_tick"), true, "%s updated_tick exists" % label)
	_assert_equal(warning.has("cleared_tick"), true, "%s cleared_tick exists" % label)
	_assert_equal(warning.has("debug_payload"), true, "%s debug_payload exists" % label)


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
