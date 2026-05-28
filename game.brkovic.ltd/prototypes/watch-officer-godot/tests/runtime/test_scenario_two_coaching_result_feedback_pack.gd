extends SceneTree

const RuntimeBootstrap = preload("res://scripts/core/runtime_bootstrap.gd")
const HudSnapshotBinder = preload("res://scripts/ui/hud_snapshot_binder.gd")
const SCENARIO_ONE_PATH := "res://data/scenarios/safe-water-crossing-target.json"
const SCENARIO_TWO_PATH := "res://data/scenarios/head-on-port-to-port.json"
const HUD_BINDER_PATH := "res://scripts/ui/hud_snapshot_binder.gd"

var _failed := 0
var _passed := 0
var _binder := HudSnapshotBinder.new()


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var scenario_two_bootstrap := RuntimeBootstrap.new()
	var scenario_two_bootstrap_result := scenario_two_bootstrap.bootstrap(SCENARIO_TWO_PATH)
	_assert_equal(scenario_two_bootstrap.last_error, {}, "Scenario 2 bootstrap succeeds")
	var scenario_two_snapshot: Dictionary = scenario_two_bootstrap_result["runtime_snapshot"]

	var ready_hud := _sections_for(scenario_two_snapshot, "ready")
	_assert_contains(str(ready_hud["briefing"]), "Head-On Port-to-Port Drill", "Scenario 2 briefing title is present")
	_assert_contains(str(ready_hud["briefing"]), "Draft training scenario - not final maritime instruction.", "Scenario 2 briefing keeps draft limit")
	_assert_contains(str(ready_hud["briefing"]), "Region A / VTS inactive", "Scenario 2 briefing shows Region/VTS status line")
	_assert_contains(str(ready_hud["briefing"]), "alter starboard early", "Scenario 2 briefing states local action")
	_assert_contains(str(ready_hud["briefing"]), "Port-to-port pass", "Scenario 2 briefing states pass objective")
	_assert_contains(str(ready_hud["result_status"]), "Encounter: head_on / head_on_alter_starboard", "Scenario 2 result status binds encounter")
	_assert_contains(str(ready_hud["result_status"]), "Early starboard: Not yet detected", "Scenario 2 initial action status is display-only")
	_assert_contains(str(ready_hud["result_status"]), "Port-to-port: Not yet achieved", "Scenario 2 initial pass status is display-only")
	_assert_equal(str(ready_hud["decision_coaching"]), "", "ready state has no active coaching")
	_assert_equal(str(ready_hud["result_feedback"]), "", "ready state has no result feedback")

	var opening_hud := _sections_for(scenario_two_snapshot, "running")
	_assert_equal(opening_hud["decision_coaching_primary"], "Head-on risk. Alter starboard early.", "opening cue uses Scenario 2 coaching")
	_assert_equal(opening_hud["decision_coaching_chips"], ["Head-on", "Draft training"], "opening cue chips are capped")

	var late_action_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 70,
		"cpa_tcpa": {"state": "safe"},
		"scenario_two": {
			"early_starboard_status": "late",
			"first_starboard_alteration_status": "late_clear"
		}
	}), "running")
	_assert_equal(late_action_hud["decision_coaching_primary"], "Late alteration. Act now.", "late action cue outranks monitoring")
	_assert_equal(late_action_hud["decision_coaching_chips"], ["Late action", "Draft training"], "late action cue uses approved chips")

	var risk_warning := _warning("warning.risk_increasing_port_alteration", "warning.risk_increasing_port_alteration", "danger")
	var port_risk_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 70,
		"cpa_tcpa": {"state": "caution"},
		"warnings": {"primary_warning": risk_warning, "secondary_warnings": []},
		"scenario_two": {
			"early_starboard_status": "wrong_direction",
			"port_alteration_risk_status": "serious"
		}
	}), "running")
	_assert_equal(port_risk_hud["decision_coaching_primary"], "Port alteration increased risk in this scenario.", "port alteration risk cue outranks CPA caution")
	_assert_equal(port_risk_hud["decision_coaching_chips"], ["Head-on", "Draft training"], "port alteration risk cue uses capped chips")

	var cpa_danger_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 70,
		"cpa_tcpa": {"state": "danger"},
		"warnings": {"primary_warning": risk_warning, "secondary_warnings": []},
		"scenario_two": {
			"early_starboard_status": "wrong_direction",
			"port_alteration_risk_status": "serious"
		}
	}), "running")
	_assert_equal(cpa_danger_hud["decision_coaching_primary"], "CPA danger. Avoid collision.", "CPA danger outranks port alteration risk")
	_assert_equal(cpa_danger_hud["decision_coaching_chips"], ["CPA danger", "Draft training"], "CPA danger cue uses qualitative chip")

	var early_starboard_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 70,
		"cpa_tcpa": {"state": "safe"},
		"warnings": {"primary_warning": null, "secondary_warnings": []},
		"scenario_two": {
			"early_starboard_status": "detected",
			"early_starboard_detected": true,
			"first_starboard_alteration_status": "early",
			"port_to_port_status": "not_achieved",
			"port_to_port_achieved": false
		}
	}), "running")
	_assert_equal(early_starboard_hud["decision_coaching_primary"], "Early starboard alteration made.", "isolated early starboard cue appears from Engine state")
	_assert_equal(early_starboard_hud["decision_coaching_chips"], ["Starboard early", "Draft training"], "early starboard cue uses approved chips")

	var port_to_port_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 70,
		"cpa_tcpa": {"state": "safe"},
		"scenario_two": {
			"early_starboard_status": "detected",
			"early_starboard_detected": true,
			"port_to_port_status": "achieved",
			"port_to_port_achieved": true
		}
	}), "running")
	_assert_equal(port_to_port_hud["decision_coaching_primary"], "Port-to-port pass achieved.", "port-to-port achievement cue appears from Engine state")
	_assert_equal(port_to_port_hud["decision_coaching_chips"], ["Port-to-port", "Draft training"], "port-to-port cue uses capped chips")

	var caution_over_pass_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 70,
		"cpa_tcpa": {"state": "caution"},
		"scenario_two": {
			"early_starboard_status": "detected",
			"early_starboard_detected": true,
			"port_to_port_status": "achieved",
			"port_to_port_achieved": true
		}
	}), "running")
	_assert_equal(caution_over_pass_hud["decision_coaching_primary"], "CPA caution. Increase separation.", "CPA caution outranks port-to-port achieved cue")
	_assert_equal(caution_over_pass_hud["decision_coaching_chips"], ["CPA caution", "Draft training"], "CPA caution cue uses qualitative chip")

	var terminal_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 70,
		"scenario_result": "collision",
		"cpa_tcpa": {"state": "danger"},
		"scenario_two": {
			"early_starboard_status": "wrong_direction",
			"port_alteration_risk_status": "critical"
		}
	}), "running")
	_assert_equal(terminal_hud["decision_coaching_primary"], "Collision recorded. Restart from ready state.", "terminal result outranks live Scenario 2 coaching")
	_assert_equal(terminal_hud["decision_coaching_chips"], ["Unsafe watch", "Draft training"], "terminal cue keeps capped chips")

	var success_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 920,
		"scenario_result": "success",
		"cpa_tcpa": {"state": "safe"},
		"scenario_two": {
			"early_starboard_status": "detected",
			"early_starboard_detected": true,
			"port_to_port_status": "achieved",
			"port_to_port_achieved": true
		}
	}), "completed", {"reason": "success", "active_warning_ids": []})
	_assert_contains(str(success_hud["result_feedback"]), "Attempt complete", "success result uses Scenario 2 completion title")
	_assert_contains(str(success_hud["result_feedback"]), "Early starboard alteration made.", "success result includes early starboard reason")
	_assert_contains(str(success_hud["result_feedback"]), "Port-to-port pass achieved.", "success result includes pass reason")
	_assert_contains(str(success_hud["result_feedback"]), "CPA state recovered in this scenario.", "success result includes CPA recovery reason")
	_assert_equal(Array(success_hud["result_reasons"]).size(), 3, "success reasons are capped at three")

	var correction_hud := _sections_for(_scenario_two_snapshot_with(scenario_two_snapshot, {
		"tick": 620,
		"scenario_result": "unsafe_manoeuvre",
		"cpa_tcpa": {"state": "caution"},
		"warnings": {
			"primary_warning": _warning("late_head_on_action", "warning.late_alteration", "caution"),
			"secondary_warnings": [risk_warning]
		},
		"scenario_two": {
			"early_starboard_status": "wrong_direction",
			"port_alteration_risk_status": "serious",
			"port_to_port_status": "not_achieved",
			"port_to_port_achieved": false
		}
	}), "completed", {
		"reason": "unsafe_manoeuvre",
		"active_warning_ids": ["warning.late_alteration", "warning.risk_increasing_port_alteration"]
	})
	_assert_contains(str(correction_hud["result_feedback"]), "Needs correction", "unsafe manoeuvre result maps to Scenario 2 correction title")
	_assert_contains(str(correction_hud["result_feedback"]), "Result: unsafe_manoeuvre", "correction result shows Engine result")
	_assert_contains(str(correction_hud["result_feedback"]), "Early starboard: Port alteration increased risk in this scenario", "correction result binds action status")
	_assert_contains(str(correction_hud["result_feedback"]), "Warnings: Late alteration, Port alteration risk", "correction result summarizes Scenario 2 warnings")
	_assert_contains(str(correction_hud["result_feedback"]), "- Alteration was late or unclear.", "correction result includes late-action reason")
	_assert_contains(str(correction_hud["result_feedback"]), "- Port alteration increased risk in this scenario.", "correction result includes port-risk reason")
	_assert_contains(str(correction_hud["result_feedback"]), "- Unsafe manoeuvre recorded.", "correction result includes Engine result reason")
	_assert_equal(Array(correction_hud["result_reasons"]).size(), 3, "correction reasons are capped at three")

	var player_text := "\n".join([
		str(ready_hud["briefing"]),
		str(opening_hud["decision_coaching"]),
		str(late_action_hud["decision_coaching"]),
		str(port_risk_hud["decision_coaching"]),
		str(cpa_danger_hud["decision_coaching"]),
		str(early_starboard_hud["decision_coaching"]),
		str(port_to_port_hud["decision_coaching"]),
		str(success_hud["result_feedback"]),
		str(correction_hud["result_feedback"])
	])
	_assert_player_surface_clean(player_text, "Scenario 2 coaching/result player surface")

	var scenario_one_bootstrap := RuntimeBootstrap.new()
	var scenario_one_bootstrap_result := scenario_one_bootstrap.bootstrap(SCENARIO_ONE_PATH)
	_assert_equal(scenario_one_bootstrap.last_error, {}, "Scenario 1 bootstrap still succeeds")
	var scenario_one_snapshot: Dictionary = scenario_one_bootstrap_result["runtime_snapshot"]
	var scenario_one_running_hud := _sections_for(scenario_one_snapshot, "running")
	_assert_contains(str(scenario_one_running_hud["briefing"]), "Safe Water, Crossing Target", "Scenario 1 briefing remains preserved")
	_assert_contains(str(scenario_one_running_hud["decision_coaching"]), "Read the lateral pair. Stay in the marked corridor.", "Scenario 1 opening cue remains preserved")
	_assert_not_contains(str(scenario_one_running_hud["decision_coaching"]), "Head-on risk. Alter starboard early.", "Scenario 1 does not receive Scenario 2 opening cue")
	var scenario_one_collision_hud := _sections_for(_scenario_one_snapshot_with(scenario_one_snapshot, {
		"scenario_result": "collision",
		"cpa_tcpa": {"state": "safe"},
		"warnings": {"primary_warning": null, "secondary_warnings": []}
	}), "completed", {"reason": "collision_detected", "active_warning_ids": []})
	_assert_contains(str(scenario_one_collision_hud["result_feedback"]), "Unsafe watch", "Scenario 1 collision result category remains preserved")
	_assert_not_contains(str(scenario_one_collision_hud["result_feedback"]), "Port-to-port pass achieved.", "Scenario 1 result feedback does not receive Scenario 2 reasons")

	var hud_source := _read_text_file(HUD_BINDER_PATH)
	_assert_equal(hud_source.find("scripts/sim/"), -1, "HUD binder still does not import simulation modules")
	_assert_equal(hud_source.find("ScenarioTwoHeadOnClassifier"), -1, "HUD binder still does not compute Scenario 2 classifier")
	_assert_equal(hud_source.find("ScenarioTwoPassEventDetector"), -1, "HUD binder still does not compute Scenario 2 pass event")
	_assert_equal(hud_source.find("CpaTcpaDebugSolver"), -1, "HUD binder still does not compute CPA/TCPA")
	_assert_equal(hud_source.find("scenario_two_debug"), -1, "HUD binder still does not read Scenario 2 QA debug")

	print("scenario_two_coaching_result_feedback_pack_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _sections_for(snapshot: Dictionary, attempt_state: String, result_detail: Dictionary = {}) -> Dictionary:
	if result_detail.is_empty():
		result_detail = {
			"state": snapshot.get("scenario_result", "running"),
			"previous_state": "running",
			"changed_tick": snapshot.get("tick", 0),
			"reason": "test_fixture",
			"active_warning_ids": [],
			"debug_payload": {}
		}
	return _binder.build_sections(snapshot, attempt_state, result_detail)


func _scenario_two_snapshot_with(snapshot: Dictionary, overrides: Dictionary) -> Dictionary:
	var copy := _snapshot_with(snapshot, overrides)
	copy["scenario_static"]["scenario_id"] = "head-on-port-to-port"
	return copy


func _scenario_one_snapshot_with(snapshot: Dictionary, overrides: Dictionary) -> Dictionary:
	var copy := _snapshot_with(snapshot, overrides)
	copy["scenario_static"]["scenario_id"] = "safe-water-crossing-target"
	return copy


func _snapshot_with(snapshot: Dictionary, overrides: Dictionary) -> Dictionary:
	var copy := snapshot.duplicate(true)
	for key in overrides.keys():
		if copy.has(key) and copy[key] is Dictionary and overrides[key] is Dictionary:
			var nested: Dictionary = copy[key].duplicate(true)
			for nested_key in (overrides[key] as Dictionary).keys():
				nested[nested_key] = overrides[key][nested_key]
			copy[key] = nested
		else:
			copy[key] = overrides[key]
	return copy


func _warning(id: String, text_key: String, severity: String) -> Dictionary:
	return {
		"id": id,
		"state": "active",
		"severity": severity,
		"priority": 4,
		"text_key": text_key,
		"source": "encounter",
		"related_entity_id": "ownship",
		"spatial_anchor_m": null,
		"started_tick": 1,
		"updated_tick": 1,
		"cleared_tick": null,
		"debug_payload": {}
	}


func _read_text_file(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return ""
	var text := file.get_as_text()
	file.close()
	return text


func _assert_player_surface_clean(text: String, label: String) -> void:
	var lower := text.to_lower()
	_assert_equal(lower.find("scenario_two_debug"), -1, "%s hides Scenario 2 QA debug key" % label)
	_assert_equal(lower.find("relative_heading"), -1, "%s hides relative heading debug" % label)
	_assert_equal(lower.find("separation_m"), -1, "%s hides separation debug" % label)
	_assert_equal(lower.find("cpa_m_debug"), -1, "%s hides CPA debug key" % label)
	_assert_equal(lower.find("tcpa_sec_debug"), -1, "%s hides TCPA debug key" % label)
	_assert_equal(lower.find("threshold"), -1, "%s hides threshold wording" % label)
	_assert_equal(lower.find("confidence"), -1, "%s hides classifier confidence" % label)
	_assert_equal(lower.find("seed"), -1, "%s hides replay seed" % label)
	_assert_equal(lower.find("tolerance"), -1, "%s hides replay tolerance" % label)
	_assert_equal(lower.find("official"), -1, "%s avoids official claim" % label)
	_assert_equal(lower.find("certified"), -1, "%s avoids certified claim" % label)
	_assert_equal(lower.find("colregs"), -1, "%s avoids COLREGS claims" % label)
	_assert_equal(lower.find("legally correct"), -1, "%s avoids legal correctness claim" % label)
	_assert_equal(lower.find("final maritime training"), -1, "%s avoids final maritime training claim" % label)


func _assert_contains(actual: String, expected_substring: String, label: String) -> void:
	if actual.find(expected_substring) >= 0:
		_pass(label)
	else:
		_fail(label, expected_substring, actual)


func _assert_not_contains(actual: String, unexpected_substring: String, label: String) -> void:
	if actual.find(unexpected_substring) == -1:
		_pass(label)
	else:
		_fail(label, "absent: %s" % unexpected_substring, actual)


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
