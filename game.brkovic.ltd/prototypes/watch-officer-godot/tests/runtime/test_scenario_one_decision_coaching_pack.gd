extends SceneTree

const SCENE_PATH := "res://scenes/playable_greybox_scene.tscn"
const HUD_BINDER_PATH := "res://scripts/ui/hud_snapshot_binder.gd"
const HudSnapshotBinder = preload("res://scripts/ui/hud_snapshot_binder.gd")

var _failed := 0
var _passed := 0
var _binder := HudSnapshotBinder.new()


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var packed_scene: PackedScene = load(SCENE_PATH)
	_assert_equal(packed_scene != null, true, "playable scene loads for decision coaching test")

	var scene := packed_scene.instantiate()
	root.add_child(scene)
	await process_frame

	var ready_hud: Dictionary = scene.get_hud_text_snapshot()
	var coaching_label: Label = scene.get_node_or_null("HudLayer/CoachingRailLabel")
	_assert_equal(coaching_label != null, true, "coaching rail label exists")
	_assert_equal(scene.get_local_attempt_state(), "ready", "scene starts ready")
	_assert_equal(coaching_label.visible, false, "coaching rail hidden in ready")
	_assert_equal(str(ready_hud["decision_coaching"]), "", "ready state has no active coaching text")
	_assert_equal(scene.get_node_or_null("HudLayer/VtsPopup") == null, true, "VTS popup remains absent")

	var start_record: Dictionary = scene.queue_keyboard_input(KEY_SPACE, true)
	var running_hud: Dictionary = scene.get_hud_text_snapshot()
	_assert_equal(start_record["action"], "start_attempt", "Space starts attempt")
	_assert_equal(scene.get_local_attempt_state(), "running", "attempt is running after Space")
	_assert_equal(coaching_label.visible, true, "coaching rail visible during running")
	_assert_contains(str(running_hud["decision_coaching"]), "Read the lateral pair. Stay in the marked corridor.", "opening lateral-pair cue appears after start")
	_assert_contains(str(running_hud["decision_coaching"]), "IALA A", "opening cue includes IALA A chip")
	_assert_contains(str(running_hud["decision_coaching"]), "Draft training", "running cue includes draft chip")
	_assert_equal(Array(running_hud["decision_coaching_chips"]).size() <= 2, true, "opening cue has at most two chips")
	_assert_player_surface_clean(str(running_hud["decision_coaching"]), "opening cue player surface")

	var base_snapshot: Dictionary = scene.get_runtime_snapshot()
	var browser_tick_10_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 10,
		"safe_water": {"state": "in_corridor"},
		"cpa_tcpa": {"state": "safe"},
		"target": {"visible": true}
	}), "running")
	_assert_contains(str(browser_tick_10_hud["decision_coaching"]), "Read the lateral pair. Stay in the marked corridor.", "opening cue remains visible at browser-observed tick 10")
	_assert_contains(str(browser_tick_10_hud["decision_coaching"]), "IALA A", "opening cue keeps IALA A chip at tick 10")

	var browser_tick_21_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 21,
		"safe_water": {"state": "in_corridor"},
		"cpa_tcpa": {"state": "safe"},
		"target": {"visible": true}
	}), "running")
	_assert_contains(str(browser_tick_21_hud["decision_coaching"]), "Read the lateral pair. Stay in the marked corridor.", "opening cue remains visible at CPU-throttled observed tick 21")
	_assert_equal(Array(browser_tick_21_hud["decision_coaching_chips"]).size() <= 2, true, "opening hold cue has at most two chips")

	var safe_target_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 41,
		"safe_water": {"state": "in_corridor"},
		"cpa_tcpa": {"state": "safe"},
		"target": {"visible": true}
	}), "running")
	_assert_contains(str(safe_target_hud["decision_coaching"]), "Monitor the crossing target.", "safe target monitoring cue appears after opening hold window")
	_assert_contains(str(safe_target_hud["decision_coaching"]), "CPA safe", "safe target cue includes CPA safe chip")
	_assert_equal(Array(safe_target_hud["decision_coaching_chips"]).size() <= 2, true, "safe target cue has at most two chips")

	var corridor_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 4,
		"safe_water": {"state": "corridor_buffer"},
		"cpa_tcpa": {"state": "safe"}
	}), "running")
	_assert_contains(str(corridor_hud["decision_coaching"]), "Correct early. You are near the corridor edge.", "corridor buffer cue appears")
	_assert_contains(str(corridor_hud["decision_coaching"]), "Corridor caution", "corridor buffer cue includes chip")

	var shallow_buffer_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 4,
		"safe_water": {"state": "shallow_buffer"},
		"cpa_tcpa": {"state": "safe"}
	}), "running")
	_assert_contains(str(shallow_buffer_hud["decision_coaching"]), "Shallow water ahead. Turn back into safe water.", "shallow buffer cue appears")
	_assert_contains(str(shallow_buffer_hud["decision_coaching"]), "Shallow-water caution", "shallow buffer cue includes chip")

	var shallow_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 4,
		"safe_water": {"state": "shallow"},
		"cpa_tcpa": {"state": "safe"}
	}), "running")
	_assert_contains(str(shallow_hud["decision_coaching"]), "Unsafe water. Recover immediately.", "shallow cue appears")
	_assert_contains(str(shallow_hud["decision_coaching"]), "Shallow water", "shallow cue includes chip")

	var cpa_caution_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 4,
		"safe_water": {"state": "in_corridor"},
		"cpa_tcpa": {"state": "caution"}
	}), "running")
	_assert_contains(str(cpa_caution_hud["decision_coaching"]), "CPA caution. Make your intention clear early.", "CPA caution cue appears")
	_assert_contains(str(cpa_caution_hud["decision_coaching"]), "CPA caution", "CPA caution chip appears")

	var cpa_danger_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 4,
		"safe_water": {"state": "shallow_buffer"},
		"cpa_tcpa": {"state": "danger"}
	}), "running")
	_assert_contains(str(cpa_danger_hud["decision_coaching"]), "CPA danger. Increase separation now.", "CPA danger outranks shallow buffer")
	_assert_contains(str(cpa_danger_hud["decision_coaching"]), "CPA danger", "CPA danger chip appears")

	var cpa_immediate_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 4,
		"safe_water": {"state": "in_corridor"},
		"cpa_tcpa": {"state": "immediate"}
	}), "running")
	_assert_contains(str(cpa_immediate_hud["decision_coaching"]), "Immediate CPA risk. Avoid collision.", "CPA immediate cue appears")
	_assert_contains(str(cpa_immediate_hud["decision_coaching"]), "CPA immediate", "CPA immediate chip appears")

	var finish_hud := _sections_for(_snapshot_with(base_snapshot, {
		"tick": 8,
		"safe_water": {"finish_gate_crossed": true, "state": "in_corridor"},
		"cpa_tcpa": {"state": "safe"}
	}), "running")
	_assert_contains(str(finish_hud["decision_coaching"]), "Finish crossed. Awaiting result.", "finish cue appears from Engine finish flag")
	_assert_contains(str(finish_hud["decision_coaching"]), "Finish", "finish cue includes chip")

	var collision_snapshot := _snapshot_with(base_snapshot, {
		"tick": 8,
		"scenario_result": "collision",
		"safe_water": {"state": "in_corridor"},
		"cpa_tcpa": {"state": "safe"},
		"warnings": {"primary_warning": null, "secondary_warnings": []}
	})
	var terminal_hud := _sections_for(collision_snapshot, "running")
	_assert_contains(str(terminal_hud["decision_coaching"]), "Collision recorded. Restart from ready state.", "terminal collision cue appears")
	_assert_contains(str(terminal_hud["decision_coaching"]), "Unsafe watch", "terminal collision chip appears")
	_assert_equal(Array(terminal_hud["decision_coaching_chips"]).size() <= 2, true, "terminal cue has at most two chips")

	var result_hud := _sections_for(collision_snapshot, "completed", {
		"state": "collision",
		"previous_state": "running",
		"changed_tick": 8,
		"reason": "collision_detected",
		"active_warning_ids": [],
		"debug_payload": {}
	})
	_assert_contains(str(result_hud["result_feedback"]), "Reasons", "result feedback includes reason list")
	_assert_contains(str(result_hud["result_feedback"]), "- Collision recorded.", "result feedback includes collision reason")
	_assert_equal(Array(result_hud["result_reasons"]).size() <= 3, true, "result reason list is capped at three")
	_assert_player_surface_clean(str(result_hud["result_feedback"]), "result feedback player surface")

	var warning_result_hud := _sections_for(_snapshot_with(base_snapshot, {
		"scenario_result": "warning_outcome",
		"warnings": {"primary_warning": _warning("geometry.leaving_safe_water", "warning.leaving_safe_water", "caution"), "secondary_warnings": []}
	}), "completed", {
		"state": "warning_outcome",
		"previous_state": "running",
		"changed_tick": 6,
		"reason": "finish_with_warnings",
		"active_warning_ids": ["geometry.leaving_safe_water"],
		"debug_payload": {}
	})
	_assert_contains(str(warning_result_hud["result_feedback"]), "- Completed with active warnings.", "warning result includes result reason first")
	_assert_contains(str(warning_result_hud["result_feedback"]), "- Safe-water corridor was not maintained.", "warning result includes warning-derived reason")

	var restart_record: Dictionary = scene.queue_keyboard_input(KEY_R, true)
	var reset_hud: Dictionary = scene.get_hud_text_snapshot()
	_assert_equal(restart_record["action"], "restart_attempt", "R restarts attempt")
	_assert_equal(scene.get_local_attempt_state(), "ready", "restart returns to ready")
	_assert_equal(scene.get_runtime_snapshot()["tick"], 0, "restart returns to tick 0")
	_assert_equal(coaching_label.visible, false, "restart hides coaching rail")
	_assert_equal(str(reset_hud["decision_coaching"]), "", "restart clears coaching text")
	_assert_equal(scene.get_node_or_null("HudLayer/BriefingPanelLabel").visible, true, "restart shows briefing again")
	_assert_equal(scene.get_node_or_null("HudLayer/ResultFeedbackLabel").visible, false, "restart hides result feedback")
	_assert_equal(scene.get_runtime_snapshot()["vts"]["enabled"], false, "VTS remains disabled after restart")
	_assert_equal(scene.get_runtime_snapshot()["vts"]["state"], "inactive", "VTS remains inactive after restart")

	var hud_source := _read_text_file(HUD_BINDER_PATH)
	_assert_equal(hud_source.find("ScenarioResultEvaluator"), -1, "coaching binder does not compute result state")
	_assert_equal(hud_source.find("WarningEscalationPipeline"), -1, "coaching binder does not compute warnings")
	_assert_equal(hud_source.find("CpaTcpaDebugSolver"), -1, "coaching binder does not compute CPA/TCPA")
	_assert_equal(hud_source.find("SafeWaterGeometryMonitor"), -1, "coaching binder does not compute safe-water")
	_assert_equal(hud_source.find("ScenarioOneEncounterClassifier"), -1, "coaching binder does not compute encounter class")

	scene.queue_free()
	print("scenario_one_decision_coaching_pack_test: %s passed, %s failed" % [_passed, _failed])
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
		"priority": 6,
		"text_key": text_key,
		"source": "geometry",
		"related_entity_id": "ownship",
		"spatial_anchor_m": null,
		"started_tick": 1,
		"updated_tick": 1,
		"cleared_tick": null,
		"debug_payload": {}
	}


func _assert_player_surface_clean(text: String, label: String) -> void:
	var lower := text.to_lower()
	_assert_equal(lower.find("cpa_m_debug"), -1, "%s hides CPA debug key" % label)
	_assert_equal(lower.find("tcpa_sec_debug"), -1, "%s hides TCPA debug key" % label)
	_assert_equal(lower.find("threshold"), -1, "%s hides threshold wording" % label)
	_assert_equal(lower.find("confidence"), -1, "%s hides encounter confidence" % label)
	_assert_equal(lower.find("closest"), -1, "%s hides closest-point debug wording" % label)
	_assert_equal(lower.find("seed"), -1, "%s hides replay seed" % label)
	_assert_equal(lower.find("tolerance"), -1, "%s hides replay tolerance" % label)
	_assert_equal(lower.find("official"), -1, "%s avoids official claim" % label)
	_assert_equal(lower.find("certified"), -1, "%s avoids certified claim" % label)
	_assert_equal(lower.find("colregs compliant"), -1, "%s avoids COLREGS-compliant claim" % label)
	_assert_equal(lower.find("final maritime training"), -1, "%s avoids final maritime training claim" % label)


func _read_text_file(path: String) -> String:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return ""
	var text := file.get_as_text()
	file.close()
	return text


func _assert_contains(actual: String, expected_substring: String, label: String) -> void:
	if actual.find(expected_substring) >= 0:
		_pass(label)
	else:
		_fail(label, expected_substring, actual)


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
