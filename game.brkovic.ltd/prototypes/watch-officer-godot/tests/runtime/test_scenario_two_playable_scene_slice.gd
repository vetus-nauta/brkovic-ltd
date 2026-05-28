extends SceneTree

const SCENE_PATH := "res://scenes/playable_greybox_scene.tscn"
const CONTROLLER_PATH := "res://scripts/runtime/playable_greybox_controller.gd"
const DEFAULT_SCENARIO_PATH := "res://data/scenarios/safe-water-crossing-target.json"
const SCENARIO_TWO_PATH := "res://data/scenarios/head-on-port-to-port.json"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var packed_scene: PackedScene = load(SCENE_PATH)
	_assert_equal(packed_scene != null, true, "existing playable greybox scene loads")

	var scene := packed_scene.instantiate()
	root.add_child(scene)
	await process_frame

	_assert_equal(scene.has_method("set_scenario_path"), true, "controller exposes local scenario path setter")
	_assert_equal(scene.has_method("get_scenario_path"), true, "controller exposes local scenario path getter")
	_assert_equal(scene.has_method("load_scenario_path"), true, "controller exposes local load helper")
	_assert_equal(scene.get_scenario_path(), DEFAULT_SCENARIO_PATH, "default playable path remains Scenario 1")

	var controller_source := _read_text_file(CONTROLLER_PATH)
	_assert_equal(controller_source.find("scripts/sim/"), -1, "controller does not import simulation modules directly")
	_assert_equal(controller_source.find("ScenarioTwoHeadOnClassifier"), -1, "controller does not call Scenario 2 classifier directly")
	_assert_equal(controller_source.find("ScenarioTwoPassEventDetector"), -1, "controller does not call Scenario 2 pass detector directly")
	_assert_equal(controller_source.find("CpaTcpaDebugSolver"), -1, "controller does not call CPA/TCPA solver directly")
	_assert_equal(controller_source.find("router"), -1, "controller path selection does not add router dependency")
	_assert_equal(controller_source.find("registry"), -1, "controller path selection does not add registry dependency")

	var load_result: Dictionary = scene.set_scenario_path(SCENARIO_TWO_PATH)
	_assert_equal(load_result["scenario_path"], SCENARIO_TWO_PATH, "Scenario 2 path can be selected locally")
	_assert_equal(load_result["loader_error"], {}, "Scenario 2 path loads without loader error")
	_assert_equal(scene.get_scenario_path(), SCENARIO_TWO_PATH, "active local path is Scenario 2")

	var reset_snapshot: Dictionary = scene.get_runtime_snapshot()
	_assert_equal(reset_snapshot["tick"], 0, "Scenario 2 reset boots tick 0")
	_assert_almost_equal(float(reset_snapshot["time_sec"]), 0.0, "Scenario 2 reset boots time 0")
	_assert_equal(reset_snapshot["scenario_result"], "ready", "Scenario 2 reset boots ready result")
	_assert_equal(reset_snapshot.has("scenario_two"), true, "Scenario 2 snapshot includes display branch")
	_assert_equal(reset_snapshot["scenario_two"].has("debug"), false, "Scenario 2 display branch excludes debug object")
	_assert_equal(reset_snapshot.has("qa"), true, "Scenario 2 snapshot includes QA branch")
	_assert_equal(reset_snapshot["qa"].has("scenario_two_debug"), true, "Scenario 2 QA debug remains under qa branch")
	_assert_equal(reset_snapshot["vts"]["enabled"], false, "Scenario 2 local slice keeps VTS disabled")
	_assert_equal(reset_snapshot["vts"]["state"], "inactive", "Scenario 2 local slice keeps VTS inactive")

	var ready_hud: Dictionary = scene.get_hud_text_snapshot()
	_assert_contains(str(ready_hud["briefing"]), "Head-On Port-to-Port Drill", "Scenario 2 briefing title appears in HUD")
	_assert_contains(str(ready_hud["briefing"]), "alter starboard early", "Scenario 2 briefing includes approved action")
	_assert_contains(str(ready_hud["result_status"]), "Encounter: head_on / head_on_alter_starboard", "Scenario 2 result status binds encounter")

	var start_record: Dictionary = scene.queue_keyboard_input(KEY_SPACE, true)
	_assert_equal(start_record["action"], "start_attempt", "Space starts Scenario 2 local attempt")
	_assert_equal(scene.get_local_attempt_state(), "running", "Scenario 2 local attempt is running")
	_assert_equal(scene.get_runtime_snapshot()["tick"], 0, "starting Scenario 2 does not advance a tick")

	var running_hud: Dictionary = scene.get_hud_text_snapshot()
	_assert_equal(running_hud["decision_coaching_primary"], "Head-on risk. Alter starboard early.", "Scenario 2 opening coaching appears")
	_assert_equal(running_hud["decision_coaching_chips"], ["Head-on", "Draft training"], "Scenario 2 opening coaching chips are capped")

	var starboard_record: Dictionary = scene.queue_keyboard_input(KEY_D, true)
	_assert_equal(starboard_record["input_type"], "turn_starboard_pressed", "D queues starboard alteration input")
	_assert_equal(scene.get_queued_input_records().size(), 1, "starboard input is queued for orchestrator")

	var step_result: Dictionary = scene.advance_one_tick([starboard_record])
	var step_snapshot: Dictionary = step_result["runtime_snapshot"]
	_assert_equal(step_snapshot["tick"], 1, "Scenario 2 advances one orchestrated tick")
	_assert_equal(step_result["update_order"].has("scenario_two_head_on_classifier"), true, "Scenario 2 tick uses orchestrator Scenario 2 branch")
	_assert_equal(step_result["update_order"].has("runtime_snapshot_exporter"), true, "Scenario 2 tick exports runtime snapshot")
	_assert_equal(step_result["applied_input_records"].size(), 1, "Scenario 2 tick applies queued starboard input")
	_assert_equal(step_result["applied_input_records"][0]["input_type"], "turn_starboard_pressed", "starboard input reaches orchestrator")
	_assert_equal(step_snapshot.has("scenario_two"), true, "stepped Scenario 2 snapshot keeps display branch")
	_assert_equal(step_snapshot["scenario_two"].has("debug"), false, "stepped Scenario 2 display branch excludes debug object")
	_assert_equal(step_snapshot["qa"].has("scenario_two_debug"), true, "stepped Scenario 2 QA debug remains under qa branch")

	var stepped_hud: Dictionary = scene.get_hud_text_snapshot()
	var player_text := "\n".join([
		_all_hud_text(ready_hud),
		_all_hud_text(running_hud),
		_all_hud_text(stepped_hud)
	])
	_assert_contains(player_text, "Head-On Port-to-Port Drill", "HUD text keeps Scenario 2 briefing")
	_assert_contains(player_text, "Head-on risk. Alter starboard early.", "HUD text keeps Scenario 2 coaching")
	_assert_contains(player_text, "Early starboard:", "HUD text shows Scenario 2 result-safe action status")
	_assert_contains(player_text, "Port-to-port:", "HUD text shows Scenario 2 result-safe pass status")
	_assert_not_contains(player_text, "scenario_two_debug", "HUD text does not expose Scenario 2 debug branch")
	_assert_not_contains(player_text, "relative_heading", "HUD text does not expose relative heading debug")
	_assert_not_contains(player_text, "separation_m", "HUD text does not expose separation debug")
	_assert_not_contains(player_text, "COLREGS", "HUD text avoids COLREGS claims")
	_assert_not_contains(player_text.to_lower(), "official", "HUD text avoids official claims")
	_assert_not_contains(player_text.to_lower(), "certified", "HUD text avoids certified claims")
	_assert_not_contains(player_text.to_lower(), "legally correct", "HUD text avoids legal correctness claims")

	scene.queue_keyboard_input(KEY_R, true)
	var restarted_snapshot: Dictionary = scene.get_runtime_snapshot()
	_assert_equal(scene.get_scenario_path(), SCENARIO_TWO_PATH, "R/reset preserves active Scenario 2 path")
	_assert_equal(restarted_snapshot["tick"], 0, "Scenario 2 restart returns tick to 0")
	_assert_almost_equal(float(restarted_snapshot["time_sec"]), 0.0, "Scenario 2 restart returns time to 0")
	_assert_equal(restarted_snapshot["scenario_result"], "ready", "Scenario 2 restart returns result to ready")
	_assert_equal(restarted_snapshot.has("scenario_two"), true, "Scenario 2 restart still boots Scenario 2")

	scene.queue_free()
	print("scenario_two_playable_scene_slice_test: %s passed, %s failed" % [_passed, _failed])
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


func _assert_not_contains(actual: String, unexpected_substring: String, label: String) -> void:
	if actual.find(unexpected_substring) == -1:
		_pass(label)
	else:
		_fail(label, "absent: %s" % unexpected_substring, actual)


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
