extends SceneTree

const SCENE_PATH := "res://scenes/playable_greybox_scene.tscn"
const HUD_BINDER_PATH := "res://scripts/ui/hud_snapshot_binder.gd"

var _failed := 0
var _passed := 0


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var main_scene_path := str(ProjectSettings.get_setting("application/run/main_scene", ""))
	_assert_equal(main_scene_path, SCENE_PATH, "scene still loads as project main scene")

	var packed_scene: PackedScene = load(SCENE_PATH)
	_assert_equal(packed_scene != null, true, "playable greybox scene loads for HUD test")

	var scene := packed_scene.instantiate()
	root.add_child(scene)
	await process_frame

	var snapshot: Dictionary = scene.get_runtime_snapshot()
	var hud_text: Dictionary = scene.get_hud_text_snapshot()

	_assert_equal(hud_text.has("instrument_strip"), true, "HUD exposes instrument strip section")
	_assert_equal(hud_text.has("warning_stack"), true, "HUD exposes warning stack section")
	_assert_equal(hud_text.has("result_status"), true, "HUD exposes result status section")
	_assert_equal(hud_text.has("debug_status"), true, "HUD exposes debug/non-final section")
	_assert_equal(hud_text.has("cue_legend"), true, "HUD exposes cue legend section")
	_assert_equal(hud_text.has("controls"), true, "HUD exposes controls section")

	_assert_contains(str(hud_text["instrument_strip"]), "Tick %s" % snapshot["tick"], "HUD binds tick from runtime snapshot")
	_assert_contains(str(hud_text["instrument_strip"]), "Time %.2fs" % float(snapshot["time_sec"]), "HUD binds time from runtime snapshot")
	_assert_contains(str(hud_text["instrument_strip"]), "HDG %.1f deg" % float(snapshot["ownship"]["heading_deg"]), "HUD binds heading from runtime snapshot ownship")
	_assert_contains(str(hud_text["instrument_strip"]), "Speed %s" % snapshot["ownship"]["speed_level"], "HUD binds speed from runtime snapshot ownship")
	_assert_contains(str(hud_text["instrument_strip"]), "Safe water %s" % snapshot["safe_water"]["state"], "HUD binds safe-water state from runtime snapshot")
	_assert_contains(str(hud_text["result_status"]), "CPA/TCPA: %s" % snapshot["cpa_tcpa"]["state"], "HUD binds CPA/TCPA qualitative state")
	_assert_contains(str(hud_text["warning_stack"]), "Primary: none", "HUD binds null primary warning as readable none")
	_assert_contains(str(hud_text["result_status"]), "State: %s" % snapshot["scenario_result"], "HUD binds scenario result")
	_assert_contains(str(hud_text["result_status"]), "VTS: %s/%s" % [str(snapshot["vts"]["enabled"]), snapshot["vts"]["state"]], "HUD binds VTS disabled/inactive state")
	_assert_contains(str(hud_text["debug_status"]), "draft_training: %s" % str(snapshot["draft_training"]), "HUD exposes draft/non-final snapshot status")
	_assert_contains(str(hud_text["debug_status"]), "rule_review: %s" % snapshot["scenario_static"]["rule_review_status"], "HUD exposes rule review status")
	_assert_contains(str(hud_text["debug_status"]), "training_claim: %s" % snapshot["scenario_static"]["training_claim_status"], "HUD exposes training claim status")
	_assert_contains(str(hud_text["debug_status"]), "QA seed %s" % snapshot["qa"]["seed"], "QA/debug fields are visibly separated")
	_assert_contains(str(hud_text["cue_legend"]), "Region A lateral pair", "HUD cue legend describes Region A lateral pair")
	_assert_contains(str(hud_text["cue_legend"]), "AIS vector", "HUD cue legend describes target AIS vector cue")
	_assert_contains(str(hud_text["controls"]), "A/Left port", "HUD controls legend includes port turn")
	_assert_contains(str(hud_text["controls"]), "D/Right starboard", "HUD controls legend includes starboard turn")
	_assert_contains(str(hud_text["controls"]), "Q/Down speed down", "HUD controls legend includes speed down")
	_assert_contains(str(hud_text["controls"]), "E/Up speed up", "HUD controls legend includes speed up")
	_assert_contains(str(hud_text["controls"]), "R reset", "HUD controls legend includes reset")

	_assert_equal(scene.get_node_or_null("HudLayer/WarningStackLabel") != null, true, "warning stack label exists as screen HUD node")
	_assert_equal(scene.get_node_or_null("HudLayer/ResultStatusLabel") != null, true, "result label exists as screen HUD node")
	_assert_equal(scene.get_node_or_null("HudLayer/DebugStatusLabel") != null, true, "draft/debug label exists as screen HUD node")
	_assert_equal(scene.get_node_or_null("HudLayer/CueLegendLabel") != null, true, "cue legend label exists as screen HUD node")
	_assert_equal(scene.get_node_or_null("HudLayer/VtsPopup") == null, true, "VTS popup remains absent for scenario 1")

	var before_snapshot: Dictionary = scene.get_runtime_snapshot()
	var after_hud_read: Dictionary = scene.get_runtime_snapshot()
	_assert_equal(after_hud_read, before_snapshot, "reading HUD text does not mutate runtime snapshot")

	var step_result: Dictionary = scene.advance_one_tick([])
	var stepped_snapshot: Dictionary = step_result["runtime_snapshot"]
	var stepped_hud_text: Dictionary = scene.get_hud_text_snapshot()
	_assert_contains(str(stepped_hud_text["instrument_strip"]), "Tick %s" % stepped_snapshot["tick"], "HUD tick updates after orchestrator step")
	_assert_contains(str(stepped_hud_text["instrument_strip"]), "Time %.2fs" % float(stepped_snapshot["time_sec"]), "HUD time updates after orchestrator step")
	_assert_contains(str(stepped_hud_text["result_status"]), "State: %s" % stepped_snapshot["scenario_result"], "HUD result updates after orchestrator step")

	var hud_source := _read_text_file(HUD_BINDER_PATH)
	_assert_equal(hud_source.find("scripts/sim/"), -1, "HUD binder does not import simulation modules")
	_assert_equal(hud_source.find("CpaTcpaDebugSolver"), -1, "HUD binder does not compute CPA/TCPA")
	_assert_equal(hud_source.find("ScenarioResultEvaluator"), -1, "HUD binder does not compute result state")
	_assert_equal(hud_source.find("WarningEscalationPipeline"), -1, "HUD binder does not compute warnings")
	_assert_equal(hud_source.find("SafeWaterGeometryMonitor"), -1, "HUD binder does not compute safe-water state")
	_assert_equal(hud_source.find("ScenarioOneEncounterClassifier"), -1, "HUD binder does not compute encounter class")

	scene.queue_free()
	print("hud_binding_readability_pack_test: %s passed, %s failed" % [_passed, _failed])
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
