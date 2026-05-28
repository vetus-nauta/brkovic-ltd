extends SceneTree

const SCENE_PATH := "res://scenes/playable_greybox_scene.tscn"
const HUD_BINDER_PATH := "res://scripts/ui/hud_snapshot_binder.gd"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var packed_scene: PackedScene = load(SCENE_PATH)
	_assert_equal(packed_scene != null, true, "playable greybox scene loads for briefing/result feedback test")

	var scene := packed_scene.instantiate()
	root.add_child(scene)
	await process_frame

	var ready_snapshot: Dictionary = scene.get_runtime_snapshot()
	var ready_hud: Dictionary = scene.get_hud_text_snapshot()
	var briefing_label: Label = scene.get_node_or_null("HudLayer/BriefingPanelLabel")
	var result_feedback_label: Label = scene.get_node_or_null("HudLayer/ResultFeedbackLabel")

	_assert_equal(briefing_label != null, true, "briefing label exists as screen HUD node")
	_assert_equal(result_feedback_label != null, true, "result feedback label exists as screen HUD node")
	_assert_equal(scene.get_node_or_null("HudLayer/VtsPopup") == null, true, "VTS popup remains absent")
	_assert_equal(scene.get_local_attempt_state(), "ready", "attempt starts in ready state")
	_assert_equal(ready_snapshot["scenario_result"], "ready", "ready snapshot exposes Engine ready result")
	_assert_equal(ready_snapshot["vts"]["enabled"], false, "ready snapshot VTS remains disabled")
	_assert_equal(ready_snapshot["vts"]["state"], "inactive", "ready snapshot VTS remains inactive")
	_assert_equal(briefing_label.visible, true, "briefing is visible in ready state")
	_assert_equal(result_feedback_label.visible, false, "result feedback is hidden in ready state")
	_assert_contains(str(ready_hud["briefing"]), "Safe Water, Crossing Target", "briefing uses UX title")
	_assert_contains(str(ready_hud["briefing"]), "Draft training scenario - not final maritime instruction.", "briefing keeps draft/non-final wording")
	_assert_contains(str(ready_hud["briefing"]), "Objective", "briefing includes objective hierarchy")
	_assert_contains(str(ready_hud["briefing"]), "Situation", "briefing includes situation hierarchy")
	_assert_contains(str(ready_hud["briefing"]), "IALA Region A", "briefing states Region A context")
	_assert_contains(str(ready_hud["briefing"]), "VTS is disabled for this scenario.", "briefing states VTS disabled")
	_assert_contains(str(ready_hud["briefing"]), "Start Attempt", "briefing includes start action")
	_assert_equal(str(ready_hud["result_feedback"]), "", "result feedback text is empty before terminal result")

	var start_record: Dictionary = scene.queue_keyboard_input(KEY_SPACE, true)
	_assert_equal(start_record["action"], "start_attempt", "Space starts the attempt")
	_assert_equal(scene.get_local_attempt_state(), "running", "attempt changes to running after Space")
	_assert_equal(briefing_label.visible, false, "briefing hides after attempt start")
	_assert_equal(result_feedback_label.visible, false, "result feedback remains hidden while running")
	_assert_equal(str(scene.get_hud_text_snapshot()["result_feedback"]), "", "running result feedback remains empty")

	var complete_result: Dictionary = scene.advance_one_tick([], {"collision_detected": true})
	var complete_snapshot: Dictionary = complete_result["runtime_snapshot"]
	var complete_hud: Dictionary = scene.get_hud_text_snapshot()
	var result_feedback := str(complete_hud["result_feedback"])
	_assert_equal(scene.get_local_attempt_state(), "completed", "terminal Engine result completes attempt")
	_assert_equal(complete_snapshot["scenario_result"], "collision", "Engine terminal result is exported")
	_assert_equal(complete_snapshot["vts"]["enabled"], false, "completed snapshot VTS remains disabled")
	_assert_equal(complete_snapshot["vts"]["state"], "inactive", "completed snapshot VTS remains inactive")
	_assert_equal(briefing_label.visible, false, "briefing stays hidden after terminal result")
	_assert_equal(result_feedback_label.visible, true, "result feedback is visible only after completed result")
	_assert_contains(result_feedback, "Unsafe watch", "collision maps to unsafe watch category")
	_assert_contains(result_feedback, "Draft training scenario - captain note, not final maritime instruction.", "result feedback keeps captain note draft wording")
	_assert_contains(result_feedback, "Result: collision", "result feedback renders Engine scenario_result")
	_assert_contains(result_feedback, "Safe water: Safe corridor", "result feedback renders player safe-water label from Engine state")
	_assert_contains(result_feedback, "CPA/TCPA: CPA safe", "result feedback renders qualitative CPA/TCPA only")
	_assert_contains(result_feedback, "Warnings: none", "result feedback renders warning summary from Engine warning state")
	_assert_contains(result_feedback, "Restart Attempt", "result feedback includes restart action")
	_assert_not_contains(result_feedback, "cpa_m_debug", "player-facing result feedback hides numeric CPA debug key")
	_assert_not_contains(result_feedback, "tcpa_sec_debug", "player-facing result feedback hides numeric TCPA debug key")
	_assert_not_contains(result_feedback, "official", "player-facing result feedback avoids official claim")
	_assert_not_contains(result_feedback, "certified", "player-facing result feedback avoids certified claim")
	_assert_not_contains(result_feedback.to_lower(), "colregs compliant", "player-facing result feedback avoids COLREGS-compliant claim")
	_assert_not_contains(result_feedback.to_lower(), "correct rule", "player-facing result feedback avoids correct-rule claim")
	_assert_not_contains(result_feedback.to_lower(), "final maritime training", "player-facing result feedback avoids final maritime training claim")
	_assert_not_contains(result_feedback.to_lower(), "final training product", "player-facing result feedback avoids final training product claim")

	var restart_record: Dictionary = scene.queue_keyboard_input(KEY_R, true)
	var restarted_hud: Dictionary = scene.get_hud_text_snapshot()
	_assert_equal(restart_record["action"], "restart_attempt", "R restarts completed attempt")
	_assert_equal(scene.get_local_attempt_state(), "ready", "restart returns local attempt to ready")
	_assert_equal(scene.get_runtime_snapshot()["tick"], 0, "restart returns to tick 0")
	_assert_equal(scene.get_runtime_snapshot()["scenario_result"], "ready", "restart returns Engine result to ready")
	_assert_equal(briefing_label.visible, true, "briefing is visible again after restart")
	_assert_equal(result_feedback_label.visible, false, "result feedback hides after restart")
	_assert_contains(str(restarted_hud["briefing"]), "Safe Water, Crossing Target", "restarted ready state restores briefing text")
	_assert_equal(str(restarted_hud["result_feedback"]), "", "restarted ready state clears result feedback text")

	var hud_source := _read_text_file(HUD_BINDER_PATH)
	_assert_equal(hud_source.find("ScenarioResultEvaluator"), -1, "briefing/result binder does not compute result state")
	_assert_equal(hud_source.find("WarningEscalationPipeline"), -1, "briefing/result binder does not compute warnings")
	_assert_equal(hud_source.find("CpaTcpaDebugSolver"), -1, "briefing/result binder does not compute CPA/TCPA")
	_assert_equal(hud_source.find("SafeWaterGeometryMonitor"), -1, "briefing/result binder does not compute safe-water")

	scene.queue_free()
	print("briefing_result_feedback_pack_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


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


func _assert_not_contains(actual: String, blocked_substring: String, label: String) -> void:
	if actual.find(blocked_substring) == -1:
		_pass(label)
	else:
		_fail(label, "not containing %s" % blocked_substring, actual)


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
