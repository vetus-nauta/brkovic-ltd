extends RefCounted

class_name HudSnapshotBinder

const CONTROLS_TEXT := "Controls: Space/Enter start | A/Left port | D/Right starboard | Q/Down speed down | E/Up speed up | R reset"
const CUE_LEGEND_TEXT := "Cues: cyan corridor | amber shallow | yellow finish gate | red/green Region A lateral pair | orange AIS vector"
const BRIEFING_DRAFT_TEXT := "Draft training scenario - not final maritime instruction."
const RESULT_DRAFT_TEXT := "Draft training scenario - captain note, not final maritime instruction."
const OPENING_CUE_HOLD_TICKS := 40
const SCENARIO_TWO_ID := "head-on-port-to-port"
const SCENARIO_TWO_TITLE := "Head-On Port-to-Port Drill"

const TERMINAL_RESULT_STATES := ["success", "warning_outcome", "unsafe_manoeuvre", "near_miss", "grounding", "collision", "load_blocked"]
const SAFE_WATER_LABELS := {
	"in_corridor": "Safe corridor",
	"corridor_buffer": "Corridor caution",
	"shallow_buffer": "Shallow-water caution",
	"shallow": "Shallow water",
	"grounded": "Grounded"
}
const CPA_TCPA_LABELS := {
	"safe": "CPA safe",
	"caution": "CPA caution",
	"danger": "CPA danger",
	"immediate": "CPA immediate"
}
const WARNING_LABELS := {
	"warning.cpa_risk": "CPA risk",
	"warning.shallow_water": "Shallow water",
	"warning.leaving_safe_water": "Leaving safe water",
	"warning.late_alteration": "Late alteration",
	"warning.late_head_on_action": "Late alteration",
	"warning.risk_increasing_port_alteration": "Port alteration risk",
	"risk_increasing_port_alteration": "Port alteration risk",
	"warning.port_alteration_increased_risk": "Port alteration risk",
	"port_alteration_increased_risk": "Port alteration risk",
	"late_head_on_action": "Late alteration",
	"warning.collision": "Collision",
	"warning.grounding": "Grounding",
	"cpa_tcpa.cpa_risk": "CPA risk",
	"geometry.shallow_water": "Shallow water",
	"geometry.leaving_safe_water": "Leaving safe water",
	"geometry.grounding": "Grounding",
	"result.collision": "Collision",
	"result.grounding": "Grounding"
}
const RESULT_CHIP_LABELS := {
	"success": "Acceptable watch",
	"warning_outcome": "Needs correction",
	"unsafe_manoeuvre": "Needs correction",
	"near_miss": "Needs correction",
	"grounding": "Unsafe watch",
	"collision": "Unsafe watch",
	"load_blocked": "Blocked"
}
const RESULT_REASON_LABELS := {
	"success": "Scenario completed without grounding or collision.",
	"warning_outcome": "Completed with active warnings.",
	"unsafe_manoeuvre": "Unsafe manoeuvre recorded.",
	"near_miss": "CPA risk became excessive.",
	"grounding": "Grounding recorded.",
	"collision": "Collision recorded.",
	"load_blocked": "Scenario load blocked."
}
const WARNING_REASON_LABELS := {
	"warning.cpa_risk": "CPA risk increased.",
	"warning.shallow_water": "Shallow-water risk increased.",
	"warning.leaving_safe_water": "Safe-water corridor was not maintained.",
	"warning.late_alteration": "Manoeuvre was late or unclear.",
	"warning.late_head_on_action": "Alteration was late or unclear.",
	"warning.risk_increasing_port_alteration": "Port alteration increased risk in this scenario.",
	"risk_increasing_port_alteration": "Port alteration increased risk in this scenario.",
	"warning.port_alteration_increased_risk": "Port alteration increased risk in this scenario.",
	"port_alteration_increased_risk": "Port alteration increased risk in this scenario.",
	"late_head_on_action": "Alteration was late or unclear.",
	"cpa_tcpa.cpa_risk": "CPA risk increased.",
	"geometry.shallow_water": "Shallow-water risk increased.",
	"geometry.leaving_safe_water": "Safe-water corridor was not maintained."
}


func build_sections(runtime_snapshot: Dictionary, attempt_state: String = "ready", scenario_result_detail: Dictionary = {}) -> Dictionary:
	if runtime_snapshot.is_empty():
		return {
			"instrument_strip": "No runtime snapshot",
			"warning_stack": "Warnings\nPrimary: none",
			"result_status": "Result\nState: unavailable",
			"debug_status": "Draft / non-final training status unavailable",
			"attempt_status": "Attempt\nState: unavailable",
				"captain_report": "Captain note\nScenario result: unavailable\nTraining draft - needs review",
				"briefing": _build_briefing(),
				"result_feedback": "",
				"decision_coaching": "",
				"decision_coaching_primary": "",
				"decision_coaching_chips": [],
				"result_reasons": [],
				"cue_legend": CUE_LEGEND_TEXT,
				"controls": CONTROLS_TEXT,
				"combined": "No runtime snapshot"
		}

	var instrument_strip := _build_instrument_strip(runtime_snapshot, attempt_state)
	var warning_stack := _build_warning_stack(runtime_snapshot)
	var result_status := _build_result_status(runtime_snapshot, scenario_result_detail)
	var debug_status := _build_debug_status(runtime_snapshot)
	var attempt_status := _build_attempt_status(runtime_snapshot, attempt_state)
	var captain_report := _build_captain_report(runtime_snapshot, attempt_state, scenario_result_detail)
	var briefing := _build_briefing(runtime_snapshot)
	var result_feedback := _build_result_feedback(runtime_snapshot, attempt_state, scenario_result_detail)
	var decision_coaching_model := _build_decision_coaching_model(runtime_snapshot, attempt_state)
	var decision_coaching := _format_decision_coaching(decision_coaching_model)
	var result_reasons := _scenario_two_result_reasons(runtime_snapshot, scenario_result_detail) if _is_scenario_two(runtime_snapshot) else _result_reasons(runtime_snapshot, scenario_result_detail)
	return {
		"instrument_strip": instrument_strip,
		"warning_stack": warning_stack,
		"result_status": result_status,
		"debug_status": debug_status,
		"attempt_status": attempt_status,
		"captain_report": captain_report,
		"briefing": briefing,
		"result_feedback": result_feedback,
		"decision_coaching": decision_coaching,
		"decision_coaching_primary": decision_coaching_model["primary"],
		"decision_coaching_chips": decision_coaching_model["chips"].duplicate(true),
		"result_reasons": result_reasons.duplicate(true),
		"cue_legend": CUE_LEGEND_TEXT,
		"controls": CONTROLS_TEXT,
		"combined": "\n".join([
			instrument_strip,
			"",
			warning_stack,
			"",
			result_status,
			"",
			attempt_status,
			"",
			captain_report,
			"",
			briefing,
			"",
			result_feedback,
			"",
			decision_coaching,
			"",
			debug_status
		])
	}


func _build_briefing(runtime_snapshot: Dictionary = {}) -> String:
	if _is_scenario_two(runtime_snapshot):
		return "\n".join([
			SCENARIO_TWO_TITLE,
			"",
			BRIEFING_DRAFT_TEXT,
			"",
			"Objective",
			"Recognize head-on risk, alter starboard early, and create a port-to-port pass.",
			"",
			"Situation",
			"Draft training scenario. One power-driven target is approaching on a reciprocal or nearly reciprocal course. Recommended action in this scenario: alter starboard early and create a port-to-port pass.",
			"Region A / VTS inactive",
			"",
			"Watch",
			"Head-on risk | Alter starboard early | Port-to-port pass",
			"",
			"Controls",
			"Turn port/starboard. Step speed down/up. Start when ready.",
			"",
			"Start Attempt"
		])

	return "\n".join([
		"Safe Water, Crossing Target",
		"",
		BRIEFING_DRAFT_TEXT,
		"",
		"Objective",
		"Proceed through the marked safe-water corridor. Avoid shallow water, grounding, collision, and unsafe CPA with the crossing target.",
		"",
		"Situation",
		"IALA Region A. One red/green lateral pair marks a simple channel. A power-driven target crosses ahead from starboard. VTS is disabled for this scenario.",
		"",
		"Watch",
		"Read the marks first. Keep the vessel in safe water. Use early, clear heading or speed changes if CPA becomes caution, danger, or immediate.",
		"",
		"Controls",
		"Turn port/starboard. Step speed down/up. Start when ready.",
		"",
		"Start Attempt"
	])


func _build_result_feedback(runtime_snapshot: Dictionary, attempt_state: String, scenario_result_detail: Dictionary) -> String:
	var scenario_result := str(runtime_snapshot["scenario_result"])
	if attempt_state != "completed" and not TERMINAL_RESULT_STATES.has(scenario_result):
		return ""
	if _is_scenario_two(runtime_snapshot):
		return _build_scenario_two_result_feedback(runtime_snapshot, scenario_result_detail)

	var result_category := _result_category(scenario_result)
	var safe_water: Dictionary = runtime_snapshot["safe_water"]
	var cpa_tcpa: Dictionary = runtime_snapshot["cpa_tcpa"]
	var reasons := _result_reasons(runtime_snapshot, scenario_result_detail)
	var reason_lines: Array[String] = ["Reasons"]
	for reason in reasons:
		reason_lines.append("- %s" % reason)
	return "\n".join([
		result_category["title"],
		RESULT_DRAFT_TEXT,
		"",
		"Result: %s" % scenario_result,
		"",
		result_category["body"],
		"",
		"Safe water: %s" % _safe_water_player_label(str(safe_water["state"])),
		"CPA/TCPA: %s" % _cpa_tcpa_player_label(str(cpa_tcpa["state"])),
		"Warnings: %s" % _warning_summary(runtime_snapshot, scenario_result_detail),
		"",
		"\n".join(reason_lines),
		"",
		"Restart Attempt"
	])


func _result_category(scenario_result: String) -> Dictionary:
	if scenario_result == "success":
		return {
			"title": "Acceptable watch",
			"body": "You kept the vessel in the safe-water corridor and completed the crossing situation without grounding or collision."
		}
	if ["warning_outcome", "unsafe_manoeuvre", "near_miss"].has(scenario_result):
		return {
			"title": "Watch needs correction",
			"body": "The attempt remained recoverable, but the watch developed avoidable risk. Review the warning summary before restarting."
		}
	return {
		"title": "Unsafe watch",
		"body": "The attempt ended in an unsafe outcome. Restart and keep the vessel clear of shallow water and the crossing target."
	}


func _build_decision_coaching_model(runtime_snapshot: Dictionary, attempt_state: String) -> Dictionary:
	if attempt_state != "running":
		return {
			"primary": "",
			"chips": []
		}
	if _is_scenario_two(runtime_snapshot):
		return _build_scenario_two_decision_coaching_model(runtime_snapshot)

	var scenario_result := str(runtime_snapshot["scenario_result"])
	var safe_water: Dictionary = runtime_snapshot["safe_water"]
	var cpa_tcpa: Dictionary = runtime_snapshot["cpa_tcpa"]
	var warnings: Dictionary = runtime_snapshot["warnings"]
	var primary_warning = warnings.get("primary_warning", null)
	var primary := ""
	var chips: Array[String] = []

	if TERMINAL_RESULT_STATES.has(scenario_result):
		primary = _terminal_result_cue(scenario_result)
		chips.append(str(RESULT_CHIP_LABELS.get(scenario_result, scenario_result)))
	elif primary_warning != null and str((primary_warning as Dictionary).get("severity", "")) == "immediate":
		var immediate_warning: Dictionary = primary_warning
		primary = _warning_cue(immediate_warning)
		chips.append(_warning_label_for_key(str(immediate_warning.get("text_key", immediate_warning.get("id", "")))))
	elif ["immediate", "danger"].has(str(cpa_tcpa["state"])):
		primary = _cpa_coaching_cue(str(cpa_tcpa["state"]))
		chips.append(_cpa_tcpa_player_label(str(cpa_tcpa["state"])))
	elif ["grounded", "shallow", "shallow_buffer"].has(str(safe_water["state"])):
		primary = _safe_water_coaching_cue(str(safe_water["state"]))
		chips.append(_safe_water_player_label(str(safe_water["state"])))
	elif primary_warning != null and ["danger", "caution"].has(str((primary_warning as Dictionary).get("severity", ""))):
		var active_warning: Dictionary = primary_warning
		primary = _warning_cue(active_warning)
		chips.append(_warning_label_for_key(str(active_warning.get("text_key", active_warning.get("id", "")))))
	elif str(cpa_tcpa["state"]) == "caution":
		primary = _cpa_coaching_cue("caution")
		chips.append(_cpa_tcpa_player_label("caution"))
	elif str(safe_water["state"]) == "corridor_buffer":
		primary = _safe_water_coaching_cue("corridor_buffer")
		chips.append(_safe_water_player_label("corridor_buffer"))
	elif bool(safe_water.get("finish_gate_crossed", false)):
		primary = "Finish crossed. Awaiting result."
		chips.append("Finish")
	elif int(runtime_snapshot["tick"]) <= OPENING_CUE_HOLD_TICKS:
		primary = "Read the lateral pair. Stay in the marked corridor."
		chips.append("IALA A")
	elif bool(runtime_snapshot["target"].get("visible", false)) and str(cpa_tcpa["state"]) == "safe":
		primary = "Monitor the crossing target."
		chips.append(_cpa_tcpa_player_label("safe"))
	else:
		primary = _safe_water_coaching_cue(str(safe_water["state"]))
		chips.append(_safe_water_player_label(str(safe_water["state"])))

	if runtime_snapshot.get("draft_training", false) and chips.size() < 2:
		chips.append("Draft training")

	return {
		"primary": primary,
		"chips": chips.slice(0, min(2, chips.size()))
	}


func _build_scenario_two_decision_coaching_model(runtime_snapshot: Dictionary) -> Dictionary:
	var scenario_result := str(runtime_snapshot["scenario_result"])
	var cpa_tcpa: Dictionary = runtime_snapshot["cpa_tcpa"]
	var warnings: Dictionary = runtime_snapshot["warnings"]
	var scenario_two: Dictionary = runtime_snapshot.get("scenario_two", {})
	var primary_warning = warnings.get("primary_warning", null)
	var has_port_alteration_risk_warning := _scenario_two_has_warning(warnings, [
		"warning.risk_increasing_port_alteration",
		"risk_increasing_port_alteration",
		"warning.port_alteration_increased_risk",
		"port_alteration_increased_risk"
	])
	var has_late_action_warning := _scenario_two_has_warning(warnings, [
		"warning.late_alteration",
		"warning.late_head_on_action",
		"late_head_on_action"
	])
	var primary := ""
	var chips: Array[String] = []

	if TERMINAL_RESULT_STATES.has(scenario_result):
		primary = _terminal_result_cue(scenario_result)
		chips.append(str(RESULT_CHIP_LABELS.get(scenario_result, scenario_result)))
	elif primary_warning != null and str((primary_warning as Dictionary).get("severity", "")) == "immediate":
		primary = _scenario_two_warning_cue(primary_warning)
		chips.append(_warning_label_for_key(str((primary_warning as Dictionary).get("text_key", (primary_warning as Dictionary).get("id", "")))))
	elif ["immediate", "danger"].has(str(cpa_tcpa["state"])):
		primary = "CPA danger. Avoid collision."
		chips.append(_cpa_tcpa_player_label(str(cpa_tcpa["state"])))
	elif _scenario_two_has_port_alteration_risk(scenario_two) or has_port_alteration_risk_warning:
		primary = "Port alteration increased risk in this scenario."
		chips.append("Head-on")
	elif _scenario_two_has_late_action(scenario_two) or has_late_action_warning:
		primary = "Late alteration. Act now."
		chips.append("Late action")
	elif str(cpa_tcpa["state"]) == "caution":
		primary = "CPA caution. Increase separation."
		chips.append(_cpa_tcpa_player_label("caution"))
	elif bool(scenario_two.get("port_to_port_achieved", false)):
		primary = "Port-to-port pass achieved."
		chips.append("Port-to-port")
	elif _scenario_two_has_early_starboard_confirmation(scenario_two):
		primary = "Early starboard alteration made."
		chips.append("Starboard early")
	elif int(runtime_snapshot["tick"]) <= OPENING_CUE_HOLD_TICKS:
		primary = "Head-on risk. Alter starboard early."
		chips.append("Head-on")
	elif bool(scenario_two.get("early_starboard_detected", false)):
		primary = "Monitor the closing target."
		chips.append("Head-on")
	else:
		primary = "Make a clear starboard alteration."
		chips.append("Head-on")

	if runtime_snapshot.get("draft_training", false) and chips.size() < 2:
		chips.append("Draft training")

	return {
		"primary": primary,
		"chips": chips.slice(0, min(2, chips.size()))
	}


func _build_scenario_two_result_feedback(runtime_snapshot: Dictionary, scenario_result_detail: Dictionary) -> String:
	var scenario_result := str(runtime_snapshot["scenario_result"])
	var result_category := _scenario_two_result_category(scenario_result)
	var safe_water: Dictionary = runtime_snapshot["safe_water"]
	var cpa_tcpa: Dictionary = runtime_snapshot["cpa_tcpa"]
	var scenario_two: Dictionary = runtime_snapshot.get("scenario_two", {})
	var reasons := _scenario_two_result_reasons(runtime_snapshot, scenario_result_detail)
	var reason_lines: Array[String] = ["Reasons"]
	for reason in reasons:
		reason_lines.append("- %s" % reason)
	return "\n".join([
		result_category["title"],
		RESULT_DRAFT_TEXT,
		"",
		"Result: %s" % scenario_result,
		"",
		result_category["body"],
		"",
		"Safe water: %s" % _safe_water_player_label(str(safe_water["state"])),
		"CPA/TCPA: %s" % _cpa_tcpa_player_label(str(cpa_tcpa["state"])),
		"Early starboard: %s" % _scenario_two_action_label(str(scenario_two.get("early_starboard_status", "not_detected"))),
		"Port-to-port: %s" % _scenario_two_pass_label(str(scenario_two.get("port_to_port_status", "not_achieved"))),
		"Warnings: %s" % _warning_summary(runtime_snapshot, scenario_result_detail),
		"",
		"\n".join(reason_lines),
		"",
		"Restart Attempt"
	])


func _scenario_two_result_category(scenario_result: String) -> Dictionary:
	if scenario_result == "success":
		return {
			"title": "Attempt complete",
			"body": "The draft drill recorded early starboard alteration and a port-to-port pass in this scenario."
		}
	if ["warning_outcome", "unsafe_manoeuvre", "near_miss"].has(scenario_result):
		return {
			"title": "Needs correction",
			"body": "The attempt remained recoverable, but the head-on drill developed avoidable risk. Review the captain note before restarting."
		}
	return {
		"title": "Unsafe manoeuvre recorded",
		"body": "The attempt ended in an unsafe outcome for this draft scenario. Restart and keep the response early and clearly to starboard."
	}


func _scenario_two_result_reasons(runtime_snapshot: Dictionary, scenario_result_detail: Dictionary) -> Array[String]:
	var scenario_two: Dictionary = runtime_snapshot.get("scenario_two", {})
	var warnings: Dictionary = runtime_snapshot["warnings"]
	var reasons: Array[String] = []
	if _scenario_two_has_late_action(scenario_two):
		reasons.append("Alteration was late or unclear.")
	if _scenario_two_has_port_alteration_risk(scenario_two):
		reasons.append("Port alteration increased risk in this scenario.")
	_append_scenario_two_reason_for_warning(reasons, warnings.get("primary_warning", null))
	for warning in warnings.get("secondary_warnings", []):
		_append_scenario_two_reason_for_warning(reasons, warning)
	for warning_id in scenario_result_detail.get("active_warning_ids", []):
		_append_scenario_two_reason(reasons, _scenario_two_reason_for_warning_key(str(warning_id)))
	if bool(scenario_two.get("early_starboard_detected", false)):
		_append_scenario_two_reason(reasons, "Early starboard alteration made.")
	if bool(scenario_two.get("port_to_port_achieved", false)):
		_append_scenario_two_reason(reasons, "Port-to-port pass achieved.")
	if str(runtime_snapshot["cpa_tcpa"]["state"]) == "safe":
		_append_scenario_two_reason(reasons, "CPA state recovered in this scenario.")
	for reason in _result_reasons(runtime_snapshot, scenario_result_detail):
		if not _scenario_two_has_equivalent_reason(reasons, reason):
			reasons.append(reason)
	return reasons.slice(0, min(3, reasons.size()))


func _scenario_two_has_port_alteration_risk(scenario_two: Dictionary) -> bool:
	if str(scenario_two.get("early_starboard_status", "")) == "wrong_direction":
		return true
	return ["moderate", "serious", "critical", "risk_increasing", "active"].has(str(scenario_two.get("port_alteration_risk_status", "")))


func _scenario_two_has_late_action(scenario_two: Dictionary) -> bool:
	if str(scenario_two.get("early_starboard_status", "")) == "late":
		return true
	return ["late_clear", "unclear"].has(str(scenario_two.get("first_starboard_alteration_status", "")))


func _scenario_two_has_early_starboard_confirmation(scenario_two: Dictionary) -> bool:
	if bool(scenario_two.get("early_starboard_detected", false)):
		return true
	if str(scenario_two.get("early_starboard_status", "")) == "detected":
		return true
	return str(scenario_two.get("first_starboard_alteration_status", "")) == "early"


func _scenario_two_has_warning(warnings: Dictionary, keys: Array[String]) -> bool:
	if _scenario_two_warning_matches(warnings.get("primary_warning", null), keys):
		return true
	for warning in warnings.get("secondary_warnings", []):
		if _scenario_two_warning_matches(warning, keys):
			return true
	return false


func _scenario_two_warning_matches(warning: Variant, keys: Array[String]) -> bool:
	if warning == null:
		return false
	var warning_dict: Dictionary = warning
	return keys.has(str(warning_dict.get("text_key", ""))) or keys.has(str(warning_dict.get("id", "")))


func _append_scenario_two_reason_for_warning(reasons: Array[String], warning: Variant) -> void:
	if warning == null or reasons.size() >= 3:
		return
	var warning_dict: Dictionary = warning
	var reason := _scenario_two_reason_for_warning_key(str(warning_dict.get("text_key", warning_dict.get("id", ""))))
	_append_scenario_two_reason(reasons, reason)


func _scenario_two_reason_for_warning_key(key: String) -> String:
	match key:
		"warning.late_alteration", "warning.late_head_on_action", "late_head_on_action":
			return "Alteration was late or unclear."
		"warning.risk_increasing_port_alteration", "risk_increasing_port_alteration", "warning.port_alteration_increased_risk", "port_alteration_increased_risk":
			return "Port alteration increased risk in this scenario."
	return ""


func _append_scenario_two_reason(reasons: Array[String], reason: String) -> void:
	if reason != "" and not reasons.has(reason) and reasons.size() < 3:
		reasons.append(reason)


func _scenario_two_has_equivalent_reason(reasons: Array[String], reason: String) -> bool:
	if reasons.has(reason):
		return true
	if reason == "Manoeuvre was late or unclear." and reasons.has("Alteration was late or unclear."):
		return true
	return false


func _scenario_two_action_label(status: String) -> String:
	match status:
		"detected":
			return "Early starboard alteration made"
		"late":
			return "Late action"
		"wrong_direction":
			return "Port alteration increased risk in this scenario"
	return "Not yet detected"


func _scenario_two_pass_label(status: String) -> String:
	match status:
		"achieved":
			return "Port-to-port pass achieved"
		"wrong_side":
			return "Port-to-port not achieved"
	return "Not yet achieved"


func _format_decision_coaching(model: Dictionary) -> String:
	var primary := str(model.get("primary", ""))
	if primary == "":
		return ""
	var chips: Array = model.get("chips", [])
	if chips.is_empty():
		return primary
	var chip_strings: Array[String] = []
	for chip in chips:
		chip_strings.append(str(chip))
	return "%s\n%s" % [primary, " | ".join(chip_strings)]


func _terminal_result_cue(scenario_result: String) -> String:
	match scenario_result:
		"success":
			return "Attempt complete. Review the captain note."
		"warning_outcome":
			return "Attempt complete with warnings. Review corrections."
		"unsafe_manoeuvre":
			return "Unsafe manoeuvre recorded. Review the warning summary."
		"near_miss":
			return "Near miss recorded. Review CPA risk."
		"grounding":
			return "Grounding recorded. Restart from ready state."
		"collision":
			return "Collision recorded. Restart from ready state."
		"load_blocked":
			return "Scenario load blocked. QA review required."
	return "Attempt complete. Review the captain note."


func _safe_water_coaching_cue(state: String) -> String:
	match state:
		"in_corridor":
			return "Hold the corridor."
		"corridor_buffer":
			return "Correct early. You are near the corridor edge."
		"shallow_buffer":
			return "Shallow water ahead. Turn back into safe water."
		"shallow":
			return "Unsafe water. Recover immediately."
	return "Hold the corridor."


func _cpa_coaching_cue(state: String) -> String:
	match state:
		"caution":
			return "CPA caution. Make your intention clear early."
		"danger":
			return "CPA danger. Increase separation now."
		"immediate":
			return "Immediate CPA risk. Avoid collision."
	return "Monitor the crossing target."


func _warning_cue(warning: Dictionary) -> String:
	match str(warning.get("text_key", warning.get("id", ""))):
		"warning.cpa_risk", "cpa_tcpa.cpa_risk":
			return _cpa_coaching_cue(str(warning.get("severity", "caution")))
		"warning.shallow_water", "geometry.shallow_water":
			if str(warning.get("severity", "")) == "immediate":
				return "Unsafe water. Recover immediately."
			return "Shallow water ahead. Turn back into safe water."
		"warning.leaving_safe_water", "geometry.leaving_safe_water":
			return "Correct early. You are near the corridor edge."
		"warning.collision":
			return "Collision recorded. Restart from ready state."
		"warning.grounding", "geometry.grounding":
			return "Grounding recorded. Restart from ready state."
	return _warning_label_for_key(str(warning.get("text_key", warning.get("id", ""))))


func _scenario_two_warning_cue(warning: Dictionary) -> String:
	match str(warning.get("text_key", warning.get("id", ""))):
		"warning.cpa_risk", "cpa_tcpa.cpa_risk":
			return "CPA danger. Avoid collision."
		"warning.late_alteration":
			return "Late alteration. Act now."
	return _warning_cue(warning)


func _build_instrument_strip(runtime_snapshot: Dictionary, attempt_state: String) -> String:
	var scenario_static: Dictionary = runtime_snapshot.get("scenario_static", {})
	var ownship: Dictionary = runtime_snapshot["ownship"]
	return "\n".join([
		"Watch Officer greybox",
		"Attempt %s | Scenario %s" % [attempt_state, runtime_snapshot["scenario_result"]],
		"IALA %s | %s" % [scenario_static.get("iala_region", "A"), runtime_snapshot["camera"]["mode"]],
		"Tick %s | Time %.2fs" % [runtime_snapshot["tick"], float(runtime_snapshot["time_sec"])],
		"HDG %.1f deg | Speed %s" % [float(ownship["heading_deg"]), ownship["speed_level"]],
		"Turn %s | Safe water %s" % [ownship["turn_state"], runtime_snapshot["safe_water"]["state"]]
	])


func _build_warning_stack(runtime_snapshot: Dictionary) -> String:
	var warnings: Dictionary = runtime_snapshot["warnings"]
	var primary_warning: Variant = warnings["primary_warning"]
	var secondary_warnings: Array = warnings.get("secondary_warnings", [])
	var lines := ["Warnings"]
	lines.append("Primary: %s" % _format_warning(primary_warning))
	if secondary_warnings.is_empty():
		lines.append("Secondary: none")
	else:
		var secondary_text: Array[String] = []
		for warning in secondary_warnings:
			secondary_text.append(_format_warning(warning))
		lines.append("Secondary: %s" % " | ".join(secondary_text))
	return "\n".join(lines)


func _build_result_status(runtime_snapshot: Dictionary, scenario_result_detail: Dictionary) -> String:
	var cpa_tcpa: Dictionary = runtime_snapshot["cpa_tcpa"]
	var vts: Dictionary = runtime_snapshot["vts"]
	var lines: Array[String] = [
		"Result",
		"State: %s" % runtime_snapshot["scenario_result"],
		"Reason: %s" % scenario_result_detail.get("reason", "not_finished"),
		"CPA/TCPA: %s" % cpa_tcpa["state"],
		"VTS: %s/%s" % [str(vts["enabled"]), vts["state"]]
	]
	if _is_scenario_two(runtime_snapshot):
		var scenario_two: Dictionary = runtime_snapshot.get("scenario_two", {})
		lines.append("Encounter: %s / %s" % [
			scenario_two.get("encounter_class", "unknown"),
			scenario_two.get("player_role", "unknown")
		])
		lines.append("Early starboard: %s" % _scenario_two_action_label(str(scenario_two.get("early_starboard_status", "not_detected"))))
		lines.append("Port-to-port: %s" % _scenario_two_pass_label(str(scenario_two.get("port_to_port_status", "not_achieved"))))
	return "\n".join(lines)


func _build_debug_status(runtime_snapshot: Dictionary) -> String:
	var scenario_static: Dictionary = runtime_snapshot.get("scenario_static", {})
	var qa: Dictionary = runtime_snapshot["qa"]
	return "\n".join([
		"Draft / non-final training",
		"draft_training: %s" % str(runtime_snapshot["draft_training"]),
		"rule_review: %s" % scenario_static.get("rule_review_status", "draft"),
		"training_claim: %s" % scenario_static.get("training_claim_status", "draft_not_final_training_content"),
		"QA seed %s | %s Hz | +/- %s tick" % [
			qa["seed"],
			qa["fixed_tick_hz"],
			qa["event_timing_tolerance_ticks"]
		]
	])


func _build_attempt_status(runtime_snapshot: Dictionary, attempt_state: String) -> String:
	return "\n".join([
		"Attempt",
		"State: %s" % attempt_state,
		"Engine scenario_state: %s" % runtime_snapshot["scenario_state"],
		"Reset/restart returns to deterministic tick 0"
	])


func _build_captain_report(runtime_snapshot: Dictionary, attempt_state: String, scenario_result_detail: Dictionary) -> String:
	var active_warning_ids: Array = scenario_result_detail.get("active_warning_ids", [])
	var warning_text := "none"
	if not active_warning_ids.is_empty():
		var warning_strings: Array[String] = []
		for warning_id in active_warning_ids:
			warning_strings.append(str(warning_id))
		warning_text = ", ".join(warning_strings)

	var safe_water: Dictionary = runtime_snapshot["safe_water"]
	var cpa_tcpa: Dictionary = runtime_snapshot["cpa_tcpa"]
	return "\n".join([
		"Captain note",
		"Attempt state: %s" % attempt_state,
		"Scenario result: %s" % runtime_snapshot["scenario_result"],
		"Active warnings: %s" % warning_text,
		"Safe water: %s | CPA/TCPA: %s" % [safe_water["state"], cpa_tcpa["state"]],
		"Training draft - needs review"
	])


func _format_warning(warning: Variant) -> String:
	if warning == null:
		return "none"
	var warning_dict: Dictionary = warning
	return "%s / %s" % [warning_dict.get("text_key", ""), warning_dict.get("severity", "")]


func _warning_summary(runtime_snapshot: Dictionary, scenario_result_detail: Dictionary) -> String:
	var warning_labels: Array[String] = []
	var warnings: Dictionary = runtime_snapshot["warnings"]
	_append_warning_label(warning_labels, warnings.get("primary_warning", null))
	for warning in warnings.get("secondary_warnings", []):
		_append_warning_label(warning_labels, warning)

	if warning_labels.size() < 3:
		for warning_id in scenario_result_detail.get("active_warning_ids", []):
			var label := _warning_label_for_key(str(warning_id))
			if not warning_labels.has(label):
				warning_labels.append(label)
			if warning_labels.size() >= 3:
				break

	if warning_labels.is_empty():
		return "none"
	return ", ".join(warning_labels.slice(0, min(3, warning_labels.size())))


func _result_reasons(runtime_snapshot: Dictionary, scenario_result_detail: Dictionary) -> Array[String]:
	var scenario_result := str(runtime_snapshot["scenario_result"])
	var reasons: Array[String] = []
	if TERMINAL_RESULT_STATES.has(scenario_result):
		reasons.append(str(RESULT_REASON_LABELS.get(scenario_result, "Scenario result recorded.")))

	var warnings: Dictionary = runtime_snapshot["warnings"]
	_append_reason_for_warning(reasons, warnings.get("primary_warning", null))
	for warning in warnings.get("secondary_warnings", []):
		_append_reason_for_warning(reasons, warning)

	if reasons.size() < 3:
		for warning_id in scenario_result_detail.get("active_warning_ids", []):
			var reason := _reason_for_warning_key(str(warning_id))
			if reason != "" and not reasons.has(reason):
				reasons.append(reason)
			if reasons.size() >= 3:
				break

	if reasons.is_empty() and scenario_result == "success":
		reasons.append(str(RESULT_REASON_LABELS["success"]))
		reasons.append("CPA recovered or safe.")
	elif reasons.is_empty():
		reasons.append("Scenario result recorded.")

	return reasons.slice(0, min(3, reasons.size()))


func _append_reason_for_warning(reasons: Array[String], warning: Variant) -> void:
	if warning == null or reasons.size() >= 3:
		return
	var warning_dict: Dictionary = warning
	var reason := _reason_for_warning_key(str(warning_dict.get("text_key", warning_dict.get("id", ""))))
	if reason != "" and not reasons.has(reason):
		reasons.append(reason)


func _reason_for_warning_key(key: String) -> String:
	return str(WARNING_REASON_LABELS.get(key, ""))


func _append_warning_label(warning_labels: Array[String], warning: Variant) -> void:
	if warning == null or warning_labels.size() >= 3:
		return
	var warning_dict: Dictionary = warning
	var label := _warning_label_for_key(str(warning_dict.get("text_key", warning_dict.get("id", ""))))
	if not warning_labels.has(label):
		warning_labels.append(label)


func _warning_label_for_key(key: String) -> String:
	return str(WARNING_LABELS.get(key, key))


func _safe_water_player_label(state: String) -> String:
	return str(SAFE_WATER_LABELS.get(state, state))


func _cpa_tcpa_player_label(state: String) -> String:
	return str(CPA_TCPA_LABELS.get(state, state))


func _is_scenario_two(runtime_snapshot: Dictionary) -> bool:
	var scenario_static: Dictionary = runtime_snapshot.get("scenario_static", {})
	return str(scenario_static.get("scenario_id", "")) == SCENARIO_TWO_ID
