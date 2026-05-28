extends RefCounted

class_name ScenarioResultEvaluator

const TERMINAL_STATES := ["success", "warning_outcome", "near_miss", "grounding", "collision"]


func evaluate(safe_water: Dictionary, cpa_tcpa: Dictionary, warnings: Dictionary, external_flags: Dictionary, previous_result: Variant, tick: int) -> Dictionary:
	var previous_state: String = _previous_state(previous_result)
	var previous_changed_tick: int = _previous_changed_tick(previous_result, tick)
	var active_warning_ids: Array = _active_warning_ids(warnings)
	var next_state: String = previous_state
	var reason := "no_terminal_condition"

	if _is_terminal(previous_state):
		return _build_result(previous_state, previous_state, previous_changed_tick, "terminal_state_sticky", active_warning_ids, safe_water, cpa_tcpa, external_flags)

	if bool(external_flags.get("collision_detected", false)):
		next_state = "collision"
		reason = "collision_flag"
	elif safe_water.get("state") == "grounded":
		next_state = "grounding"
		reason = "safe_water_grounded"
	elif bool(cpa_tcpa.get("active", false)) and cpa_tcpa.get("state") == "immediate":
		next_state = "near_miss"
		reason = "active_cpa_tcpa_immediate"
	elif bool(safe_water.get("finish_gate_crossed", false)):
		if _has_no_active_warnings(warnings) and _cpa_safe_or_inactive(cpa_tcpa):
			next_state = "success"
			reason = "finish_gate_safe"
		elif _only_caution_warnings(warnings):
			next_state = "warning_outcome"
			reason = "finish_gate_caution_warnings"
		else:
			next_state = "warning_outcome"
			reason = "finish_gate_serious_warning"
	elif previous_state == "ready" or previous_state == "running":
		next_state = previous_state
		reason = "awaiting_finish_gate"
	else:
		next_state = "running"
		reason = "awaiting_finish_gate"

	var changed_tick := previous_changed_tick
	if next_state != previous_state:
		changed_tick = tick

	return _build_result(next_state, previous_state, changed_tick, reason, active_warning_ids, safe_water, cpa_tcpa, external_flags)


func _build_result(state: String, previous_state: String, changed_tick: int, reason: String, active_warning_ids: Array, safe_water: Dictionary, cpa_tcpa: Dictionary, external_flags: Dictionary) -> Dictionary:
	return {
		"state": state,
		"previous_state": previous_state,
		"changed_tick": changed_tick,
		"reason": reason,
		"active_warning_ids": active_warning_ids.duplicate(true),
		"debug_payload": {
			"safe_water_state": safe_water.get("state", ""),
			"finish_gate_crossed": safe_water.get("finish_gate_crossed", false),
			"cpa_tcpa_state": cpa_tcpa.get("state", ""),
			"cpa_tcpa_active": cpa_tcpa.get("active", false),
			"collision_detected": external_flags.get("collision_detected", false)
		}
	}


func _previous_state(previous_result: Variant) -> String:
	if previous_result is Dictionary:
		return str(previous_result.get("state", "running"))
	if previous_result == null:
		return "running"
	return str(previous_result)


func _previous_changed_tick(previous_result: Variant, fallback_tick: int) -> int:
	if previous_result is Dictionary:
		return int(previous_result.get("changed_tick", fallback_tick))
	return fallback_tick


func _is_terminal(state: String) -> bool:
	return TERMINAL_STATES.has(state)


func _has_no_active_warnings(warnings: Dictionary) -> bool:
	return _active_warnings(warnings).is_empty()


func _only_caution_warnings(warnings: Dictionary) -> bool:
	var active_warnings: Array = _active_warnings(warnings)
	if active_warnings.is_empty():
		return false
	for warning in active_warnings:
		if warning.get("severity") != "caution":
			return false
	return true


func _active_warning_ids(warnings: Dictionary) -> Array:
	var ids: Array = []
	for warning in _active_warnings(warnings):
		ids.append(str(warning.get("id", "")))
	ids.sort()
	return ids


func _active_warnings(warnings: Dictionary) -> Array:
	var active_warnings: Array = []
	var primary = warnings.get("primary_warning", null)
	if primary != null and primary.get("state") == "active":
		active_warnings.append(primary)
	for item in warnings.get("secondary_warnings", []):
		var warning: Dictionary = item
		if warning.get("state") == "active":
			active_warnings.append(warning)
	return active_warnings


func _cpa_safe_or_inactive(cpa_tcpa: Dictionary) -> bool:
	if not bool(cpa_tcpa.get("active", false)):
		return true
	return cpa_tcpa.get("state") == "safe"
