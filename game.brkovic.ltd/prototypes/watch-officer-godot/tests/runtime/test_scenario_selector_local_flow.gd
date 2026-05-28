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
	_assert_equal(packed_scene != null, true, "playable scene loads for scenario selector test")

	var scene := packed_scene.instantiate()
	root.add_child(scene)
	await process_frame

	var selector: OptionButton = scene.get_node_or_null("HudLayer/ScenarioSelector")
	var selector_status: Label = scene.get_node_or_null("HudLayer/ScenarioSelectorStatusLabel")
	_assert_equal(selector != null, true, "scenario selector option button exists")
	_assert_equal(selector_status != null, true, "scenario selector status label exists")
	_assert_equal(selector.item_count, 2, "selector exposes two local scenarios")
	_assert_equal(scene.get_scenario_path(), DEFAULT_SCENARIO_PATH, "fresh boot defaults to Scenario 1 path")
	_assert_equal(scene.get_selected_scenario_index(), 0, "fresh boot selects Scenario 1")
	_assert_equal(selector.selected, 0, "visible selector selects Scenario 1")
	_assert_contains(selector.get_item_text(0), "Scenario 1", "selector first item is Scenario 1")
	_assert_contains(selector.get_item_text(1), "Scenario 2", "selector second item is Scenario 2")
	_assert_contains(selector_status.text, "Draft training", "selector status shows draft chip copy")
	_assert_contains(selector_status.text, "Region A / VTS inactive", "selector status shows region/VTS status")
	_assert_contains(selector_status.text, "Not final maritime instruction.", "selector status shows non-final limit")

	var selector_snapshot: Dictionary = scene.get_scenario_selector_snapshot()
	_assert_equal(selector_snapshot["visible"], true, "selector is visible before start")
	_assert_equal(selector_snapshot["options"].size(), 2, "selector snapshot exposes local options")
	_assert_equal(selector_snapshot["options"][0]["path"], DEFAULT_SCENARIO_PATH, "selector snapshot Scenario 1 path")
	_assert_equal(selector_snapshot["options"][1]["path"], SCENARIO_TWO_PATH, "selector snapshot Scenario 2 path")

	var select_two: Dictionary = scene.select_scenario_index(1)
	_assert_equal(select_two["scenario_path"], SCENARIO_TWO_PATH, "selecting Scenario 2 sets local path")
	_assert_equal(select_two["loader_error"], {}, "Scenario 2 selector load has no loader error")
	_assert_equal(scene.get_selected_scenario_index(), 1, "selected index is Scenario 2")
	_assert_equal(selector.selected, 1, "visible selector updates to Scenario 2")
	var scenario_two_snapshot: Dictionary = scene.get_runtime_snapshot()
	_assert_equal(scenario_two_snapshot["tick"], 0, "Scenario 2 selector reset tick")
	_assert_equal(scenario_two_snapshot["scenario_result"], "ready", "Scenario 2 selector reset ready")
	_assert_equal(scenario_two_snapshot.has("scenario_two"), true, "Scenario 2 selector boots Scenario 2 branch")
	_assert_contains(scene.get_hud_text_snapshot()["briefing"], "Head-On Port-to-Port Drill", "Scenario 2 briefing appears after selector")
	_assert_contains(selector_status.text, "Available locally", "Scenario 2 selector status shows local availability")

	scene.queue_keyboard_input(KEY_SPACE, true)
	_assert_equal(scene.get_local_attempt_state(), "running", "start hides selector by entering running state")
	_assert_equal(selector.visible, false, "selector hides while running")
	_assert_equal(selector_status.visible, false, "selector status hides while running")

	scene.queue_keyboard_input(KEY_R, true)
	_assert_equal(scene.get_scenario_path(), SCENARIO_TWO_PATH, "reset preserves Scenario 2 selection")
	_assert_equal(scene.get_selected_scenario_index(), 1, "reset keeps Scenario 2 selected")
	_assert_equal(selector.visible, true, "selector returns after reset")
	_assert_equal(scene.get_runtime_snapshot().has("scenario_two"), true, "reset still boots Scenario 2")

	var select_one: Dictionary = scene.select_scenario_index(0)
	_assert_equal(select_one["scenario_path"], DEFAULT_SCENARIO_PATH, "selector can return to Scenario 1")
	_assert_equal(select_one["loader_error"], {}, "Scenario 1 selector reload has no loader error")
	_assert_equal(scene.get_selected_scenario_index(), 0, "selected index returns to Scenario 1")
	_assert_equal(selector.selected, 0, "visible selector returns to Scenario 1")
	var scenario_one_snapshot: Dictionary = scene.get_runtime_snapshot()
	_assert_equal(scenario_one_snapshot["tick"], 0, "Scenario 1 selector reset tick")
	_assert_equal(scenario_one_snapshot["scenario_result"], "ready", "Scenario 1 selector reset ready")
	_assert_equal(scenario_one_snapshot.has("scenario_two"), false, "Scenario 1 selector does not expose Scenario 2 branch")
	_assert_contains(scene.get_hud_text_snapshot()["briefing"], "Safe Water, Crossing Target", "Scenario 1 briefing restored")

	var invalid_select: Dictionary = scene.select_scenario_index(9)
	_assert_equal(invalid_select["loader_error"]["code"], "invalid_scenario_index", "invalid selector index returns controlled error")
	_assert_equal(scene.get_scenario_path(), DEFAULT_SCENARIO_PATH, "invalid selector index preserves active path")

	var controller_source := _read_text_file(CONTROLLER_PATH)
	_assert_equal(controller_source.find("scripts/sim/"), -1, "selector does not add direct simulation imports")
	_assert_equal(controller_source.find("ScenarioTwoHeadOnClassifier"), -1, "selector does not call Scenario 2 classifier directly")
	_assert_equal(controller_source.find("ScenarioTwoPassEventDetector"), -1, "selector does not call Scenario 2 pass detector directly")
	_assert_equal(controller_source.find("router"), -1, "selector does not add route dependency")
	_assert_equal(controller_source.find("registry"), -1, "selector does not add registry dependency")

	var selector_text := "%s\n%s\n%s" % [
		selector.get_item_text(0),
		selector.get_item_text(1),
		selector_status.text
	]
	_assert_not_contains(selector_text, "official", "selector avoids official claim")
	_assert_not_contains(selector_text, "certified", "selector avoids certified claim")
	_assert_not_contains(selector_text, "COLREGS", "selector avoids COLREGS claim")
	_assert_not_contains(selector_text, "legally correct", "selector avoids legal correctness claim")

	scene.queue_free()
	print("scenario_selector_local_flow_test: %s passed, %s failed" % [_passed, _failed])
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
