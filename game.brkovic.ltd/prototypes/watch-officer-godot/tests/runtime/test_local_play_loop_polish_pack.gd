extends SceneTree

const SCENE_PATH := "res://scenes/playable_greybox_scene.tscn"
const CONTROLLER_PATH := "res://scripts/runtime/playable_greybox_controller.gd"
const HUD_BINDER_PATH := "res://scripts/ui/hud_snapshot_binder.gd"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var packed_scene: PackedScene = load(SCENE_PATH)
	_assert_equal(packed_scene != null, true, "playable scene loads for local play loop test")

	var scene := packed_scene.instantiate()
	root.add_child(scene)
	await process_frame

	var ready_snapshot: Dictionary = scene.get_runtime_snapshot()
	var ready_hud: Dictionary = scene.get_hud_text_snapshot()
	_assert_equal(scene.get_local_attempt_state(), "ready", "local attempt starts deterministic ready")
	_assert_equal(ready_snapshot["tick"], 0, "ready state starts at tick 0")
	_assert_almost_equal(float(ready_snapshot["time_sec"]), 0.0, "ready state starts at time 0")
	_assert_equal(ready_snapshot["scenario_result"], "ready", "ready state starts with ready result")
	_assert_contains(str(ready_hud["instrument_strip"]), "Attempt ready", "ready attempt state is visible")
	_assert_contains(str(ready_hud["attempt_status"]), "State: ready", "attempt panel shows ready state")
	_assert_contains(str(ready_hud["captain_report"]), "Captain note", "captain report panel is visible")
	_assert_contains(str(ready_hud["captain_report"]), "Training draft - needs review", "captain report includes non-final wording")

	var start_record: Dictionary = scene.queue_keyboard_input(KEY_SPACE, true)
	_assert_equal(start_record["action"], "start_attempt", "Space starts local attempt")
	_assert_equal(scene.get_local_attempt_state(), "running", "start changes attempt state to running")
	var running_hud: Dictionary = scene.get_hud_text_snapshot()
	_assert_contains(str(running_hud["instrument_strip"]), "Attempt running", "running attempt state is visible")
	_assert_contains(str(running_hud["attempt_status"]), "State: running", "attempt panel shows running state")
	_assert_equal(scene.get_runtime_snapshot()["tick"], 0, "start input does not advance simulation tick")

	var source_before_step: String = _read_text_file(CONTROLLER_PATH)
	_assert_equal(source_before_step.find("RuntimeStepOrchestrator") >= 0, true, "controller uses RuntimeStepOrchestrator")
	_assert_equal(source_before_step.find("scripts/sim/"), -1, "controller does not import simulation modules directly")

	var step_result: Dictionary = scene.advance_one_tick([])
	var step_snapshot: Dictionary = step_result["runtime_snapshot"]
	_assert_equal(step_snapshot["tick"], 1, "running attempt advances through orchestrator")
	_assert_equal(step_result["update_order"].has("runtime_snapshot_exporter"), true, "orchestrator update order is returned")
	_assert_equal(scene.get_local_attempt_state(), "running", "baseline tick remains running")

	var complete_result: Dictionary = scene.advance_one_tick([], {"collision_detected": true})
	var complete_snapshot: Dictionary = complete_result["runtime_snapshot"]
	var complete_detail: Dictionary = scene.get_scenario_result_detail()
	var complete_hud: Dictionary = scene.get_hud_text_snapshot()
	_assert_equal(scene.get_local_attempt_state(), "completed", "terminal Engine result completes local attempt")
	_assert_equal(complete_snapshot["scenario_result"], "collision", "result comes from Engine snapshot")
	_assert_equal(complete_detail["state"], "collision", "scenario result detail comes from Engine evaluator")
	_assert_contains(str(complete_hud["result_status"]), "State: collision", "result panel reads Engine result state")
	_assert_contains(str(complete_hud["captain_report"]), "Scenario result: collision", "captain report reads Engine result state")
	_assert_contains(str(complete_hud["captain_report"]), "Active warnings: none", "captain report shows active warning ids or none")
	_assert_contains(str(complete_hud["captain_report"]), "Safe water: %s" % complete_snapshot["safe_water"]["state"], "captain report reads safe-water state")
	_assert_contains(str(complete_hud["captain_report"]), "CPA/TCPA: %s" % complete_snapshot["cpa_tcpa"]["state"], "captain report reads CPA/TCPA qualitative state")
	_assert_contains(str(complete_hud["captain_report"]), "Training draft - needs review", "completed captain report keeps draft/non-final wording")
	_assert_equal(complete_snapshot["vts"]["enabled"], false, "VTS remains disabled")
	_assert_equal(complete_snapshot["vts"]["state"], "inactive", "VTS remains inactive")

	var local_copy := _all_hud_text(complete_hud).to_lower()
	_assert_equal(local_copy.find("official"), -1, "local result copy avoids official claim")
	_assert_equal(local_copy.find("certified"), -1, "local result copy avoids certified claim")
	_assert_equal(local_copy.find("colregs compliant"), -1, "local result copy avoids COLREGS compliant claim")
	_assert_equal(local_copy.find("correct rule"), -1, "local result copy avoids correct rule claim")

	var ignored_after_complete: Dictionary = scene.queue_keyboard_input(KEY_E, true)
	_assert_equal(ignored_after_complete, {}, "completed attempt ignores movement input until reset")

	var restart_record: Dictionary = scene.queue_keyboard_input(KEY_R, true)
	_assert_equal(restart_record["action"], "restart_attempt", "R restarts local attempt")
	var reset_snapshot: Dictionary = scene.get_runtime_snapshot()
	_assert_equal(scene.get_local_attempt_state(), "ready", "restart returns attempt to ready")
	_assert_equal(reset_snapshot["tick"], 0, "restart returns tick to deterministic initial state")
	_assert_almost_equal(float(reset_snapshot["time_sec"]), 0.0, "restart returns time to deterministic initial state")
	_assert_equal(reset_snapshot["scenario_result"], "ready", "restart returns result to ready")
	_assert_equal(scene.get_queued_input_records(), [], "restart clears input queue")

	var hud_source := _read_text_file(HUD_BINDER_PATH)
	_assert_equal(hud_source.find("ScenarioResultEvaluator"), -1, "HUD/captain report binder does not compute result state")
	_assert_equal(hud_source.find("WarningEscalationPipeline"), -1, "HUD/captain report binder does not compute warnings")
	_assert_equal(hud_source.find("CpaTcpaDebugSolver"), -1, "HUD/captain report binder does not compute CPA/TCPA")
	_assert_equal(hud_source.find("SafeWaterGeometryMonitor"), -1, "HUD/captain report binder does not compute safe-water")

	scene.queue_free()
	print("local_play_loop_polish_pack_test: %s passed, %s failed" % [_passed, _failed])
	quit(_failed)


func _all_hud_text(hud: Dictionary) -> String:
	var parts: Array[String] = []
	for key in hud.keys():
		parts.append(str(hud[key]))
	return "\n".join(parts)


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
