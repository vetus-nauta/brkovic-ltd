extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const ScenarioResultEvaluator = preload("res://scripts/sim/scenario_result_evaluator.gd")
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
	var warnings_start: Dictionary = runtime_state["warnings"].duplicate(true)
	var ownship_start: Dictionary = runtime_state["ownship"].duplicate(true)
	var target_start: Dictionary = runtime_state["target"].duplicate(true)
	var event_log_start: Array = bootstrap_result["event_log"].duplicate(true)

	var evaluator := ScenarioResultEvaluator.new()

	var baseline := evaluator.evaluate(safe_water_start, cpa_start, warnings_start, {}, "running", 10)
	_assert_result(baseline, "running", "running", 10, "awaiting_finish_gate", "baseline running state remains non-terminal before finish gate")
	_assert_equal(baseline["active_warning_ids"], [], "baseline active_warning_ids empty")

	var success := evaluator.evaluate(_safe_water("in_corridor", true), _cpa_tcpa("safe", false), _warnings([]), {}, "running", 20)
	_assert_result(success, "success", "running", 20, "finish_gate_safe", "finish gate crossed with safe state returns success")

	var caution_warning := _warning("geometry.leaving_safe_water", "caution")
	var warning_outcome := evaluator.evaluate(_safe_water("corridor_buffer", true), _cpa_tcpa("safe", false), _warnings([caution_warning]), {}, "running", 21)
	_assert_result(warning_outcome, "warning_outcome", "running", 21, "finish_gate_caution_warnings", "finish gate crossed with caution warning returns warning_outcome")
	_assert_equal(warning_outcome["active_warning_ids"], ["geometry.leaving_safe_water"], "warning_outcome records active caution warning id")

	var danger_cpa_warning := _warning("cpa_tcpa.cpa_risk", "danger")
	var danger_finish := evaluator.evaluate(_safe_water("in_corridor", true), _cpa_tcpa("danger", true), _warnings([danger_cpa_warning]), {}, "running", 22)
	_assert_equal(danger_finish["state"] != "success", true, "finish gate crossed with danger CPA warning does not return success")
	_assert_result(danger_finish, "warning_outcome", "running", 22, "finish_gate_serious_warning", "danger CPA warning maps to warning_outcome in this slice")

	var near_miss := evaluator.evaluate(safe_water_start, _cpa_tcpa("immediate", true), warnings_start, {}, "running", 23)
	_assert_result(near_miss, "near_miss", "running", 23, "active_cpa_tcpa_immediate", "active CPA/TCPA immediate returns near_miss")

	var grounding := evaluator.evaluate(_safe_water("grounded", false), cpa_start, warnings_start, {}, "running", 24)
	_assert_result(grounding, "grounding", "running", 24, "safe_water_grounded", "grounded safe-water state returns grounding")

	var collision := evaluator.evaluate(safe_water_start, cpa_start, warnings_start, {"collision_detected": true}, "running", 25)
	_assert_result(collision, "collision", "running", 25, "collision_flag", "explicit collision flag returns collision")

	var sticky_success := evaluator.evaluate(_safe_water("in_corridor", false), _cpa_tcpa("immediate", true), warnings_start, {"collision_detected": true}, success, 30)
	_assert_result(sticky_success, "success", "success", 20, "terminal_state_sticky", "success terminal state is sticky")
	var sticky_warning := evaluator.evaluate(_safe_water("in_corridor", false), cpa_start, warnings_start, {}, warning_outcome, 31)
	_assert_result(sticky_warning, "warning_outcome", "warning_outcome", 21, "terminal_state_sticky", "warning_outcome terminal state is sticky")
	var sticky_near_miss := evaluator.evaluate(_safe_water("in_corridor", true), cpa_start, warnings_start, {}, near_miss, 32)
	_assert_result(sticky_near_miss, "near_miss", "near_miss", 23, "terminal_state_sticky", "near_miss terminal state is sticky")
	var sticky_grounding := evaluator.evaluate(_safe_water("in_corridor", true), cpa_start, warnings_start, {}, grounding, 33)
	_assert_result(sticky_grounding, "grounding", "grounding", 24, "terminal_state_sticky", "grounding terminal state is sticky")
	var sticky_collision := evaluator.evaluate(_safe_water("in_corridor", true), cpa_start, warnings_start, {}, collision, 34)
	_assert_result(sticky_collision, "collision", "collision", 25, "terminal_state_sticky", "collision terminal state is sticky")

	_assert_result_shape(success, "result output includes required fields")
	_assert_equal(success["debug_payload"]["finish_gate_crossed"], true, "debug_payload records finish gate flag")
	_assert_equal(collision["debug_payload"]["collision_detected"], true, "debug_payload records collision flag")

	_assert_equal(runtime_state["safe_water"], safe_water_start, "evaluator does not mutate safe_water")
	_assert_equal(runtime_state["cpa_tcpa"], cpa_start, "evaluator does not mutate cpa_tcpa")
	_assert_equal(runtime_state["warnings"], warnings_start, "evaluator does not mutate warnings")
	_assert_equal(runtime_state["ownship"], ownship_start, "evaluator does not mutate ownship")
	_assert_equal(runtime_state["target"], target_start, "evaluator does not mutate target")
	_assert_equal(bootstrap_result["event_log"], event_log_start, "no event semantics are opened in this slice")

	print("scenario_result_evaluator_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _safe_water(state: String, finish_gate_crossed: bool) -> Dictionary:
	return {
		"state": state,
		"previous_state": "in_corridor",
		"active_zone_id": state,
		"nearest_boundary_m_debug": 0.0,
		"safe_corridor_inside": state == "in_corridor" or state == "corridor_buffer",
		"shallow_zone_inside": state == "shallow",
		"finish_gate_crossed": finish_gate_crossed
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


func _warnings(active_warnings: Array) -> Dictionary:
	if active_warnings.is_empty():
		return {
			"primary_warning": null,
			"secondary_warnings": []
		}
	return {
		"primary_warning": active_warnings[0],
		"secondary_warnings": active_warnings.slice(1)
	}


func _warning(id: String, severity: String) -> Dictionary:
	return {
		"id": id,
		"state": "active",
		"severity": severity,
		"priority": 7,
		"text_key": "warning.test",
		"source": "geometry",
		"related_entity_id": "ownship",
		"spatial_anchor_m": [0.0, 0.0],
		"started_tick": 1,
		"updated_tick": 1,
		"cleared_tick": null,
		"debug_payload": {}
	}


func _assert_result(result: Dictionary, expected_state: String, expected_previous_state: String, expected_changed_tick: int, expected_reason: String, label: String) -> void:
	_assert_equal(result["state"], expected_state, "%s state" % label)
	_assert_equal(result["previous_state"], expected_previous_state, "%s previous_state" % label)
	_assert_equal(result["changed_tick"], expected_changed_tick, "%s changed_tick" % label)
	_assert_equal(result["reason"], expected_reason, "%s reason" % label)


func _assert_result_shape(result: Dictionary, label: String) -> void:
	_assert_equal(result.has("state"), true, "%s state" % label)
	_assert_equal(result.has("previous_state"), true, "%s previous_state" % label)
	_assert_equal(result.has("changed_tick"), true, "%s changed_tick" % label)
	_assert_equal(result.has("reason"), true, "%s reason" % label)
	_assert_equal(result.has("active_warning_ids"), true, "%s active_warning_ids" % label)
	_assert_equal(result.has("debug_payload"), true, "%s debug_payload" % label)


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
